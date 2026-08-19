import { BookOpen, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const actions = [
  { key: "create", label: "Create", icon: <Plus className="size-6" aria-hidden="true" /> },
  { key: "read", label: "Read", icon: <BookOpen className="size-6" aria-hidden="true" /> },
  { key: "edit", label: "Edit", icon: <Pencil className="size-6" aria-hidden="true" /> },
] as const;

export function CrudActionCards({
  basePath,
  resource,
}: {
  basePath: string;
  resource: "show" | "lot";
}) {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2">
      {actions.map((action) => {
        const href =
          resource === "show"
            ? action.key === "create"
              ? "/admin/shows/new"
              : `${basePath}/${action.key}`
            : `${basePath}?action=${action.key}`;

        return (
          <CrudCard
            key={action.key}
            centered={action.key === "edit"}
            href={href}
            icon={action.icon}
            label={action.label}
          />
        );
      })}
    </div>
  );
}

function CrudCard({
  centered,
  href,
  icon,
  label,
}: {
  centered: boolean;
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-3xl border border-black/10 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#f15a29] hover:shadow-lg ${
        centered ? "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.625rem)]" : ""
      }`}
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f15a29] text-white">
        {icon}
      </span>
      <span className="mt-5 block text-lg font-semibold">{label}</span>
    </Link>
  );
}
