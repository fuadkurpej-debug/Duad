import type { Locale } from "../config";
import en, { type Messages } from "./en";
import sr from "./sr";

const dictionaries: Record<Locale, Messages> = { en, sr };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

/** Replace {placeholders} in a message. */
export function fmt(message: string, values: Record<string, string | number>): string {
  return message.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}

export type { Messages };
