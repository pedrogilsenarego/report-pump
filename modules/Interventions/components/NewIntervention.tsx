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
import { useChecklists } from "@/hook/useChecklist";
import useNewIntervention from "./useNewIntervention";
import { useInstallations } from "@/hook/useInstallation";

export default function NewIntervention() {
  const { form, onSubmit, openModal, setOpenModal } = useNewIntervention();
  const { data: checklists, isLoading: isLoadingChecklists } = useChecklists();
  const { data: installations, isLoading: isLoadingInstallations } =
    useInstallations();
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
                    defaultValue={checklists?.[0].id}
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
                          <SelectItem key={checklist.id} value={checklist.id}>
                            {checklist.nfpaEd}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a checklist for the intervention if there is none.
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
                    defaultValue={field.value}
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

            <DialogFooter>
              <Button type="submit">Start Checklist</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
