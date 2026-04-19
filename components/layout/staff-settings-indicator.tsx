"use client";

import { useMedic } from "@/app/context/MedicContext";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function StaffSettingsIndicator() {
  const pathname = usePathname();
  const { medicCredentials } = useMedic();

  const isIncomplete =
    !medicCredentials.name ||
    !medicCredentials.signature ||
    !medicCredentials.rank;

  if (!isIncomplete) return null;

  const isStaffPage = pathname === "/staff";

  return (
    <div className="border-b border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full border border-amber-400/30 bg-amber-400/15 p-2 text-amber-300">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Staff settings still need to be completed
            </p>
            <p className="text-sm text-slate-300">
              Add your saved name, signature, and rank so every tool can use
              them automatically.
            </p>
          </div>
        </div>

        {isStaffPage ? (
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
            Complete them here
          </div>
        ) : (
          <Button
            asChild
            variant="outline"
            className="border-amber-300/30 bg-slate-900/40 text-white hover:bg-slate-800"
          >
            <Link href="/staff">
              Open Staff Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
