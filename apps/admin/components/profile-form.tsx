"use client";

import { useRef, useState } from "react";
import {
  AtSign,
  Camera,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@repo/shared/supabase/client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@repo/ui/input-group";

/* ────────────────────────────────────────────────────────────────
 * IdentityForm
 * - Avatar 96px avec 2 actions explicites (changer / supprimer)
 * - Auto-upload Supabase avec feedback loader + toast
 * - Bouton submit désactivé tant que rien n'a bougé (dirty check)
 * ──────────────────────────────────────────────────────────────── */

interface IdentityFormProps {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export function IdentityForm({
  email,
  firstName: initialFirstName,
  lastName: initialLastName,
  avatarUrl: initialAvatarUrl,
}: IdentityFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : email.substring(0, 2).toUpperCase();

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo.");
      return;
    }

    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const fileName = `avatars/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("agents")
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Erreur lors de l'upload de la photo.");
      setUploadingAvatar(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("agents").getPublicUrl(fileName);

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateError) {
      toast.error("Erreur lors de la mise à jour du profil.");
    } else {
      setAvatarUrl(publicUrl);
      toast.success("Photo de profil mise à jour.");
    }
    setUploadingAvatar(false);
    // Reset l'input pour pouvoir re-upload le même fichier si besoin.
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAvatarRemove() {
    setUploadingAvatar(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: null },
    });
    if (error) {
      toast.error("Impossible de retirer la photo.");
    } else {
      setAvatarUrl(null);
      toast.success("Photo retirée.");
    }
    setUploadingAvatar(false);
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Le prénom et le nom sont obligatoires.");
      return;
    }
    setSavingProfile(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { first_name: firstName.trim(), last_name: lastName.trim() },
    });
    if (error) {
      toast.error("Erreur lors de la mise à jour du profil.");
    } else {
      toast.success("Profil mis à jour.");
    }
    setSavingProfile(false);
  }

  const dirty =
    firstName.trim() !== initialFirstName ||
    lastName.trim() !== initialLastName;

  return (
    <form onSubmit={handleProfileUpdate} className="space-y-6">
      {/* Avatar : 96px + 2 actions texte (Changer / Retirer) à côté.
          Plus clair qu'un hover mystérieux — les actions sont visibles. */}
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="relative">
          <Avatar className="size-24 border-2 border-border">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt="Photo de profil" />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {uploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
              <Loader2 className="size-5 animate-spin text-foreground" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              <Camera className="size-3.5" strokeWidth={1.75} />
              {avatarUrl ? "Changer la photo" : "Importer une photo"}
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAvatarRemove}
                disabled={uploadingAvatar}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} />
                Retirer
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou WebP · 2 Mo maximum.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="sr-only"
          />
        </div>
      </div>

      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="first_name">Prénom</FieldLabel>
            <Input
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jean"
              autoComplete="given-name"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="last_name">Nom</FieldLabel>
            <Input
              id="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Dupont"
              autoComplete="family-name"
              required
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Adresse email</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <AtSign className="size-4" strokeWidth={1.75} />
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              value={email}
              readOnly
              aria-readonly
              className="text-muted-foreground"
            />
          </InputGroup>
          <FieldDescription>
            Sert à vous connecter. Contactez un administrateur pour la
            modifier.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex items-center justify-end gap-3 pt-2 border-t -mx-6 px-6 -mb-6 pb-6 bg-muted/20 rounded-b-xl">
        <Button type="submit" disabled={savingProfile || !dirty}>
          {savingProfile && <Loader2 className="size-3.5 animate-spin" />}
          {savingProfile ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────
 * PasswordForm
 * - Show/hide toggle via InputGroup (pattern shadcn)
 * - Validation live : check ✓ quand ≥ 6 chars + match
 * - Bouton disabled tant que invalide
 * ──────────────────────────────────────────────────────────────── */

export function PasswordForm({ isSetup = false }: { isSetup?: boolean }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const isLongEnough = newPassword.length >= 6;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = isMatching && isLongEnough;
  const showMismatch = confirmPassword.length > 0 && !isMatching;

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!isLongEnough) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (!isMatching) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setSavingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("Erreur lors du changement de mot de passe.");
    } else {
      toast.success("Mot de passe mis à jour.");
      setNewPassword("");
      setConfirmPassword("");
      setShowNew(false);
      setShowConfirm(false);
    }
    setSavingPassword(false);
  }

  return (
    <form onSubmit={handlePasswordChange} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="new-password">
            {isSetup ? "Mot de passe" : "Nouveau mot de passe"}
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Lock className="size-4" strokeWidth={1.75} />
            </InputGroupAddon>
            <InputGroupInput
              id="new-password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-xs"
                onClick={() => setShowNew((v) => !v)}
                aria-label={
                  showNew ? "Masquer le mot de passe" : "Afficher le mot de passe"
                }
              >
                {showNew ? (
                  <EyeOff className="size-3.5" strokeWidth={1.75} />
                ) : (
                  <Eye className="size-3.5" strokeWidth={1.75} />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription
            className={
              isLongEnough
                ? "text-emerald-600 dark:text-emerald-500"
                : undefined
            }
          >
            {isLongEnough ? (
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3" strokeWidth={2.5} />
                Longueur suffisante
              </span>
            ) : (
              "Au moins 6 caractères."
            )}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirmer</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Lock className="size-4" strokeWidth={1.75} />
            </InputGroupAddon>
            <InputGroupInput
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={showMismatch ? true : undefined}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-xs"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={
                  showConfirm
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showConfirm ? (
                  <EyeOff className="size-3.5" strokeWidth={1.75} />
                ) : (
                  <Eye className="size-3.5" strokeWidth={1.75} />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {showMismatch && (
            <FieldDescription className="text-destructive">
              Les mots de passe ne correspondent pas.
            </FieldDescription>
          )}
          {isMatching && (
            <FieldDescription className="text-emerald-600 dark:text-emerald-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3" strokeWidth={2.5} />
                Les mots de passe correspondent
              </span>
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>

      <div className="flex items-center justify-end gap-3 pt-2 border-t -mx-6 px-6 -mb-6 pb-6 bg-muted/20 rounded-b-xl">
        <Button type="submit" disabled={savingPassword || !canSubmit}>
          {savingPassword && <Loader2 className="size-3.5 animate-spin" />}
          {savingPassword
            ? "Mise à jour…"
            : isSetup
              ? "Définir le mot de passe"
              : "Mettre à jour"}
        </Button>
      </div>
    </form>
  );
}
