"use client";

import { useState } from "react";
import { Bug, MessageSquare, Send, Sparkles } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

import {
  BuilderField,
  BuilderRequirement,
  BuilderSection,
} from "@/components/builder/builder-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ReportType } from "@/configs/reports";

/**
 * The Report Form.
 *
 * Bug and Feature are two tiles, each with its own label and its own colour -
 * the earlier version read one shared config object for both, so picking Bug
 * made both say "Bug". Only the *styling* follows the current choice now.
 *
 * Bug is red and Feature is green here and on the message the developer reads,
 * so the colour means the same thing on both sides.
 *
 * The copy never names a Discord channel: from the member's side this is a line
 * to the developer to fix a bug or build a feature.
 */

const MAX_MESSAGE_LENGTH = 4000;

const CHOICES: ReadonlyArray<{
  value: ReportType;
  label: string;
  hint: string;
  icon: typeof Bug;
  /** The tile's border and wash while this choice is selected. */
  tileActive: string;
  /** The icon square while this choice is selected. */
  iconActive: string;
  /** The textarea's border while this choice is selected. */
  border: string;
}> = [
  {
    value: "bug",
    label: "Bug",
    hint: "Something is broken or behaving wrong",
    icon: Bug,
    tileActive: "border-red-500/60 bg-red-500/10",
    iconActive: "border-red-500/40 bg-red-500/10 text-red-500",
    border: "border-red-500/50 focus-visible:border-red-500",
  },
  {
    value: "feature",
    label: "Feature",
    hint: "An idea for something new or an improvement",
    icon: Sparkles,
    tileActive: "border-green-500/60 bg-green-500/10",
    iconActive: "border-green-500/40 bg-green-500/10 text-green-500",
    border: "border-green-500/50 focus-visible:border-green-500",
  },
];

export function ReportForm() {
  const [type, setType] = useState<ReportType>("bug");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const selected = CHOICES.find((choice) => choice.value === type) ?? CHOICES[0];
  const ready = message.trim().length > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready) return;

    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        toast.error(data?.error ?? "Something went wrong.", { theme: "dark" });
        return;
      }

      setSent(true);
      setMessage("");
      toast.success("Sent to the developer.", { theme: "dark" });

      setTimeout(() => setSent(false), 3000);
    } catch {
      toast.error("Could not reach the server.", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Nothing in this app mounts a toast container globally - each page that
          shows a toast renders its own, and without it `toast.*` has nowhere to
          draw. */}
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />
      <form onSubmit={handleSubmit} className="space-y-5">
        <BuilderSection
          icon={MessageSquare}
          title="What are you sending?"
          hint="Pick Bug for something broken or Feature for an idea, then describe it below. You can paste image links in with your text."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {CHOICES.map((choice) => {
              const Icon = choice.icon;
              const isSelected = choice.value === type;
              return (
                <button
                  key={choice.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setType(choice.value)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                    isSelected
                      ? choice.tileActive
                      : "border-border hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                      isSelected
                        ? choice.iconActive
                        : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {choice.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {choice.hint}
                    </span>
                  </span>
                  {isSelected && (
                    <span className="chip ml-auto shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-medium">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <BuilderField
            label="Report"
            htmlFor="report-message"
            hint="The more detail you give, the easier it is to fix or build - what you did, what you expected, and what happened instead."
          >
            <Textarea
              id="report-message"
              value={message}
              onChange={(event) => {
                const next = event.target.value.length <= MAX_MESSAGE_LENGTH
                  ? event.target.value
                  : event.target.value.slice(0, MAX_MESSAGE_LENGTH);
                setMessage(next);
              }}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={10}
              required
              placeholder="Describe the bug or feature. You can paste image links here too."
              className={cn("min-h-48 resize-y", selected.border)}
            />
            <p className="text-right text-[10px] tabular-nums text-muted-foreground">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </p>
          </BuilderField>

          {!ready && (
            <BuilderRequirement>
              Write the report first - Send opens once there is something to read.
            </BuilderRequirement>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button type="submit" disabled={loading || sent || !ready}>
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : sent ? "Sent" : "Send"}
            </Button>
          </div>
        </BuilderSection>
      </form>
    </>
  );
}
