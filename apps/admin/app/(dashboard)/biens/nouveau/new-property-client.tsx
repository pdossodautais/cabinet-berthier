"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PropertyForm } from "@/components/property-form";
import type { StagedFile } from "@/components/property-media-staged";
import type { StagedDocument } from "@/components/property-documents-staged";
import { createProperty, uploadPropertyImage } from "@/lib/actions/properties";
import { uploadDocument } from "@/lib/actions/documents";
import type { Agent } from "@repo/shared/supabase/types";

export function NewPropertyClient({ agents }: { agents: Agent[] }) {
  const [stagedMedia, setStagedMedia] = useState<StagedFile[]>([]);
  const [stagedDocs, setStagedDocs] = useState<StagedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await createProperty(formData);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    const propertyId = result.id;
    const totalUploads = stagedMedia.length + stagedDocs.length;

    if (totalUploads === 0) {
      toast.success("Bien créé");
      startTransition(() => router.push(`/biens/${propertyId}`));
      return;
    }

    setIsUploading(true);
    toast.info(
      `Upload de ${totalUploads} fichier${totalUploads > 1 ? "s" : ""}…`,
    );

    let uploaded = 0;
    let failed = 0;

    // Photos d'abord (séquentiel pour éviter de saturer Supabase)
    for (const { file } of stagedMedia) {
      const fd = new FormData();
      fd.append("file", file);
      const r = await uploadPropertyImage(propertyId, fd);
      if (r.success) uploaded++;
      else failed++;
    }

    // Puis documents
    for (const { file, name, type } of stagedDocs) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("property_id", propertyId);
      fd.append("name", name || file.name);
      fd.append("type", type);
      const r = await uploadDocument(fd);
      if (r.success) uploaded++;
      else failed++;
    }

    setIsUploading(false);

    if (failed === 0) {
      toast.success(
        `Bien créé avec ${uploaded} fichier${uploaded > 1 ? "s" : ""}`,
      );
    } else {
      toast.warning(
        `${uploaded} ok, ${failed} échec${failed > 1 ? "s" : ""}`,
      );
    }

    startTransition(() => router.push(`/biens/${propertyId}`));
  }

  return (
    <PropertyForm
      agents={agents}
      action={handleSubmit}
      stagedMedia={stagedMedia}
      onStagedMediaChange={setStagedMedia}
      stagedDocuments={stagedDocs}
      onStagedDocumentsChange={setStagedDocs}
      submitDisabled={isUploading}
    />
  );
}
