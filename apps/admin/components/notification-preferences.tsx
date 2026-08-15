"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, Calculator, Mail, type LucideIcon } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@repo/ui/item";
import { Switch } from "@repo/ui/switch";

import { NOTIFICATION_EVENTS } from "@repo/shared/constants";
import { toggleNotificationPreference } from "@/lib/actions/notifications";
import type {
  NotificationEventType,
  NotificationPreference,
} from "@repo/shared/supabase/types";

/** Icône contextuelle par type d'événement. Fallback Bell. */
const EVENT_ICONS: Partial<Record<NotificationEventType, LucideIcon>> = {
  contact: Mail,
  estimation: Calculator,
};

export function NotificationPreferences({
  preferences,
}: {
  preferences: NotificationPreference[];
}) {
  const [states, setStates] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const event of NOTIFICATION_EVENTS) {
      const pref = preferences.find((p) => p.event_type === event.value);
      // Defaults intentionnellement asymétriques : un agent reçoit par
      // défaut les contacts (utile et attendu) mais PAS les estimations
      // (qui spamment toute l'agence — souvent réservées à l'admin).
      // L'agent peut bien sûr basculer le switch dans /profil.
      const defaultOn = event.value !== "estimation";
      map[event.value] = pref?.enabled ?? defaultOn;
    }
    return map;
  });

  const [loading, setLoading] = useState<string | null>(null);

  async function handleToggle(
    eventType: NotificationEventType,
    enabled: boolean,
  ) {
    setLoading(eventType);
    setStates((prev) => ({ ...prev, [eventType]: enabled }));

    const result = await toggleNotificationPreference(eventType, enabled);

    if (result.error) {
      setStates((prev) => ({ ...prev, [eventType]: !enabled }));
      toast.error(result.error);
    }
    setLoading(null);
  }

  return (
    <div className="space-y-3">
      {NOTIFICATION_EVENTS.map((event) => {
        const Icon = EVENT_ICONS[event.value] ?? Bell;
        const on = states[event.value];
        return (
          <Item key={event.value} variant="outline" className="gap-4">
            <ItemMedia variant="icon">
              <Icon className="size-4" strokeWidth={1.75} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{event.label}</ItemTitle>
              <ItemDescription>{event.description}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Switch
                checked={on}
                onCheckedChange={(checked) =>
                  handleToggle(event.value, checked)
                }
                disabled={loading === event.value}
                aria-label={`${on ? "Désactiver" : "Activer"} ${event.label.toLowerCase()}`}
              />
            </ItemActions>
          </Item>
        );
      })}
    </div>
  );
}
