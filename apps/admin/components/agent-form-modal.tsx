"use client";

import { useState } from "react";
import { createAgent, updateAgent, deleteAgent, resendAgentInvite } from "@/lib/actions/agents";
import { useRouter } from "next/navigation";
import type { Agent } from "@repo/shared/supabase/types";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Checkbox } from "@repo/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { AGENT_ROLES } from "@repo/shared/constants";
import { Plus, Pencil, Send } from "lucide-react";
import { toast } from "sonner";

export function AgentFormModal({ agent }: { agent?: Agent }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>(agent?.role || "agent");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = agent
      ? await updateAgent(agent.id, formData)
      : await createAgent(formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!agent) return;
    await deleteAgent(agent.id);
    setOpen(false);
    router.refresh();
  }

  async function handleResendInvite() {
    if (!agent) return;
    const result = await resendAgentInvite(agent.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Invitation renvoyée !");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {agent ? (
        <DialogTrigger render={<Button variant="ghost" size="sm" />}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Modifier
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un agent
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{agent ? "Modifier l'agent" : "Nouvel agent"}</DialogTitle>
          <DialogDescription>
            {agent ? "Modifiez les informations de l'agent." : "Ajoutez un nouveau membre à l'équipe."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom *</Label>
              <Input name="first_name" id="first_name" required defaultValue={agent?.first_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom *</Label>
              <Input name="last_name" id="last_name" required defaultValue={agent?.last_name} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input name="email" id="email" type="email" required defaultValue={agent?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input name="phone" id="phone" defaultValue={agent?.phone || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea name="bio" id="bio" rows={3} defaultValue={agent?.bio || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              name="role"
              value={role}
              onValueChange={(v) => v && setRole(v)}
            >
              <SelectTrigger id="role">
                <SelectValue>
                  {AGENT_ROLES.find((r) => r.value === role)?.label ?? role}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {AGENT_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is_active" name="is_active" defaultChecked={agent?.is_active ?? true} />
            <Label htmlFor="is_active" className="font-normal">Actif (visible sur le site)</Label>
          </div>
          {!agent && (
            <div className="flex items-center space-x-2">
              <Checkbox id="send_invite" name="send_invite" defaultChecked={true} />
              <Label htmlFor="send_invite" className="font-normal">
                Envoyer une invitation par email
              </Label>
            </div>
          )}
          {agent && agent.user_id && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResendInvite}
            >
              <Send className="mr-2 h-3.5 w-3.5" />
              Renvoyer l'invitation
            </Button>
          )}
          {agent && !agent.user_id && (
            <p className="text-xs text-muted-foreground">
              Cet agent n'a pas de compte. Supprimez-le et recréez-le avec une invitation.
            </p>
          )}
          <DialogFooter className="flex-row justify-between sm:justify-between">
            {agent && (
              <AlertDialog>
                <AlertDialogTrigger render={<Button type="button" variant="destructive" size="sm" />}>
                  Supprimer
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cet agent ?</AlertDialogTitle>
                    <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit">{agent ? "Enregistrer" : "Créer"}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
