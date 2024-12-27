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
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useNewChecklist from "./useNewChecklist";

export default function NewChecklist() {
  const { form, onSubmit, openModal, setOpenModal, isPending } =
    useNewChecklist();

  return (
    <Dialog open={openModal} onOpenChange={(value) => setOpenModal(value)}>
      <DialogTrigger asChild>
        <Button variant="outline">New Checklist</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 w-full"
          >
            <DialogHeader>
              <DialogTitle>Create new checklist</DialogTitle>
              <DialogDescription>
                Choose which actions you want to use.
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="nfpaEd"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Name of npaEd" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button isLoading={isPending} type="submit">
                Start Checklist
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
