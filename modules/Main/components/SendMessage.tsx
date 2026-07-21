"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hook/useUser";
import { i18n } from "@/translations/i18n";
import { sendMessage } from "@/actions/clientActions/message.actions";

/**
 * "Send message" popup (CUSTOMER MENU spec): a single text field with
 * Cancel / OK. On OK the text is emailed to the administrator.
 */
export default function SendMessage() {
  const { toast } = useToast();
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: sendMessage,
    onError: (error: string) => {
      toast({
        variant: "destructive",
        title: i18n.t("sendMessage.error"),
        description: error,
      });
    },
    onSuccess: () => {
      toast({
        variant: "default",
        title: i18n.t("sendMessage.success"),
        description: i18n.t("sendMessage.successDescription"),
      });
      setText("");
      setOpen(false);
    },
  });

  const handleSend = () => {
    if (!text.trim()) return;
    mutate({ message: text, from: user.data?.email });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setText("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">{i18n.t("sendMessage.button")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{i18n.t("sendMessage.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {i18n.t("sendMessage.label")}
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={i18n.t("sendMessage.placeholder")}
            className="min-h-[120px]"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {i18n.t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={isPending || !text.trim()}
          >
            {i18n.t("sendMessage.send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
