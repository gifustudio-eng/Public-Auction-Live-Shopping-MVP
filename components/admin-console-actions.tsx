import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AdminConsoleActions() {
  return (
    <div className="mx-auto mt-10 w-full max-w-lg">
      <ActionCard
        description="Create, Read, Update, and Delete Show"
        href="/admin/shows"
        icon={<CalendarPlus className="size-6" aria-hidden="true" />}
        title="Manage Shows and Lots"
      />
    </div>
  );
}

function ActionCard({
  description,
  href,
  icon,
  title,
}: {
  description: string;
  href: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group block w-full rounded-3xl border border-black/10 bg-white p-7 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#f15a29] hover:shadow-lg sm:p-8"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f15a29] text-white">
        {icon}
      </span>
      <span className="mt-6 block text-xl font-semibold">{title}</span>
      <span className="mt-2 block leading-6 text-black/55">{description}</span>
    </Link>
  );
}
