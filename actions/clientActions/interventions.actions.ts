/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  mapInterventionResults,
  mapInterventions,
  mapIntervention,
  mapInterventionToRaw,
} from "@/mappers/interventions.mapper";
import {
  AnswerDraft,
  Intervention,
  InterventionDetail,
  InterventionHeaderDraft,
  NewInterventionInput,
  UpdateInterventionInput,
} from "@/types/interventions.types";
import { getChecklistActions } from "./clActions.actions";

const supabase = supabaseBrowser();

const today = () => new Date().toISOString().slice(0, 10);

/**
 * The two administrator emails sheet 5/6 sends on "Save and lock Report? -> OK": the failed
 * actions plus every INT_NOTES row.
 *
 * Deliberately non-fatal. The lock is already committed by the time this runs, and the spec
 * gives no unlock path, so a bounced SMTP connection must not make the save look like it
 * failed. The caller surfaces it as a warning instead.
 */
const notifyFinalised = async (
  interventionId: number
): Promise<string | null> => {
  try {
    const response = await fetch("/api/interventions/finalise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interventionId }),
    });

    if (response.ok) return null;

    const data = await response.json().catch(() => ({}));
    return data?.message || "The administrator could not be notified.";
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "The administrator could not be notified.";
  }
};

/** A save always yields the id; `warning` carries a non-fatal problem such as failed mail. */
export type InterventionSaveResult = {
  interventionId: number;
  warning?: string | null;
};

const answerKey = (answer: AnswerDraft) =>
  `${answer.action.codeGroup}.${answer.action.codeSubgroup}.${answer.action.code}`;

export const getInterventions = async (): Promise<Intervention[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("interventions")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching interventions:", error);
    throw new Error(error.message);
  }

  return mapInterventions(data || []);
};

// ---------------------------------------------------------------------------
// Row builders — shared by create and update so the two paths cannot drift.
// ---------------------------------------------------------------------------

const resultRowsFor = (interventionId: number, answered: AnswerDraft[]) =>
  answered.map((answer) => ({
    intervention_id: interventionId,
    cl_action_id: answer.action.id,
    checklist_id: answer.action.checklistId,
    code_gr: answer.action.codeGroup,
    code_sub_gr: answer.action.codeSubgroup,
    code_action: answer.action.code,
    result: answer.result,
  }));

const measurementRowsFor = (interventionId: number, answered: AnswerDraft[]) =>
  answered.flatMap((answer) =>
    answer.action.values
      .map((slot) => ({ slot, raw: answer.measurements?.[slot.code] }))
      // A blank reading is not a zero — skip it rather than record 0.
      .filter(({ raw }) => raw != null && String(raw).trim() !== "")
      .map(({ slot, raw }) => ({
        intervention_id: interventionId,
        cl_action_values_id: slot.id,
        checklist_id: answer.action.checklistId,
        code_gr: answer.action.codeGroup,
        code_sub_gr: answer.action.codeSubgroup,
        code_action: answer.action.code,
        code_values: slot.code,
        value: Number(String(raw).replace(",", ".")),
      }))
      .filter((row) => Number.isFinite(row.value))
  );

const technicianRowsFor = (
  interventionId: number,
  header: InterventionHeaderDraft
) =>
  [
    { slot: 1, profile_id: header.technician1 },
    { slot: 2, profile_id: header.technician2 },
  ]
    .filter((row) => !!row.profile_id)
    .map((row) => ({
      intervention_id: interventionId,
      slot: row.slot,
      profile_id: row.profile_id as string,
    }));

/**
 * Verifyed_By / Responsable carry spec note [1]: each must name one of the intervention's
 * own technicians. The form already restricts the choices, but a stale value can survive a
 * technician being swapped out of a slot, so it is dropped here rather than saved as a name
 * that no longer belongs to the report.
 */
const headerNames = (
  header: InterventionHeaderDraft,
  technicianNames: string[]
) => ({
  verifyedBy: technicianNames.includes(header.verifyedBy || "")
    ? header.verifyedBy
    : undefined,
  responsable: technicianNames.includes(header.responsable || "")
    ? header.responsable
    : undefined,
});

const namesForSlots = async (
  header: InterventionHeaderDraft
): Promise<string[]> => {
  const ids = [header.technician1, header.technician2].filter(
    Boolean
  ) as string[];
  if (!ids.length) return [];

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", ids);

  return (data || []).map((row: any) => row.display_name).filter(Boolean);
};

