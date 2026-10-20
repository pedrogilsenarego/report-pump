"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReloadIcon } from "@radix-ui/react-icons";
import { UseFormReturn } from "react-hook-form";
import {
  PUMP_SUB_TYPES,
  PUMP_TYPES,
  pumpSubTypeLabel,
  pumpTypeLabel,
} from "@/constants/pumpGroup";
import { useInstallations } from "@/hook/useInstallation";
import { isActiveInstallation } from "@/constants/condition";
import { i18n } from "@/translations/i18n";
import { NewPumpType } from "./NewPump.validation";

type TextField = Exclude<keyof NewPumpType, "installationId" | "type" | "subType">;

const t = (key: string) => i18n.t(`pumpGroup.${key}`);

/**
 * The six blocks of Screen#13 (new) and Screen#14 (edit), in the same order REPORT#02 prints
 * them. Labels marked (*) are the spec's required fields.
 */
const BLOCKS: { title: string; fields: { name: TextField; label: string; required?: boolean }[] }[] = [
  {
    title: "blockMotor",
    fields: [
      { name: "motorBrand", label: "brand", required: true },
      { name: "motorModel", label: "model" },
      { name: "motorTag", label: "tag" },
      { name: "motorSn", label: "sn", required: true },
    ],
  },
  {
    title: "blockController",
    fields: [
      { name: "ctrlBrand", label: "brand", required: true },
      { name: "ctrlModel", label: "model" },
      { name: "ctrlType", label: "ctrlType" },
      { name: "ctrlTag", label: "tag" },
    ],
  },
  {
    title: "blockCoupling",
    fields: [
      { name: "couplingBrand", label: "brand" },
      { name: "couplingModel", label: "model" },
      { name: "couplingSn", label: "sn" },
    ],
  },
  {
    title: "blockGearbox",
    fields: [
      { name: "gearbBrand", label: "brand" },
      { name: "gearbModel", label: "model" },
      { name: "gearbSn", label: "sn" },
    ],
  },
  {
    title: "blockVtPumps",
    fields: [
      { name: "columnLength", label: "columnLength" },
      { name: "nrStages", label: "nrStages" },
    ],
  },
];

const PUMP_TEXT_FIELDS: { name: TextField; label: string; required?: boolean }[] = [
  { name: "pumpTag", label: "tag" },
  { name: "pumpBrand", label: "brand", required: true },
  { name: "pumpModel", label: "model", required: true },
  { name: "pumpSn", label: "sn", required: true },
];

const labelOf = (label: string, required?: boolean) =>
  required ? `${t(label)} (*)` : t(label);

function TextInput({
  form,
  name,
  label,
  required,
}: {
  form: UseFormReturn<NewPumpType>;
  name: TextField;
  label: string;
  required?: boolean;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{labelOf(label, required)}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-md border p-3">
      <legend className="px-1 text-sm font-medium">{t(title)}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function PumpGroupFields({
  form,
}: {
  form: UseFormReturn<NewPumpType>;
}) {
  const { data: installations, isLoading: isLoadingInstallations } =
    useInstallations();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="installationId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labelOf("installation", true)}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                {isLoadingInstallations ? (
                  <div className="flex items-center justify-center">
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectInstallation")} />
                  </SelectTrigger>
                )}
              </FormControl>
              <SelectContent>
                {installations
                  ?.filter(
                    (installation) =>
                      isActiveInstallation(installation.condition) ||
                      String(installation.id) === field.value
                  )
                  .map((installation) => (
                  <SelectItem key={installation.id} value={String(installation.id)}>
                    {installation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <Block title="blockPump">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labelOf("type", true)}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PUMP_TYPES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code} — {pumpTypeLabel(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labelOf("subType", true)}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PUMP_SUB_TYPES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code} — {pumpSubTypeLabel(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {PUMP_TEXT_FIELDS.map((f) => (
          <TextInput key={f.name} form={form} {...f} />
        ))}
      </Block>

      {BLOCKS.map((block) => (
        <Block key={block.title} title={block.title}>
          {block.fields.map((f) => (
            <TextInput key={f.name} form={form} {...f} />
          ))}
        </Block>
      ))}

      <p className="text-xs text-muted-foreground">{t("requiredFields")}</p>
    </div>
  );
}
