"use client";

import { useState } from "react";
import { uploadPropertyImage, deletePropertyImage, reorderPropertyImages } from "@/lib/actions/properties";
import { X, Upload, GripVertical } from "lucide-react";
import { PropertyImage } from "@repo/ui/property-image";
import { Button, buttonVariants } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/utils";
import { Card, CardContent } from "@repo/ui/card";
import type { PropertyMedia } from "@repo/shared/supabase/types";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function PropertyMediaManager({
  propertyId,
  media: initialMedia,
}: {
  propertyId: string;
  media: PropertyMedia[];
}) {
  const [media, setMedia] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} : format non supporte (JPEG, PNG, WebP, AVIF)`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} : taille max 5 Mo`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setProgress({ current: 0, total: validFiles.length });

    for (const file of validFiles) {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadPropertyImage(propertyId, fd);
      if (result.success && result.url) {
        setMedia((prev) => [...prev, { id: Date.now().toString(), property_id: propertyId, url: result.url, position: prev.length, alt_text: null }]);
      }
      setProgress((p) => ({ ...p, current: p.current + 1 }));
    }

    setUploading(false);
    setProgress({ current: 0, total: 0 });
    e.target.value = "";
  }

  async function handleDelete(mediaId: string) {
    const result = await deletePropertyImage(mediaId, propertyId);
    if (result.success) setMedia((prev) => prev.filter((m) => m.id !== mediaId));
  }

  function handleDragStart(idx: number) { setDragIdx(idx); }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newMedia = [...media];
    const [moved] = newMedia.splice(dragIdx, 1);
    newMedia.splice(idx, 0, moved);
    setMedia(newMedia);
    setDragIdx(idx);
  }
  async function handleDragEnd() {
    setDragIdx(null);
    await reorderPropertyImages(propertyId, media.map((m) => m.id));
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-3 mb-4">
          {media.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`relative group w-28 h-28 rounded-lg overflow-hidden border-2 cursor-grab ${dragIdx === idx ? "border-primary opacity-50" : "border-transparent"}`}
            >
              <PropertyImage src={item.url} alt={item.alt_text || ""} fill sizes="112px" className="object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(item.id)}
                aria-label={`Supprimer photo ${idx + 1}`}
              >
                <X className="h-3 w-3" />
              </Button>
              <GripVertical className="absolute bottom-1 left-1 h-4 w-4 text-white opacity-0 group-hover:opacity-70 transition-opacity" aria-hidden="true" />
              {idx === 0 && (
                <Badge className="absolute top-1 left-1 text-[10px]">Principale</Badge>
              )}
            </div>
          ))}
        </div>

        {uploading && progress.total > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Upload en cours...</span>
              <span>{progress.current}/{progress.total}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <label className="cursor-pointer inline-block">
          <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), uploading && "pointer-events-none opacity-50")}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? `Upload ${progress.current}/${progress.total}...` : "Ajouter des photos"}
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
        <p className="text-xs text-muted-foreground mt-2">JPEG, PNG, WebP ou AVIF. 5 Mo max par fichier.</p>
      </CardContent>
    </Card>
  );
}