/**
 * Writes the answer tree for an intervention that already exists.
 *
 * Results and measurements are UPSERTed on their identity keys rather than
 * deleted-and-reinserted, so a failure cannot wipe recorded field data — it just leaves the
 * previous values in place. Rows the user has since cleared are removed afterwards, once
 * the new ones are safely in.
 *
 * Notes have no natural key (an action can carry several), so they are replaced. That is
 * the one destructive step; it runs last, and the form still holds the text on failure.
 */
const writeAnswers = async (
  interventionId: number,
  answers: AnswerDraft[],
  generalNote: string | undefined,
  { replace }: { replace: boolean }
): Promise<string | null> => {
  const answered = answers.filter((answer) => !!answer.result);

  const resultRows = resultRowsFor(interventionId, answered);
  let insertedResults: any[] = [];

  if (resultRows.length) {
    const { data, error } = await supabase
      .from("int_result")
      .upsert(resultRows, {
        onConflict:
          "intervention_id,checklist_id,code_gr,code_sub_gr,code_action",
      })
      .select("id, code_gr, code_sub_gr, code_action");

    if (error) {
      console.error("Error writing intervention results:", error);
      return error.message;
    }
    insertedResults = data || [];
  }

  if (replace) {
    // Drop answers the user cleared. Deleting an int_result cascades its notes.
    const keep = new Set(answered.map(answerKey));
    const { data: existing } = await supabase
      .from("int_result")
      .select("id, code_gr, code_sub_gr, code_action")
      .eq("intervention_id", interventionId);

    const stale = (existing || [])
      .filter(
        (row: any) =>
          !keep.has(`${row.code_gr}.${row.code_sub_gr}.${row.code_action}`)
      )
      .map((row: any) => row.id);

    if (stale.length) {
      const { error } = await supabase
        .from("int_result")
        .delete()
        .in("id", stale);
      if (error) {
        console.error("Error clearing removed results:", error);
        return error.message;
      }
    }
  }

  const measurementRows = measurementRowsFor(interventionId, answered);

  if (measurementRows.length) {
    const { error } = await supabase.from("measurements").upsert(
      measurementRows,
      {
        onConflict:
          "intervention_id,checklist_id,code_gr,code_sub_gr,code_action,code_values",
      }
    );
    if (error) {
      console.error("Error writing measurements:", error);
      return error.message;
    }
  }

  if (replace) {
    const keptSlots = new Set(
      measurementRows.map(
        (row) =>
          `${row.code_gr}.${row.code_sub_gr}.${row.code_action}.${row.code_values}`
      )
    );
    const { data: existing } = await supabase
      .from("measurements")
      .select("id, code_gr, code_sub_gr, code_action, code_values")
      .eq("intervention_id", interventionId);

    const stale = (existing || [])
      .filter(
        (row: any) =>
          !keptSlots.has(
            `${row.code_gr}.${row.code_sub_gr}.${row.code_action}.${row.code_values}`
          )
      )
      .map((row: any) => row.id);

    if (stale.length) {
      const { error } = await supabase
        .from("measurements")
        .delete()
        .in("id", stale);
      if (error) {
        console.error("Error clearing removed measurements:", error);
        return error.message;
      }
    }
  }

  // Notes: replaced wholesale, last.
  if (replace) {
    const { error } = await supabase
      .from("int_notes")
      .delete()
      .eq("intervention_id", interventionId);
    if (error) {
      console.error("Error clearing notes:", error);
      return error.message;
    }
  }

  const resultIdByKey = new Map<string, number>();
  insertedResults.forEach((row: any) =>
    resultIdByKey.set(
      `${row.code_gr}.${row.code_sub_gr}.${row.code_action}`,
      row.id
    )
  );

  const noteRows: Array<{
    intervention_id: number;
    int_result_id: number | null;
    text: string;
  }> = answered
    .filter((answer) => answer.note && answer.note.trim())
    .map((answer) => ({
      intervention_id: interventionId,
      int_result_id: resultIdByKey.get(answerKey(answer)) ?? null,
      text: answer.note!.trim(),
    }));

  // "Add additional notes?" — a note about the intervention as a whole. The spec writes
  // Code_Interv_Result = 0 for this; the column is nullable here instead.
  if (generalNote && generalNote.trim()) {
    noteRows.push({
      intervention_id: interventionId,
      int_result_id: null,
      text: generalNote.trim(),
    });
  }

  if (noteRows.length) {
    const { error } = await supabase.from("int_notes").insert(noteRows);
    if (error) {
      console.error("Error writing intervention notes:", error);
      return error.message;
    }
  }

  return null;
};

