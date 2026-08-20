import { CalendarPlus, UsersRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AdminConsoleActions() {
  return (
    <div className="mx-auto mt-10 grid w-full max-w-3xl gap-5 sm:grid-cols-2">
      <ActionCard
        description="Create, Read, and Edit Shows and Lots"
        href="/admin/shows"
        icon={<CalendarPlus className="size-6" aria-hidden="true" />}
        title="Manage Shows and Lots"
      />
      <ActionCard
        description="Create, Read, and Edit Consignors"
        href="/admin/consignors"
        icon={<UsersRound className="size-6" aria-hidden="true" />}
        title="Manage Consignors"
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
