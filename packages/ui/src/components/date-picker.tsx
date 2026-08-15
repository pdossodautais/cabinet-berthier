"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "../utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  /** Selected date — accepte Date, ISO string, ou null/undefined. */
  value?: Date | string | null;
  /** Callback : reçoit Date ou undefined si l'utilisateur déselectionne. */
  onChange?: (date: Date | undefined) => void;
  /** Placeholder affiché quand aucune date n'est sélectionnée. */
  placeholder?: string;
  /** Désactive le bouton trigger. */
  disabled?: boolean;
  className?: string;
  id?: string;
  /**
   * Si fourni, rend un `<input type="hidden" name={name} value={ISO}>` à l'intérieur
   * du Popover pour synchroniser un FormData (server actions). La valeur du hidden
   * est l'ISO complète au format `2026-04-26T00:00:00.000Z` ou "" si non sélectionnée.
   */
  name?: string;
  /** Format d'affichage du label (date-fns). Défaut : "d MMMM yyyy" en FR. */
  displayFormat?: string;
  /** Restreindre à une plage de dates (passé directement à Calendar). */
  fromDate?: Date;
  toDate?: Date;
}

/**
 * DatePicker — Popover + Calendar (react-day-picker) en français.
 *
 * Pattern shadcn standard : un Button avec icône calendrier qui ouvre un
 * Popover contenant un Calendar mode "single". Compatible Server Actions
 * via la prop `name` (rend un input hidden sync avec l'ISO de la date).
 *
 * Usage :
 * ```tsx
 * const [date, setDate] = useState<Date | undefined>();
 * <DatePicker value={date} onChange={setDate} name="sold_at" />
 * ```
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Choisir une date",
  disabled,
  className,
  id,
  name,
  displayFormat = "d MMMM yyyy",
  fromDate,
  toDate,
}: DatePickerProps) {
  const dateValue = React.useMemo<Date | undefined>(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateValue && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">
              {dateValue
                ? format(dateValue, displayFormat, { locale: fr })
                : placeholder}
            </span>
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={onChange}
          locale={fr}
          autoFocus
          disabled={
            fromDate || toDate
              ? (date) => {
                  if (fromDate && date < fromDate) return true;
                  if (toDate && date > toDate) return true;
                  return false;
                }
              : undefined
          }
        />
        {name && (
          <input
            type="hidden"
            name={name}
            value={dateValue ? dateValue.toISOString() : ""}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
