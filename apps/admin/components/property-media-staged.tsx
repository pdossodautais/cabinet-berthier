"use client";

import { useState, useEffect } from "react";
import { X, Upload, GripVertical } from "lucide-react";
import Image from "next/image";
import { Button, buttonVariants } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/utils";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type StagedFile = { file: File; previewUrl: string };

export function PropertyMediaStaged({
  files,
  onChange,
}: {
  files: StagedFile[];
  onChange: (files: StagedFile[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Cleanup preview URLs au démontage pour éviter les memory leaks
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    const valid: StagedFile[] = [];
    for (const file of Array.from(selected)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} : format non supporté`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} : taille max 5 Mo`);
        continue;
      }
      valid.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    onChange([...files, ...valid]);
    e.target.value = "";
  }

  function handleRemove(idx: number) {
    URL.revokeObjectURL(files[idx].previewUrl);
    onChange(files.filter((_, i) => i !== idx));
  }

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...files];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    setDragIdx(idx);
  }

  function handleDragEnd() {
    setDragIdx(null);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {files.map((f, idx) => (
              <div
                key={f.previewUrl}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "relative group w-28 h-28 rounded-lg overflow-hidden border-2 cursor-grab",
                  dragIdx === idx ? "border-primary opacity-50" : "border-transparent"
                )}
              >
                <Image
                  src={f.previewUrl}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <Button
                  variant="destructive"
                  size="icon"
                  type="button"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(idx)}
                  aria-label={`Supprimer photo ${idx + 1}`}
                >
                  <X className="h-3 w-3" />
                </Button>
                <GripVertical
                  className="absolute bottom-1 left-1 h-4 w-4 text-white opacity-0 group-hover:opacity-70 transition-opacity"
                  aria-hidden="true"
                />
                {idx === 0 && (
                  <Badge className="absolute top-1 left-1 text-[10px]">Principale</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        <label className="cursor-pointer inline-block">
          <span className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            <Upload className="mr-2 h-4 w-4" />
            Ajouter des photos
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleSelect}
            className="hidden"
          />
        </label>
        <p className="text-xs text-muted-foreground mt-2">
          JPEG, PNG, WebP ou AVIF. 5 Mo max par fichier. Glissez pour réordonner.
        </p>
      </CardContent>
    </Card>
  );
}

export type { StagedFile };
