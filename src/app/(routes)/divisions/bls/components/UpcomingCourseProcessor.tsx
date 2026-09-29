"use client";

import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { NowTimeButton } from "@/components/now-time-button";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BuilderField,
  BuilderForm,
  BuilderOutput,
  BuilderPreview,
  BuilderRequirement,
  BuilderSection,
  BuilderShell,
} from "@/components/builder/builder-layout";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  CalendarClock,
  Check,
  ClipboardCopy,
  ExternalLink,
} from "lucide-react";
import { copyBBCodeAndOpen } from "@/app/helpers/copyBBCodeAndOpenSite";
import { pickPostTarget } from "@/app/helpers/forumHandoff";
import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";

export type UpcomingCourseType = "new" | "reschedule" | "cancelled";

/** The single post the upcoming-courses listing is edited in. */
const UPCOMING_COURSES_POST_URL =
  "https://gov.eclipse-rp.net/posting.php?mode=edit&p=55540";

/**
 * The three things a member can do to the upcoming-courses listing, declared
 * once: this builder's dropdown is built from it and its badges name the entry
 * the member picked, so no name is written down a second time.
 */
export const UPCOMING_COURSES: {
  value: UpcomingCourseType;
  label: string;
  /** One plain line saying what the change does, under the dropdown. */
  hint: string;
}[] = [
  {
    value: "new",
    label: "Add a class",
    hint: "Puts a new class on the upcoming-courses post.",
  },
  {
    value: "reschedule",
    label: "Reschedule a class",
    hint: "Moves a class that is already on the listing.",
  },
  {
    value: "cancelled",
    label: "Cancel a class",
    hint: "Strikes a class off the listing.",
  },
];

/**
 * The listing itself, as the paperwork picker offers it: one card, because the
 * listing is a single post that gets edited - which of the three changes above
 * it makes is the builder's own dropdown.
 */
export const UPCOMING_COURSES_LISTING = {
  label: "Edit the listing",
  hint: "Add a class, move one, or strike one off - you pick which inside.",
};

