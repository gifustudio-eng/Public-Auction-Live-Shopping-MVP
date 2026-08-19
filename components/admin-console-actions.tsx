import { CalendarPlus, PackagePlus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AdminConsoleActions() {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2">
      <ActionCard
        description="Create, Read, Update, and Delete Show"
        href="/admin/shows/new"
        icon={<CalendarPlus className="size-6" aria-hidden="true" />}
        title="Show CRUD"
      />
      <ActionCard
        description="Create, Read, Update, and Delete Lot"
        href="/admin/lots"
        icon={<PackagePlus className="size-6" aria-hidden="true" />}
        title="Lot CRUD"
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
      className="group rounded-3xl border border-black/10 bg-white p-7 text-left transition-all hover:-translate-y-1 hover:border-[#f15a29] hover:shadow-lg"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f15a29] text-white">
        {icon}
      </span>
      <span className="mt-6 block text-xl font-semibold">{title}</span>
      <span className="mt-2 block leading-6 text-black/55">{description}</span>
    </Link>
  );
}