const writeTechnicians = async (
  interventionId: number,
  header: InterventionHeaderDraft
): Promise<string | null> => {
  const { error: clearError } = await supabase
    .from("intervention_technicians")
    .delete()
    .eq("intervention_id", interventionId);

  if (clearError) {
    console.error("Error clearing intervention technicians:", clearError);
    return clearError.message;
  }

  const rows = technicianRowsFor(interventionId, header);
  if (!rows.length) return null;

  const { error } = await supabase
    .from("intervention_technicians")
    .insert(rows);

  if (error) {
    console.error("Error writing intervention technicians:", error);
    return error.message;
  }

  return null;
};

/**
 * Create New intervention (Screen#09 REPORTS).
 *
 * PostgREST cannot span statements in a transaction, so a failure part-way through triggers
 * a COMPENSATING DELETE of the intervention row, which cascades every child away. Same
 * approach as insertChecklistTree for Action#04 — a half-written report is worse than none,
 * because Locked/print would happily operate on it.
 *
 * Only answered actions are written: an INT_RESULT with no Result is not a valid row
 * (`result` is NOT NULL and CHECK'd), and "not answered" is the absence of a record.
 */
export const addIntervention = async (
  input: NewInterventionInput
): Promise<InterventionSaveResult> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const answered = input.answers.filter((answer) => !!answer.result);
  if (!answered.length) {
    throw new Error("An intervention must answer at least one action.");
  }

  const names = await namesForSlots(input);
  const { verifyedBy, responsable } = headerNames(input, names);
  const day = today();

  const { data: created, error: interventionError } = await supabase
    .from("interventions")
    .insert([
      mapInterventionToRaw({
        userId: user.id,
        installationId: input.installationId,
        checklistId: input.checklistId,
        pumpId: input.pumpId,
        period: input.period,
        dateStart: day,
        dateEnd: day,
        refMonth: input.refMonth,
        controlerStatus: input.controlerStatus,
        verifyedBy,
        responsable,
        locked: false,
      }),
    ])
    .select("id")
    .single();

  if (interventionError || !created?.id) {
    console.error("Error adding intervention:", interventionError);
    throw new Error(
      interventionError?.message || "Failed to create intervention"
    );
  }

  const interventionId = created.id as number;
  let warning: string | null = null;

  // Any failure past this point must not leave a partial report behind.
  const rollback = async (message: string): Promise<never> => {
    await supabase.from("interventions").delete().eq("id", interventionId);
    throw new Error(message);
  };

  const answerError = await writeAnswers(
    interventionId,
    input.answers,
    input.generalNote,
    { replace: false }
  );
  if (answerError) return rollback(answerError);

  const technicianError = await writeTechnicians(interventionId, input);
  if (technicianError) return rollback(technicianError);

  // "Save and lock Report?" — last, so a report is only ever locked once it is whole.
  if (input.lock) {
    const { error } = await supabase
      .from("interventions")
      .update({ locked: true, date_report: day })
      .eq("id", interventionId);

    if (error) return rollback(error.message);

    // Past this point the report exists and is locked; a mail failure is a warning, not a
    // reason to roll back work the user cannot redo.
    warning = await notifyFinalised(interventionId);
  }

  return { interventionId, warning };
};

/**
 * Finalise existing (Screen#09 REPORTS) — "EDIT (on Screen) all fields from
 * table.INTERVENTION.Code" followed by "Save and lock Report?".
 *
 * There is no compensating delete here: the intervention already existed and throwing it
 * away on a partial failure would destroy the very data the user is editing. Instead the
 * writes are ordered so the destructive step (notes) runs last, and everything else upserts.
 */
