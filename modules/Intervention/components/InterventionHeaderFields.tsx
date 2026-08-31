"use client";

import { Control, Controller } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCtrlStatus } from "@/hook/useCtrlStatus";
import { useTechnicians } from "@/hook/useTechnician";
import { i18n } from "@/translations/i18n";
import { localizedName } from "@/utils/localizedName";

/**
 * The INTERVENTION header fields the spec asks for alongside the answers (sheet 5/6:
 * "INPUT all fields from table.INTERVENTION ... TECHNICIAN_INT1 / TECHNICIAN_INT2 /
 * CTRL_STATUS").
 *
 * Verifyed_By / Responsable carry spec note [1] — "this field must have one occurence from
 * tables TECHNICIAN_INT1 or TECHNICIAN_INT2" — so both are selects over the two technicians
 * chosen above them, not free text. Picking a technician away from a slot clears any header
 * field that named them, which is what keeps the rule true without a DB constraint that
 * would have to span tables.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function InterventionHeaderFields({
  control,
  slot1,
  slot2,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  slot1?: string;
  slot2?: string;
}) {
  const ctrlStatus = useCtrlStatus();
  const technicians = useTechnicians();

  const all = technicians.data || [];
  // Only technicians actually on this intervention can verify or be responsible for it.
  const chosen = all.filter(
    (technician) =>
      String(technician.id) === slot1 || String(technician.id) === slot2
  );

  const technicianSelect = (
    name: string,
    label: string,
    exclude?: string
  ) => (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{label}</span>
          <Select onValueChange={field.onChange} value={field.value ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder={i18n.t("intervention.selectPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {all
                .filter((technician) => String(technician.id) !== exclude)
                .map((technician) => (
                  <SelectItem
                    key={technician.id}
                    value={String(technician.id)}
                  >
                    {technician.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </label>
      )}
    />
  );

  const nameSelect = (name: string, label: string) => (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field }) => (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{label}</span>
          <Select
            onValueChange={field.onChange}
            value={field.value ?? ""}
            disabled={!chosen.length}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  chosen.length
                    ? i18n.t("intervention.selectPlaceholder")
                    : i18n.t("intervention.pickTechniciansFirst")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {chosen.map((technician) => (
                <SelectItem key={technician.id} value={technician.name}>
                  {technician.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      )}
    />
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 border rounded-sm p-4 mb-6">
      {technicianSelect(
        "technician1",
        i18n.t("intervention.technician1"),
        slot2
      )}
      {technicianSelect(
        "technician2",
        i18n.t("intervention.technician2"),
        slot1
      )}

      <Controller
        name="controlerStatus"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {i18n.t("intervention.controlerStatus")}
            </span>
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <SelectTrigger>
                <SelectValue
                  placeholder={i18n.t("intervention.selectPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {(ctrlStatus.data || []).map((status) => (
                  <SelectItem key={status.code} value={status.code}>
                    {localizedName(status.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}
      />

      {nameSelect("verifyedBy", i18n.t("intervention.verifyedBy"))}
      {nameSelect("responsable", i18n.t("intervention.responsable"))}

      <Controller
        name="refMonth"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {i18n.t("intervention.refMonth")}
            </span>
            {/*
              INTERVENTION.Ref_Month S(10) — the key every "select one Intervention" pop-up
              on sheet 5/6 shows the user, so it is worth collecting up front.
            */}
            <Input {...field} placeholder="yyyy.mm" />
          </label>
        )}
      />
    </div>
  );
}
