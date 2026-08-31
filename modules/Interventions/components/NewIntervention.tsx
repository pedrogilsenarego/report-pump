"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReloadIcon } from "@radix-ui/react-icons";
import useNewIntervention from "./useNewIntervention";
import { useInstallations } from "@/hook/useInstallation";
import { PERIODICITY, periodLabel } from "@/constants/actions";

export default function NewIntervention() {
  const {
    form,
    onSubmit,
    openModal,
    setOpenModal,
    checklists,
    isLoadingChecklists,
    pumps,
    isLoadingPumps,
  } = useNewIntervention();

  const { data: installations, isLoading: isLoadingInstallations } =
    useInstallations();
  const installationId = form.watch("installationId");
  return (
    <Dialog open={openModal} onOpenChange={(value) => setOpenModal(value)}>
      <DialogTrigger asChild>
        <Button variant="outline">New Intervention</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 w-full"
          >
            <DialogHeader>
              <DialogTitle>Create new intervention</DialogTitle>
              <DialogDescription>
                Choose which checklist you want to use.
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="checklistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Checklist</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      {isLoadingChecklists ? (
                        <div className="flex items-center justify-center">
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <SelectTrigger>
                          <SelectValue placeholder="Select a checklist" />
                        </SelectTrigger>
                      )}
                    </FormControl>
                    <SelectContent>
                      {checklists?.map((checklist) => {
                        return (
                          <SelectItem
                            key={checklist.id}
                            value={String(checklist.id)}
                          >
                            {checklist.nfpaEd}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The check-list template this report is filled against.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="installationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Installation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      {isLoadingInstallations ? (
                        <div className="flex items-center justify-center">
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <SelectTrigger>
                          <SelectValue placeholder="Select an installation" />
                        </SelectTrigger>
                      )}
                    </FormControl>
                    <SelectContent>
                      {installations?.map((installation) => {
                        return (
                          <SelectItem
                            key={installation.id}
                            value={installation.id}
                          >
                            {installation.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a Installation for the intervention if there is none.
                    Create one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/*
              An intervention belongs to a PUMP GROUP (spec key Code_Pump_Gr), inside an
              installation. The list narrows to the chosen installation, so this field sits
              after it.
            */}
            <FormField
              control={form.control}
              name="pumpId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pump Group</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={!installationId}
                  >
                    <FormControl>
                      {isLoadingPumps ? (
                        <div className="flex items-center justify-center">
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              installationId
                                ? "Select a pump group"
                                : "Select an installation first"
                            }
                          />
                        </SelectTrigger>
                      )}
                    </FormControl>
                    <SelectContent>
                      {pumps.map((pump) => (
                        <SelectItem key={pump.id} value={String(pump.id)}>
                          {pump.type || pump.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {installationId && !pumps.length
                      ? "There are no Pump Groups defined for this Installation!"
                      : "The pump group this report covers."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PERIODICITY.map((entry) => (
                        <SelectItem key={entry.code} value={String(entry.code)}>
                          {periodLabel(entry.code)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often this round of checks is performed. A round also
                    includes every more frequent check.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Start Checklist</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
