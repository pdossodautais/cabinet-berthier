"use client";

import { CONTACT_STATUSES } from "@repo/shared/constants";
import { updateContactStatus } from "@/lib/actions/contacts";
import {
  StatusBadge,
  CONTACT_STATUS_TONES,
} from "@/components/status-badge";

/**
 * Wrapper client autour de StatusBadge, pour utilisation depuis des Server
 * Components (pages détail). Les Server Components ne peuvent pas passer
 * d'arrow function en prop à un Client Component — ce wrapper referme la
 * closure `contactId + action` côté client.
 */
export function ContactStatusBadge({
  contactId,
  status,
}: {
  contactId: string;
  status: string;
}) {
  return (
    <StatusBadge
      value={status}
      options={CONTACT_STATUSES}
      toneByValue={CONTACT_STATUS_TONES}
      onChange={(v) => updateContactStatus(contactId, v)}
    />
  );
}
