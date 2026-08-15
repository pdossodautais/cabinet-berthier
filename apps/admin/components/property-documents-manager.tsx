"use client";

import { useState } from "react";
import { uploadDocument, deleteDocument } from "@/lib/actions/documents";
import type { PropertyDocument } from "@repo/shared/supabase/types";
import { DOCUMENT_TYPES } from "@repo/shared/constants";
import { Button, buttonVariants } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Badge } from "@repo/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@repo/ui/select";
import { Upload, Trash2, FileText, ExternalLink } from "lucide-react";
import { cn } from "@repo/ui/utils";
import { toast } from "sonner";

export function PropertyDocumentsManager({
  propertyId,
  documents: initialDocuments,
}: {
  propertyId: string;
  documents: PropertyDocument[];
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("document");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("property_id", propertyId);
    fd.append("name", docName || file.name);
    fd.append("type", docType);

    const result = await uploadDocument(fd);
    if (result.error) {
      toast.error(result.error);
    } else if (result.success && result.url) {
      setDocuments((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          property_id: propertyId,
          name: docName || file.name,
          url: result.url,
          type: docType as PropertyDocument["type"],
          position: prev.length,
        },
      ]);
      setDocName("");
      toast.success("Document ajouté.");
    }

    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(docId: string) {
    const result = await deleteDocument(docId, propertyId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
  }

  function getTypeLabel(type: string) {
    return DOCUMENT_TYPES.find((t) => t.value === type)?.label || type;
  }

  return (
    // Pas de <Card> ici : le parent <TabsContent> a déjà
    // `rounded-lg border bg-card p-6` (TabPanel) — ajouter une Card
    // créerait une boîte dans une boîte avec un double padding.
    <div>
      <div>
        {documents.length > 0 && (
          <div className="space-y-2 mb-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-2 rounded-md border bg-muted/30"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium flex-1 truncate">
                  {doc.name}
                </span>
                <Badge variant="outline" className="text-xs shrink-0">
                  {getTypeLabel(doc.type)}
                </Badge>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Télécharger ${doc.name}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(doc.id)}
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
            <Label htmlFor="doc-name" className="text-xs">
              Nom du document
            </Label>
            <Input
              id="doc-name"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Nom (optionnel)"
              className="h-8 w-48"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-type" className="text-xs">
              Type
            </Label>
            {/* Wrapper interne : isole le hidden input que <Select> shadcn
                rend en sibling. Sans ce wrapper, le space-y-1.5 du parent
                applique `mt: 6px` au hidden input, qui étire la box et fait
                remonter le SelectTrigger de 6 px → décalage avec les autres
                champs alignés en `items-end`. */}
            <div>
              <Select value={docType} onValueChange={(v) => v && setDocType(v)}>
                <SelectTrigger id="doc-type">
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
                  "h-8",
                  uploading && "pointer-events-none opacity-50"
                )}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Upload..." : "Ajouter un document"}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          PDF, Word, Excel ou image. 10 Mo max par fichier.
        </p>
      </div>
    </div>
  );
}
