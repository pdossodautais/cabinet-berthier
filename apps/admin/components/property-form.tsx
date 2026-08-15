"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { Property, Agent, PropertyMedia, PropertyDocument } from "@repo/shared/supabase/types";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@repo/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/tabs";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Checkbox } from "@repo/ui/checkbox";
import { Button, buttonVariants } from "@repo/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@repo/ui/select";
import { DatePicker } from "@repo/ui/date-picker";
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
import { cn } from "@repo/ui/utils";
import { toast } from "sonner";
import { PROPERTY_TYPES, TRANSACTION_TYPES, ENERGY_RATINGS } from "@repo/shared/constants";
import { PropertyMediaManager } from "./property-media-manager";
import { PropertyDocumentsManager } from "./property-documents-manager";
import { PropertyMediaStaged, type StagedFile } from "./property-media-staged";
import {
  PropertyDocumentsStaged,
  type StagedDocument,
} from "./property-documents-staged";
import { deleteProperty } from "@/lib/actions/properties";

interface PropertyFormProps {
  property?: Property;
  agents: Agent[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => Promise<any>;
  /** Mode édition : managers Supabase existants. */
  media?: PropertyMedia[];
  documents?: PropertyDocument[];
  /** Mode création : staged uploads (en mémoire avant création du bien). */
  stagedMedia?: StagedFile[];
  onStagedMediaChange?: (files: StagedFile[]) => void;
  stagedDocuments?: StagedDocument[];
  onStagedDocumentsChange?: (docs: StagedDocument[]) => void;
  /**
   * Disable the submit button externally (ex. while staged photos are uploading
   * after creation). Combined with the internal `useFormStatus().pending`.
   */
  submitDisabled?: boolean;
}

type TabKey = "general" | "pricing" | "location" | "energy" | "media" | "documents";

export function PropertyForm({
  property,
  agents,
  action,
  media,
  documents,
  stagedMedia,
  onStagedMediaChange,
  stagedDocuments,
  onStagedDocumentsChange,
  submitDisabled = false,
}: PropertyFormProps) {
  const isEditing = Boolean(property);
  const propertyId = property?.id;

  const [type, setType] = useState<string>(property?.type || "appartement");
  const [transactionType, setTransactionType] = useState<string>(
    property?.transaction_type || "vente",
  );
  const [agentId, setAgentId] = useState<string>(property?.agent_id || "");
  const [energyRating, setEnergyRating] = useState<string>(property?.energy_rating || "");
  const [ghgRating, setGhgRating] = useState<string>(property?.ghg_rating || "");
  const [isSold, setIsSold] = useState<boolean>(Boolean(property?.sold_at));
  const [soldAt, setSoldAt] = useState<string>(property?.sold_at || "");

  const soldLabel = transactionType === "location" ? "loué" : "vendu";
  const soldLabelCap = transactionType === "location" ? "Loué" : "Vendu";

  const typeLabel = PROPERTY_TYPES.find((t) => t.value === type)?.label || "—";
  const transactionTypeLabel =
    TRANSACTION_TYPES.find((t) => t.value === transactionType)?.label || "—";
  const agentLabel = (() => {
    if (!agentId) return "Aucun";
    const a = agents.find((x) => x.id === agentId);
    return a ? `${a.first_name} ${a.last_name}` : "Aucun";
  })();
  const energyRatingLabel = energyRating || "Non renseigné";
  const ghgRatingLabel = ghgRating || "Non renseigné";

  async function handleSubmit(formData: FormData) {
    formData.set("type", type);
    formData.set("transaction_type", transactionType);
    formData.set("agent_id", agentId);
    formData.set("energy_rating", energyRating);
    formData.set("ghg_rating", ghgRating);
    formData.set(
      "sold_at",
      isSold ? soldAt || new Date().toISOString() : "",
    );
    return action(formData);
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="w-full flex flex-wrap h-auto justify-start gap-1 bg-muted/60">
        <TabsTrigger value={"general" satisfies TabKey}>Général</TabsTrigger>
        <TabsTrigger value={"pricing" satisfies TabKey}>Prix &amp; surface</TabsTrigger>
        <TabsTrigger value={"location" satisfies TabKey}>Localisation</TabsTrigger>
        <TabsTrigger value={"energy" satisfies TabKey}>Énergie</TabsTrigger>
        <TabsTrigger value={"media" satisfies TabKey}>Médias</TabsTrigger>
        <TabsTrigger value={"documents" satisfies TabKey}>Documents</TabsTrigger>
      </TabsList>

      <form action={handleSubmit} className="mt-4">
        <TabsContent value={"general" satisfies TabKey} keepMounted>
          <TabPanel>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Titre *</FieldLabel>
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={property?.title}
                  placeholder="Ex: Appartement lumineux 3 pièces - Bastille"
                />
                <FieldDescription>
                  Titre affiché sur les cartes et la fiche publique.
                </FieldDescription>
              </Field>

              {property?.slug && (
                <Field>
                  <FieldLabel htmlFor="slug">Slug</FieldLabel>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={property.slug}
                    readOnly
                    disabled
                    className="font-mono text-xs"
                  />
                  <FieldDescription>
                    Identifiant URL — généré automatiquement à la création.
                  </FieldDescription>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  rows={6}
                  defaultValue={property?.description}
                  placeholder="Description détaillée du bien..."
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="type">Type de bien</FieldLabel>
                  <Select value={type} onValueChange={(v) => v && setType(v)}>
                    <SelectTrigger id="type" className="w-full">
                      <span>{typeLabel}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="transaction_type">Transaction</FieldLabel>
                  <Select value={transactionType} onValueChange={(v) => v && setTransactionType(v)}>
                    <SelectTrigger id="transaction_type" className="w-full">
                      <span>{transactionTypeLabel}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="agent_id">Agent en charge</FieldLabel>
                <Select
                  value={agentId === "" ? "__none__" : agentId}
                  onValueChange={(v) => setAgentId(!v || v === "__none__" ? "" : v)}
                >
                  <SelectTrigger id="agent_id" className="w-full">
                    <span>{agentLabel}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Aucun</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.first_name} {agent.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  L&apos;agent affiché dans la fiche et contacté à chaque message entrant.
                </FieldDescription>
              </Field>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend variant="label">Visibilité</FieldLegend>
                <FieldDescription>
                  Contrôle la publication sur le site vitrine et la mise en vedette sur l&apos;accueil.
                </FieldDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field orientation="horizontal">
                    <Checkbox
                      id="is_published"
                      name="is_published"
                      defaultChecked={property?.is_published}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="is_published" className="font-normal">
                        Publié sur le site
                      </FieldLabel>
                      <FieldDescription>
                        Rendu visible aux visiteurs et indexable.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="is_featured"
                      name="is_featured"
                      defaultChecked={property?.is_featured}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="is_featured" className="font-normal">
                        Mis en avant (accueil)
                      </FieldLabel>
                      <FieldDescription>
                        Apparaît dans le carrousel « Biens en vedette ».
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </div>
              </FieldSet>
            </FieldGroup>
          </TabPanel>
        </TabsContent>

        <TabsContent value={"pricing" satisfies TabKey} keepMounted>
          <TabPanel>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="price">Prix (€)</FieldLabel>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={property?.price}
                />
                <FieldDescription>
                  Prix de vente hors frais, ou loyer mensuel charges comprises selon la transaction.
                </FieldDescription>
              </Field>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend variant="label">Surface &amp; pièces</FieldLegend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Field>
                    <FieldLabel htmlFor="surface">Surface (m²)</FieldLabel>
                    <Input
                      id="surface"
                      name="surface"
                      type="number"
                      min="0"
                      defaultValue={property?.surface}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="rooms">Pièces</FieldLabel>
                    <Input
                      id="rooms"
                      name="rooms"
                      type="number"
                      min="0"
                      defaultValue={property?.rooms}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="bedrooms">Chambres</FieldLabel>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="0"
                      defaultValue={property?.bedrooms}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="bathrooms">Salles de bain</FieldLabel>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="0"
                      defaultValue={property?.bathrooms}
                    />
                  </Field>
                </div>
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend variant="label">Statut</FieldLegend>
                <FieldDescription>
                  Le bien restera visible mais avec un badge «&nbsp;{soldLabelCap}&nbsp;».
                  Décocher pour le réactiver.
                </FieldDescription>
                <Field orientation="horizontal">
                  <Checkbox
                    id="is_sold"
                    checked={isSold}
                    onCheckedChange={(v) => setIsSold(v === true)}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="is_sold" className="font-normal">
                      Marquer ce bien comme {soldLabel}
                    </FieldLabel>
                    <FieldDescription>
                      Exclu de la liste publique par défaut, mais l&apos;URL reste accessible.
                    </FieldDescription>
                  </FieldContent>
                </Field>
                {isSold && (
                  <Field>
                    <FieldLabel htmlFor="sold_at_date">Date de la {transactionType === "location" ? "location" : "vente"}</FieldLabel>
                    <DatePicker
                      id="sold_at_date"
                      value={soldAt || undefined}
                      onChange={(date) => setSoldAt(date ? date.toISOString() : "")}
                      placeholder="Choisir une date"
                      toDate={new Date()}
                      className="max-w-xs"
                    />
                    <FieldDescription>
                      Si vide, la date du jour sera utilisée à l&apos;enregistrement.
                    </FieldDescription>
                  </Field>
                )}
              </FieldSet>
            </FieldGroup>
          </TabPanel>
        </TabsContent>

        <TabsContent value={"location" satisfies TabKey} keepMounted>
          <TabPanel>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="address">Adresse</FieldLabel>
                <Input id="address" name="address" defaultValue={property?.address} />
                <FieldDescription>
                  Adresse complète — utilisée pour l&apos;affichage interne.
                </FieldDescription>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="city">Ville</FieldLabel>
                  <Input id="city" name="city" defaultValue={property?.city} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="postal_code">Code postal</FieldLabel>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    defaultValue={property?.postal_code}
                  />
                </Field>
              </div>

              <FieldSeparator>Coordonnées GPS</FieldSeparator>

              <FieldSet>
                <FieldDescription>
                  Optionnel — permet l&apos;affichage sur la carte et la fiche géolocalisée.
                </FieldDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      defaultValue={property?.latitude ?? ""}
                      placeholder="48.8566"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      defaultValue={property?.longitude ?? ""}
                      placeholder="2.3522"
                    />
                  </Field>
                </div>
              </FieldSet>
            </FieldGroup>
          </TabPanel>
        </TabsContent>

        <TabsContent value={"energy" satisfies TabKey} keepMounted>
          <TabPanel>
            <FieldGroup>
              <FieldSet>
                <FieldLegend variant="label">Diagnostic énergétique</FieldLegend>
                <FieldDescription>
                  Classes DPE et GES obligatoires pour les annonces de vente et location (hors exceptions).
                </FieldDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="energy_rating">Classe DPE</FieldLabel>
                    <Select
                      value={energyRating === "" ? "__none__" : energyRating}
                      onValueChange={(v) => setEnergyRating(!v || v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger id="energy_rating" className="w-full">
                        <span>{energyRatingLabel}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Non renseigné</SelectItem>
                        {ENERGY_RATINGS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ghg_rating">Classe GES</FieldLabel>
                    <Select
                      value={ghgRating === "" ? "__none__" : ghgRating}
                      onValueChange={(v) => setGhgRating(!v || v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger id="ghg_rating" className="w-full">
                        <span>{ghgRatingLabel}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Non renseigné</SelectItem>
                        {ENERGY_RATINGS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldSet>

              <FieldSeparator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="construction_year">Année de construction</FieldLabel>
                  <Input
                    id="construction_year"
                    name="construction_year"
                    type="number"
                    min="1800"
                    max="2100"
                    defaultValue={property?.construction_year ?? ""}
                    placeholder="Ex: 2018"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="heating_type">Type de chauffage</FieldLabel>
                  <Input
                    id="heating_type"
                    name="heating_type"
                    defaultValue={property?.heating_type ?? ""}
                    placeholder="Ex: Chauffage central radiateur"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="energy_sources">Sources d&apos;énergie</FieldLabel>
                <Textarea
                  id="energy_sources"
                  name="energy_sources"
                  rows={2}
                  defaultValue={property?.energy_sources?.join(", ") ?? ""}
                  placeholder="Électricité, Gaz de ville, Pompe à chaleur, Fioul…"
                />
                <FieldDescription>
                  Séparez chaque source par une virgule ou un retour à la ligne.
                </FieldDescription>
              </Field>

              <FieldSeparator />

              <Field>
                <FieldLabel htmlFor="features">Prestations</FieldLabel>
                <Textarea
                  id="features"
                  name="features"
                  rows={3}
                  defaultValue={property?.features?.join(", ") ?? ""}
                  placeholder="Ascenseur, Balcon, Cave, Parking, Dernier étage, Calme, Cuisine équipée…"
                />
                <FieldDescription>
                  Séparez chaque prestation par une virgule ou un retour à la ligne.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </TabPanel>
        </TabsContent>

        {/* Médias & documents sont aussi dans le form pour que FormActions
            reste en BAS du panel actif (sinon ils apparaissaient au-dessus).
            En édition : les Manager (server actions Supabase). En création :
            les Staged (File[] en mémoire, uploadés après createProperty). */}
        <TabsContent value={"media" satisfies TabKey} keepMounted>
          <TabPanel>
            <div className="mb-4">
              <h2 className="text-base font-medium">Photos du bien</h2>
              <p className="text-muted-foreground text-sm">
                Glissez-déposez pour réorganiser. La première image sert de miniature et d&apos;image Open Graph.
              </p>
            </div>
            {isEditing && propertyId ? (
              <PropertyMediaManager propertyId={propertyId} media={media ?? []} />
            ) : (
              <PropertyMediaStaged
                files={stagedMedia ?? []}
                onChange={onStagedMediaChange ?? (() => {})}
              />
            )}
          </TabPanel>
        </TabsContent>
        <TabsContent value={"documents" satisfies TabKey} keepMounted>
          <TabPanel>
            <div className="mb-4">
              <h2 className="text-base font-medium">Documents</h2>
              <p className="text-muted-foreground text-sm">
                DPE, diagnostics, plans — téléchargeables depuis la fiche publique.
              </p>
            </div>
            {isEditing && propertyId ? (
              <PropertyDocumentsManager
                propertyId={propertyId}
                documents={documents ?? []}
              />
            ) : (
              <PropertyDocumentsStaged
                documents={stagedDocuments ?? []}
                onChange={onStagedDocumentsChange ?? (() => {})}
              />
            )}
          </TabPanel>
        </TabsContent>

        <FormActions
          isEditing={isEditing}
          propertyId={propertyId}
          disabled={submitDisabled}
        />
      </form>
    </Tabs>
  );
}

function TabPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-xs">
      {children}
    </div>
  );
}

function FormActions({
  isEditing,
  propertyId,
  disabled = false,
}: {
  isEditing: boolean;
  propertyId?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const router = useRouter();
  const [isDeleting, startDelete] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busy = pending || disabled || isDeleting;
  const canDelete = isEditing && Boolean(propertyId);

  function handleDelete() {
    if (!propertyId) return;
    startDelete(async () => {
      const result = await deleteProperty(propertyId);
      // `deleteProperty` redirige côté serveur en cas de succès — on
      // n'arrive ici que sur erreur (jamais sur succès).
      if (result?.error) {
        toast.error(result.error);
        setConfirmOpen(false);
        return;
      }
      // Fallback : si pour une raison X le redirect serveur n'a pas eu
      // lieu (ex. flag de feature en dev), on force le côté client.
      router.push("/biens");
      router.refresh();
    });
  }

  // Layout : sur desktop, suppression à gauche, actions à droite avec
  // `justify-between`. Sur mobile (flex-col-reverse), tout s'empile —
  // suppression apparaît en bas (cohérent : action destructive au plus
  // loin du pouce qui hover sur "Enregistrer").
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {canDelete && (
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            {/* base-ui n'utilise pas `asChild` mais la prop `render` —
                on passe directement le Button comme render slot. */}
            <AlertDialogTrigger
              disabled={busy}
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  {isDeleting ? "Suppression…" : "Supprimer le bien"}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce bien ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes les photos et
                  documents associés seront aussi supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  className={cn(
                    buttonVariants({ variant: "destructive" }),
                  )}
                >
                  {isDeleting ? "Suppression…" : "Supprimer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3">
        <Link
          href="/biens"
          className={cn(buttonVariants({ variant: "outline" }))}
          aria-disabled={busy}
        >
          Annuler
        </Link>
        <Button type="submit" disabled={busy}>
          {pending || disabled
            ? isEditing
              ? "Enregistrement…"
              : "Création…"
            : isEditing
              ? "Enregistrer"
              : "Créer le bien"}
        </Button>
      </div>
    </div>
  );
}
