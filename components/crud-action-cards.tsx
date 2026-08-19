import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const actions = [
  { key: "create", label: "Create", icon: <Plus className="size-6" aria-hidden="true" /> },
  { key: "read", label: "Read", icon: <BookOpen className="size-6" aria-hidden="true" /> },
  { key: "update", label: "Update", icon: <Pencil className="size-6" aria-hidden="true" /> },
  { key: "delete", label: "Delete", icon: <Trash2 className="size-6" aria-hidden="true" /> },
] as const;

export function CrudActionCards({
  basePath,
  resource,
}: {
  basePath: string;
  resource: "show" | "lot";
}) {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const href =
          resource === "show" && action.key === "create"
            ? "/admin/shows/new"
            : `${basePath}?action=${action.key}`;

        return (
          <CrudCard key={action.key} href={href} icon={action.icon} label={action.label} />
        );
      })}
    </div>
  );
}

function CrudCard({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-black/10 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#f15a29] hover:shadow-lg"
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f15a29] text-white">
        {icon}
      </span>
      <span className="mt-5 block text-lg font-semibold">{label}</span>
    </Link>
  );
}
