"use client";

import { useId, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ArrowRightIcon } from "@/components/ui/Icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter sign-up. No email service is connected yet, so a valid
 * submission is NOT stored — the visitor is told so honestly.
 */
export function NewsletterForm({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { t } = useI18n();
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "invalid" | "done">("idle");
  const dark = tone === "dark";

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setState(EMAIL_RE.test(email.trim()) ? "done" : "invalid");
      }}
      className="w-full"
    >
      <label htmlFor={`${id}-email`} className="sr-only">
        {t.newsletter.label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-full border p-1.5 pl-5 ${
          dark ? "border-paper/25 bg-paper/5" : "border-line bg-paper"
        }`}
      >
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          placeholder={t.newsletter.placeholder}
          aria-invalid={state === "invalid"}
          aria-describedby={`${id}-msg`}
          className={`min-h-10 w-full min-w-0 bg-transparent text-[0.95rem] outline-none ${
            dark ? "text-paper placeholder:text-paper/50" : "text-charcoal placeholder:text-[#9b928a]"
          }`}
        />
        <button
          type="submit"
          className={`btn shrink-0 !min-h-10 !px-4 sm:!px-5 ${dark ? "btn-light" : "btn-primary"}`}
          aria-label={t.newsletter.submit}
        >
          <span className="hidden xs:inline">{t.newsletter.submit}</span>
          <ArrowRightIcon size={16} className="xs:hidden" />
        </button>
      </div>
      <p
        id={`${id}-msg`}
        role={state === "idle" ? undefined : "status"}
        className={`mt-2.5 text-[0.8rem] leading-snug ${dark ? "text-paper/65" : "text-muted"} ${
          state === "invalid" ? (dark ? "!text-[#f0c9b5]" : "!text-[#9a4a2c]") : ""
        }`}
      >
        {state === "invalid" ? t.newsletter.invalid : state === "done" ? t.newsletter.notActive : t.newsletter.privacyNote}
      </p>
    </form>
  );
}
