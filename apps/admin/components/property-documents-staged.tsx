"use client";

import { useState } from "react";
import { Trash2, FileText, Upload } from "lucide-react";
import { DOCUMENT_TYPES } from "@repo/shared/constants";
import { Button, buttonVariants } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Badge } from "@repo/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@repo/ui/select";
import { cn } from "@repo/ui/utils";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
];

export type StagedDocument = {
  file: File;
  name: string;
  type: string;
};

export function PropertyDocumentsStaged({
  documents,
  onChange,
}: {
  documents: StagedDocument[];
  onChange: (next: StagedDocument[]) => void;
}) {
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("document");

  function getTypeLabel(type: string) {
    return DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;
  }

  function isExtensionAllowed(filename: string) {
    const lower = filename.toLowerCase();
    return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isExtensionAllowed(file.name)) {
      toast.error(`${file.name} : format non supporté`);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} : taille max 10 Mo`);
      e.target.value = "";
      return;
    }

    const next: StagedDocument = {
      file,
      name: docName || file.name,
      type: docType,
    };
    onChange([...documents, next]);
    setDocName("");
    e.target.value = "";
  }

  function handleRemove(idx: number) {
    onChange(documents.filter((_, i) => i !== idx));
  }

  return (
    // Pas de <Card> ici : le parent <TabsContent> a déjà
    // `rounded-lg border bg-card p-6` (TabPanel) — ajouter une Card
    // créerait une boîte dans une boîte avec un double padding.
    <div>
      <div>
        {documents.length > 0 && (
          <div className="space-y-2 mb-4">
            {documents.map((doc, idx) => (
              <div
                key={`${doc.file.name}-${idx}`}
                className="flex items-center gap-3 p-2 rounded-md border bg-muted/30"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium flex-1 truncate">
                  {doc.name}
                </span>
                <Badge variant="outline" className="text-xs shrink-0">
                  {getTypeLabel(doc.type)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(idx)}
                  aria-label={`Supprimer ${doc.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="staged-doc-name" className="text-xs">
              Nom du document
            </Label>
            <Input
              id="staged-doc-name"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Nom (optionnel)"
              className="h-8 w-48"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staged-doc-type" className="text-xs">
              Type
            </Label>
            {/* Wrapper interne : isole le hidden input que <Select> shadcn
                rend en sibling. Sans ce wrapper, le space-y-1.5 du parent
                applique `mt: 6px` au hidden input, qui étire la box et fait
                remonter le SelectTrigger de 6 px → décalage avec les autres
                champs alignés en `items-end`. */}
            <div>
              <Select value={docType} onValueChange={(v) => v && setDocType(v)}>
                <SelectTrigger id="staged-doc-type">
                  <span>{getTypeLabel(docType)}</span>
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            {/* Placeholder invisible qui matche la hauteur des Label des
                autres champs — sans ça, le bouton « Ajouter un document »
                remonte de la hauteur d'un Label et casse l'alignement
                vertical avec « Nom » / « Type ». */}
            <span aria-hidden className="invisible block text-xs">
              .
            </span>
            <label className="cursor-pointer inline-block">
              <span
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8"
                )}
              >
                <Upload className="mr-2 h-4 w-4" />
                Ajouter un document
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={handleSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          PDF, Word, Excel ou image. 10 Mo max par fichier. Sera uploadé après création du bien.
        </p>
      </div>
    </div>
  );
}
