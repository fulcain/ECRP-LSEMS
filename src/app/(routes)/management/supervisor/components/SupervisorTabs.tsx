"use client";

import { supervisorSearchHref } from "@/configs/supervisor-search-tabs";
import { TabBar, type Tab } from "@/components/ui/tab-bar";
import { Award, CalendarClock, FileSignature, FileText, GraduationCap, LogOut, Users } from "lucide-react";

export type SupervisorTab = "loa" | "meetings" | "contract" | "promotions" | "resignations" | "employees" | "stp";

const tabs: Tab<SupervisorTab>[] = [
  { value: "loa", label: "LOA Processing", href: supervisorSearchHref("loa"), icon: <FileText className="h-4 w-4" />, accent: "border-emerald-300/40 dark:border-emerald-400/40 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
  { value: "meetings", label: "Meetings", href: supervisorSearchHref("meetings"), icon: <CalendarClock className="h-4 w-4" />, accent: "border-indigo-300/40 dark:border-indigo-400/40 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" },
  { value: "contract", label: "Contract Signing", href: supervisorSearchHref("contract"), icon: <FileSignature className="h-4 w-4" />, accent: "border-sky-300/40 dark:border-sky-400/40 bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300" },
  { value: "promotions", label: "Promotions", href: supervisorSearchHref("promotions"), icon: <Award className="h-4 w-4" />, accent: "border-amber-300/40 dark:border-amber-400/40 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" },
  { value: "resignations", label: "Resignations", href: supervisorSearchHref("resignations"), icon: <LogOut className="h-4 w-4" />, accent: "border-rose-300/40 dark:border-rose-400/40 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300" },
  { value: "employees", label: "Employees", href: supervisorSearchHref("employees"), icon: <Users className="h-4 w-4" />, accent: "border-cyan-300/40 dark:border-cyan-400/40 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300" },
  { value: "stp", label: "STP", href: supervisorSearchHref("stp"), icon: <GraduationCap className="h-4 w-4" />, accent: "border-purple-300/40 dark:border-purple-400/40 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" },
];
export function SupervisorTabs({ active }: { active: SupervisorTab }) {
  return <TabBar tabs={tabs} active={active} />;
}
