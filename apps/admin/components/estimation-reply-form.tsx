"use client";

import { useState } from "react";
import { replyToEstimation } from "@/lib/actions/estimations";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Textarea } from "@repo/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface EstimationReplyFormProps {
  estimationId: string;
}

export function EstimationReplyForm({ estimationId }: EstimationReplyFormProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    const result = await replyToEstimation(estimationId, message.trim());
    setSending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Réponse envoyée !");
      setMessage("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Votre réponse..."
        rows={4}
      />
      <Button type="submit" disabled={sending || !message.trim()} size="sm">
        <Send className="mr-2 h-3.5 w-3.5" />
        {sending ? "Envoi..." : "Envoyer la réponse"}
      </Button>
    </form>
  );
}
