import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { href } from "@/lib/routes";

export function AnnouncementBar({ locale, t }: { locale: Locale; t: Messages }) {
  return (
    <div className="bg-charcoal text-paper">
      <p className="container-page flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-0.5 py-2 text-center text-[0.76rem] leading-snug tracking-[0.02em]">
        <span>{t.announcement.text}</span>
        <Link href={href(locale, { key: "faq" })} className="font-semibold underline underline-offset-4 hover:no-underline">
          {t.announcement.link}
        </Link>
      </p>
    </div>
  );
}