export function UpcomingCourseProcessor({
  initialCourseType = "new",
}: {
  /**
   * Which change to open on, when the page knows. Only a retired `?type=` link
   * does: the picker offers this builder as one card, so the change itself is
   * chosen in the dropdown below and remembered for the next visit.
   */
  initialCourseType?: UpcomingCourseType;
}) {
  const [courseType, setCourseType, courseTypeHydrated] =
    useLocalStorage<UpcomingCourseType>("uc-courseType", initialCourseType);

  // A retired `?type=` link is the member's latest intent, so it beats the
  // stored draft - but only once storage has been read, or this write lands in
  // the same commit as the hydration read and the stored value replaces it.
  useEffect(() => {
    if (courseTypeHydrated && initialCourseType) setCourseType(initialCourseType);
  }, [courseTypeHydrated, initialCourseType, setCourseType]);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const pad = (num: number, size: number = 2) =>
    String(num).padStart(size, "0");

  const [datetime, setDatetime] = useState<string>("");
  const [prevDatetime, setPrevDatetime] = useState<string>("");

  const [instructor, setInstructor] = useLocalStorage<string>(
    "uc-instructor",
    "",
  );

  const [date, setDate] = useState<Date | undefined>(
    datetime ? new Date(datetime + "Z") : undefined,
  );
  const [time, setTime] = useState<string>(
    datetime ? format(new Date(datetime + "Z"), "HH:mm") : "",
  );

  const [prevDate, setPrevDate] = useState<Date | undefined>(
    prevDatetime ? new Date(prevDatetime + "Z") : undefined,
  );
  const [prevTime, setPrevTime] = useState<string>(
    prevDatetime ? format(new Date(prevDatetime + "Z"), "HH:mm") : "",
  );

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const getOrdinal = (n: number) => {
    if (n > 5 && n < 21) return `${n}th`;
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  };

  const formatDate = (datetimeStr: string) => {
    if (!datetimeStr) return null;
    const d = new Date(datetimeStr + "Z");
    if (isNaN(d.getTime())) return null;

    const weekday = d.toLocaleString("en-GB", {
      weekday: "long",
      timeZone: "UTC",
    });
    const dayNum = d.getUTCDate();
    const dayOrdinal = getOrdinal(dayNum);
    const month = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
    const year = d.getUTCFullYear();
    const hours = pad(d.getUTCHours());
    const minutes = pad(d.getUTCMinutes());
    const urlDate = `${year}-${pad(d.getUTCMonth() + 1)}-${pad(dayNum)}`;

    return {
      formatted: `${weekday}, ${dayOrdinal} ${month} ${year} @ ${hours}:${minutes} [ooc]UTC[/ooc]`,
      urlDate,
      hours,
      minutes,
    };
  };

  const buildDatetimeString = useCallback((d: Date | undefined, t: string) => {
    if (!d || !t) return "";
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const [hhRaw, miRaw] = t.split(":");
    const hh = pad(Number(hhRaw || 0));
    const mi = pad(Number(miRaw || 0));
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }, []);

  // Sync local storage with UI pickers
  useEffect(() => {
    const s = buildDatetimeString(date, time);
    if (s) setDatetime(s);
  }, [date, time, buildDatetimeString, setDatetime]);

  useEffect(() => {
    const s = buildDatetimeString(prevDate, prevTime);
    if (s) setPrevDatetime(s);
  }, [prevDate, prevTime, buildDatetimeString, setPrevDatetime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDatetimeStr =
      date && time ? buildDatetimeString(date, time) : datetime;
    const prevDatetimeStr =
      prevDate && prevTime
        ? buildDatetimeString(prevDate, prevTime)
        : prevDatetime;

    // Validation
    if (
      (courseType === "cancelled" && (!newDatetimeStr || !instructor.trim())) ||
      (courseType === "reschedule" &&
        (!newDatetimeStr || !prevDatetimeStr || !instructor.trim())) ||
      (courseType === "new" && (!newDatetimeStr || !instructor.trim()))
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newDateInfo = formatDate(newDatetimeStr);
    if (!newDateInfo) {
      toast.error("Invalid new date/time.");
      return;
    }

    const instructorName = instructor.trim();
    let result = "";

    if (courseType === "new") {
      result = `[hr][/hr]
[b]${newDateInfo.formatted} - ${instructorName}[/b]
[img]https://www.inyourowntime.zone/${newDateInfo.urlDate}_${newDateInfo.hours}.${newDateInfo.minutes}_UTC.png[/img]
[hr][/hr]`.trim();
    } else if (courseType === "cancelled") {
      result = `[hr][/hr]
[b][size=112][color=red]Class cancelled[/color][/size][/b]
[b][s]${newDateInfo.formatted} - ${instructorName}[/s][/b]
[img]https://www.inyourowntime.zone/${newDateInfo.urlDate}_${newDateInfo.hours}.${newDateInfo.minutes}_UTC.png[/img]
[hr][/hr]`.trim();
    } else if (courseType === "reschedule") {
      const prevDateInfo = formatDate(prevDatetimeStr);
      if (!prevDateInfo) {
        toast.error("Invalid previous date/time.");
        return;
      }
      result = `[hr][/hr]
[b][size=112][color=darkorange]Class rescheduled[/color][/size][/b]
[b][s]${prevDateInfo.formatted} - ${instructorName}[/s][/b]
[b]${newDateInfo.formatted} - ${instructorName}[/b]
[img]https://www.inyourowntime.zone/${newDateInfo.urlDate}_${newDateInfo.hours}.${newDateInfo.minutes}_UTC.png[/img]
[hr][/hr]`.trim();
    }

    setOutput(result);
    setCopied(false);
    toast.success("Course post generated successfully!");
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Copy & open: the listing is one edited post, so the generated block is
  // copied and that editor opens already holding it for the extension to fill.
  // No title - an edit keeps the post's own.
  const handleCopyAndOpen = () => {
    if (!output) return;
    copyBBCodeAndOpen({
      bbCodeText: output,
      url: UPCOMING_COURSES_POST_URL,
      post: {
        feature: "the BLS upcoming course generator",
        url: pickPostTarget(UPCOMING_COURSES_POST_URL),
      },
    });
  };

  const handleClear = () => {
    setCourseType("new");
    setDatetime("");
    setPrevDatetime("");
    setInstructor("");
    setDate(undefined);
    setTime("");
    setPrevDate(undefined);
    setPrevTime("");
    setOutput("");
    setCopied(false);
    toast.info("Form cleared.");
  };

  // The badge names the change the dropdown is set to, so the block's preview
  // says which of the three it is without opening the dropdown.
  const currentAction =
    UPCOMING_COURSES.find((option) => option.value === courseType) ??
    UPCOMING_COURSES[0];

  if (!isClient) return null;

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={2500} />

      <BuilderShell>
        <form onSubmit={handleSubmit}>
          <BuilderForm>
            <BuilderSection
              icon={CalendarClock}
              title="Class details"
              hint="The class you are putting on the listing, moving, or calling off."
            >
              <BuilderField
                label="What are you doing?"
                htmlFor="courseType"
                hint={currentAction.hint}
              >
                <Select
                  value={courseType}
                  onValueChange={(value) =>
                    setCourseType(value as UpcomingCourseType)
                  }
                >
                  <SelectTrigger id="courseType" className="w-full">
                    <SelectValue placeholder="Pick one" />
                  </SelectTrigger>
                  <SelectContent>
                    {UPCOMING_COURSES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </BuilderField>

              {(courseType === "new" ||
                courseType === "cancelled" ||
                courseType === "reschedule") && (
                <BuilderField
                  label="Course date & time (UTC)"
                  htmlFor="datetime"
                  hint="Used for the line in the listing and the timezone image."
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal sm:w-[260px]",
                            !date && !datetime && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="h-4 w-4" />
                          {date
                            ? format(date, "PPP")
                            : datetime
                              ? format(new Date(datetime + "Z"), "PPP")
                              : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => setDate(d)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Input
                      type="time"
                      value={
                        time ||
                        (datetime
                          ? format(new Date(datetime + "Z"), "HH:mm")
                          : "")
                      }
                      onChange={(e) => setTime(e.target.value)}
                      className="w-[140px]"
                    />
                    <NowTimeButton onFill={setTime} />
                  </div>
                </BuilderField>
              )}

              {courseType === "reschedule" && (
                <BuilderField
                  label="Previous date & time (UTC)"
                  htmlFor="prevDatetime"
                  hint="The class's original slot - it is struck through in the block."
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal sm:w-[260px]",
                            !prevDate &&
                              !prevDatetime &&
                              "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="h-4 w-4" />
                          {prevDate
                            ? format(prevDate, "PPP")
                            : prevDatetime
                              ? format(new Date(prevDatetime + "Z"), "PPP")
                              : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={prevDate}
                          onSelect={(d) => setPrevDate(d)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Input
                      type="time"
                      value={
                        prevTime ||
                        (prevDatetime
                          ? format(new Date(prevDatetime + "Z"), "HH:mm")
                          : "")
                      }
                      onChange={(e) => setPrevTime(e.target.value)}
                      className="w-[140px]"
                    />
                    <NowTimeButton onFill={setPrevTime} />
                  </div>
                </BuilderField>
              )}

              <BuilderField label="Instructor name" htmlFor="instructor">
                <Input
                  id="instructor"
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="First Last"
                  required
                />
              </BuilderField>

              <div className="flex flex-wrap gap-3 pt-1">
                <Button type="submit">Generate</Button>
                <Button variant="outline" type="button" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </BuilderSection>
          </BuilderForm>
        </form>

        {/* The listing is one edited post, so the block is copied into it
            rather than posted with a title of its own. */}
        <BuilderPreview
          icon={CalendarClock}
          title="Generated block"
          badge={currentAction.label}
          actions={
            <>
              <Button
                onClick={handleCopyAndOpen}
                disabled={!output}
                variant="outline"
                size="lg"
                className="w-full"
                title="Opens the Upcoming Courses post with this block already filled in"
              >
                <ExternalLink className="h-4 w-4" />
                Copy &amp; Open
              </Button>
              <Button
                onClick={handleCopy}
                disabled={!output}
                size="lg"
                className={
                  copied
                    ? "w-full bg-emerald-600 text-white hover:bg-emerald-500"
                    : "w-full"
                }
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ClipboardCopy className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy BBCode"}
              </Button>
            </>
          }
          note="Copy &amp; Open opens the Upcoming Courses post with this already filled in. The listing keeps its own title."
        >
          {output ? (
            <BuilderOutput label="Block" value={output} />
          ) : (
            <BuilderRequirement>
              Fill in the class details and press Generate to build the block.
            </BuilderRequirement>
          )}
        </BuilderPreview>
      </BuilderShell>
    </div>
  );
}
