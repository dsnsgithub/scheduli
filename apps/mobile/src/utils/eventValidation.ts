import { UnparsedEvent } from "@scheduli/types";

function toTimestamp(inputTime: string) {
  const date = new Date();

  const [hourRaw, minuteRaw] = inputTime.split(":");
  const minute = minuteRaw.replace(/[A-Za-z]/g, "");

  date.setHours(parseInt(hourRaw), parseInt(minute), 0, 0);
  return date.getTime();
}

export function findEventConflict(events: UnparsedEvent[]) {
  for (let i = 0; i < events.length; i++) {
    const current = events[i];

    if (toTimestamp(current.startTime) >= toTimestamp(current.endTime)) {
      return `"${current.name}" has to end after it starts.`;
    }

    const next = events[i + 1];
    if (next && toTimestamp(current.endTime) > toTimestamp(next.startTime)) {
      return `"${current.name}" overlaps with "${next.name}". Change one of their times so they don't run at the same time.`;
    }
  }

  return null;
}
