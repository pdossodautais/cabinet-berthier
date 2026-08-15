"use client";

import { ESTIMATION_STATUSES } from "@repo/shared/constants";
import { updateEstimationStatus } from "@/lib/actions/estimations";
import {
  StatusBadge,
  ESTIMATION_STATUS_TONES,
} from "@/components/status-badge";

/**
 * Wrapper client autour de StatusBadge — cf. ContactStatusBadge pour
 * l'explication (Server Components ne peuvent pas passer d'arrow function
 * en prop à un Client Component).
 */
export function EstimationStatusBadge({
  estimationId,
  status,
}: {
  estimationId: string;
  status: string;
}) {
  return (
    <StatusBadge
      value={status}
      options={ESTIMATION_STATUSES}
      toneByValue={ESTIMATION_STATUS_TONES}
      onChange={(v) => updateEstimationStatus(estimationId, v)}
    />
  );
}