export const updateIntervention = async (
  input: UpdateInterventionInput
): Promise<InterventionSaveResult> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data: current, error: readError } = await supabase
    .from("interventions")
    .select("locked")
    .eq("id", input.interventionId)
    .single();

  if (readError) {
    console.error("Error reading intervention:", readError);
    throw new Error(readError.message);
  }

  // A locked report is the printable artifact and the copy the administrator was emailed.
  // The spec draws no unlock path, so editing one is refused rather than silently allowed.
  if (current?.locked) {
    throw new Error("This report is locked and can no longer be edited.");
  }

  const names = await namesForSlots(input);
  const { verifyedBy, responsable } = headerNames(input, names);
  const day = today();
  let warning: string | null = null;

  const { error: headerError } = await supabase
    .from("interventions")
    .update({
      ref_month: input.refMonth,
      controler_status: input.controlerStatus,
      verifyed_by: verifyedBy,
      responsable,
      date_end: day,
    })
    .eq("id", input.interventionId);

  if (headerError) {
    console.error("Error updating intervention:", headerError);
    throw new Error(headerError.message);
  }

  const answerError = await writeAnswers(
    input.interventionId,
    input.answers,
    input.generalNote,
    { replace: true }
  );
  if (answerError) throw new Error(answerError);

  const technicianError = await writeTechnicians(input.interventionId, input);
  if (technicianError) throw new Error(technicianError);

  if (input.lock) {
    const { error } = await supabase
      .from("interventions")
      .update({ locked: true, date_report: day })
      .eq("id", input.interventionId);

    if (error) throw new Error(error.message);

    warning = await notifyFinalised(input.interventionId);
  }

  return { interventionId: input.interventionId, warning };
};

/**
 * SET table.INTERVENTION.Locked = 2 (sheet 5/6).
 *
 * Locking is one-way: the spec has no unlock path, because a locked report is the printable
 * artifact and the thing emailed to the administrator.
 */
export const lockIntervention = async (
  interventionId: number
): Promise<InterventionSaveResult> => {
  const { error } = await supabase
    .from("interventions")
    .update({ locked: true, date_report: today() })
    .eq("id", interventionId);

  if (error) {
    console.error("Error locking intervention:", error);
    throw new Error(error.message);
  }

  return { interventionId, warning: await notifyFinalised(interventionId) };
};

/**
 * One intervention with everything the report prints.
 *
 * Separate reads rather than one nested select: int_result -> cl_action is a nullable FK and
 * measurements join by composite code, neither of which PostgREST can embed usefully. The
 * template actions come from getChecklistActions so name/type/source resolve through the
 * same code path the answer form uses.
 */
export const getIntervention = async ({
  interventionId,
}: {
  interventionId?: number;
}): Promise<InterventionDetail> => {
  if (!interventionId) throw new Error("No intervention id");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data: interventionRow, error: interventionError } = await supabase
    .from("interventions")
    .select("*")
    .eq("id", interventionId)
    .single();

  if (interventionError) {
    console.error("Error fetching intervention:", interventionError);
    throw new Error(interventionError.message);
  }

  const [results, measurements, notes, technicians] = await Promise.all([
    supabase
      .from("int_result")
      .select(
        "id, cl_action_id, checklist_id, code_gr, code_sub_gr, code_action, result"
      )
      .eq("intervention_id", interventionId),
    supabase
      .from("measurements")
      .select("code_gr, code_sub_gr, code_action, code_values, value")
      .eq("intervention_id", interventionId),
    supabase
      .from("int_notes")
      .select("int_result_id, text")
      .eq("intervention_id", interventionId),
    supabase
      .from("intervention_technicians")
      .select("slot, profile_id, profiles ( display_name )")
      .eq("intervention_id", interventionId),
  ]);

  const failed = [results, measurements, notes, technicians].find(
    (r) => r.error
  );
  if (failed?.error) {
    console.error("Error fetching intervention detail:", failed.error);
    throw new Error(failed.error.message);
  }

  const actions = await getChecklistActions(interventionRow.checklist_id);

  return {
    intervention: mapIntervention(interventionRow),
    results: mapInterventionResults(
      (results.data || []) as any,
      (measurements.data || []) as any,
      (notes.data || []) as any,
      actions
    ),
    generalNotes: (notes.data || [])
      .filter((note: any) => note.int_result_id == null)
      .map((note: any) => note.text),
    technicians: (technicians.data || []).map((row: any) => ({
      slot: row.slot,
      profileId: row.profile_id,
      name: row.profiles?.display_name,
    })),
  };
};
