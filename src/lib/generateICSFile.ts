import { ScheduleDB } from "@/components/index/Schedule";

export function generateICSFile(scheduleDB: ScheduleDB): string {
  const header = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Scheduli//Schedule Export//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${scheduleDB.about.name}
X-WR-TIMEZONE:America/Los_Angeles
BEGIN:VTIMEZONE
TZID:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`;

  const events: string[] = [];
  const startDate = new Date(scheduleDB.about.startDate);
  const endDate = new Date(scheduleDB.about.endDate);

  for (const routineName in scheduleDB.routines) {
    const routine = scheduleDB.routines[routineName];

    for (const dayPattern of routine.days) {
      const dates = getDatesForPattern(dayPattern, startDate, endDate);

      for (const date of dates) {
        for (const event of routine.events) {
          const eventStart = new Date(date);
          const eventEnd = new Date(date);

          const [sh, sm] = event.startTime.split(":").map(Number);
          const [eh, em] = event.endTime.split(":").map(Number);

          eventStart.setHours(sh, sm, 0, 0);
          eventEnd.setHours(eh, em, 0, 0);

          if (isInactiveDay(eventStart, scheduleDB.about.inactiveDays))
            continue;

          const dtStart = formatLocalICSDate(eventStart);
          const dtEnd = formatLocalICSDate(eventEnd);

          events.push(`BEGIN:VEVENT
UID:${routineName}-${event.rawPeriodName}-${eventStart.getTime()}@scheduli
DTSTART;TZID=America/Los_Angeles:${dtStart}
DTEND;TZID=America/Los_Angeles:${dtEnd}
SUMMARY:${escapeICS(event.name || event.rawPeriodName)}
DESCRIPTION:${escapeICS(routine.officialName || "")}
LOCATION:${escapeICS(event.location || "")}
END:VEVENT`);
        }
      }
    }
  }

  return `${header}\n${events.join("\n")}\nEND:VCALENDAR`;
}

// ──────────────────────────────────────────────────
// Helper functions (keep these too)
// ──────────────────────────────────────────────────

function getDatesForPattern(
  dayPattern: number | string | [string, string],
  startDate: Date,
  endDate: Date,
): Date[] {
  const dates: Date[] = [];

  if (typeof dayPattern === "number") {
    // 0 = Sunday, 1 = Monday, ...
    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    while (current <= endDate) {
      if (current.getDay() === dayPattern) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
  } else if (typeof dayPattern === "string") {
    const d = new Date(dayPattern);
    if (d >= startDate && d <= endDate) dates.push(d);
  } else if (Array.isArray(dayPattern)) {
    let current = new Date(dayPattern[0]);
    const rangeEnd = new Date(dayPattern[1]);
    while (current <= rangeEnd && current <= endDate) {
      if (current >= startDate) dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }

  return dates;
}

function isInactiveDay(date: Date, inactiveDays: any[]): boolean {
  return inactiveDays.some((item: any) => {
    if (Array.isArray(item.days)) {
      const [s, e] = item.days;
      return date >= new Date(s) && date <= new Date(e);
    }
    return sameDay(date, new Date(item.days));
  });
}

function sameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Format as local time without Z (e.g. 20250929T120000)
function formatLocalICSDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}`;
}

// Simple escaping for iCalendar text fields
function escapeICS(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
