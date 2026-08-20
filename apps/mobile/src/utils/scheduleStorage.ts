import { UnparsedSchedule } from "@scheduli/types";

import storage from "./storage";

export function getAvailablePeriods(scheduleDB: UnparsedSchedule): Record<string, null> {
  const availablePeriods: string[] = [];

  for (const routineName in scheduleDB.routines) {
    for (const event of scheduleDB.routines[routineName].events) {
      if (!availablePeriods.includes(event.name)) {
        availablePeriods.push(event.name);
      }
    }
  }

  const entry: Record<string, null> = {};
  for (const period of availablePeriods) {
    entry[period] = null;
  }

  return entry;
}

// Only use when importing schedule
export function createAvailablePeriodsDB(scheduleDB: UnparsedSchedule) {
  storage.set("periodNames", JSON.stringify(getAvailablePeriods(scheduleDB)));
}

export function createRemovedPeriodsDB() {
  storage.set("removedPeriods", JSON.stringify([]));
}
