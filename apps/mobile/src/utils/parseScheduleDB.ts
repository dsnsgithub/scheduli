import { PeriodNames, Schedule, UnparsedSchedule } from "@scheduli/types";

import storage from "./storage";

function createAvailablePeriodsDB(scheduleDB: UnparsedSchedule) {
  let availablePeriods: string[] = [];

  // Extract period names from the "routines" section
  for (const routineName in scheduleDB["routines"]) {
    const routine = scheduleDB["routines"][routineName];
    for (const event of routine.events) {
      if (availablePeriods.includes(event.name)) continue;

      availablePeriods.push(event.name);
    }
  }

  // Extract period names from other sections if needed
  let entry: Record<string, null> = {};

  for (const period of availablePeriods) {
    entry[period] = null;
  }

  storage.set("periodNames", JSON.stringify(entry));
}

function createRemovedPeriodsDB() {
  storage.set("removedPeriods", JSON.stringify([]));
}

function findCorrectPeriodName(periodName: string) {
  if (!storage.getString("periodNames")) return periodName;

  const res = storage.getString("periodNames");
  const periodNames = JSON.parse(res) as PeriodNames;

  return periodNames[periodName] || periodName;
}

function checkRemovedPeriods(period: string) {
  if (!storage.getString("removedPeriods")) return false;

  const removedPeriodNames = JSON.parse(storage.getString("removedPeriods") || "") as string[];
  return removedPeriodNames.includes(period);
}

function getOrdinalNumber(number: number | string): string | number {
  const numValue = Number(number);
  if (!numValue) {
    // this is not a number lol
    return number;
  }

  if (numValue % 100 >= 11 && numValue % 100 <= 13) {
    return numValue + "th";
  }

  switch (numValue % 10) {
    case 1:
      return numValue + "st";
    case 2:
      return numValue + "nd";
    case 3:
      return numValue + "rd";
    default:
      return numValue + "th";
  }
}

function createCustomDate(inputTime: string) {
  const currentDate = new Date();

  const [inputHourRaw, inputMinuteRaw] = inputTime.split(":");
  const inputMinute = inputMinuteRaw.replace(/[A-Za-z]/g, ""); // Remove any non-numeric characters

  currentDate.setHours(parseInt(inputHourRaw), parseInt(inputMinute), 0, 0);
  return currentDate.getTime();
}

export default function parseScheduleDB(scheduleDB: UnparsedSchedule) {
  const copiedScheduleDB = JSON.parse(JSON.stringify(scheduleDB)) as UnparsedSchedule;
  if (!storage.getString("periodNames")) createAvailablePeriodsDB(copiedScheduleDB);
  if (!storage.getString("removedPeriods")) createRemovedPeriodsDB();

  // backwards compatibility
  if (!copiedScheduleDB["about"]["inactiveDays"]) {
    copiedScheduleDB["about"]["inactiveDays"] = copiedScheduleDB["about"]["inactive"].map(
      (item) => {
        return { description: "Inactive Day", days: item };
      },
    );

    storage.set("currentSchedule", JSON.stringify(copiedScheduleDB));
  }

  // parse schedules, fixing names and other issues
  // must loop backwards to avoid weird index issues
  for (const scheduleName in copiedScheduleDB["routines"]) {
    if (scheduleName == "about") continue;

    for (let i = copiedScheduleDB["routines"][scheduleName]["events"].length - 1; i >= 0; i--) {
      const rawPeriodName = copiedScheduleDB["routines"][scheduleName]["events"][i]["name"];
      if (checkRemovedPeriods(rawPeriodName)) {
        copiedScheduleDB["routines"][scheduleName]["events"].splice(i, 1);
        continue;
      }

      let periodName = findCorrectPeriodName(rawPeriodName);
      if (periodName.length == 1) periodName = `${getOrdinalNumber(periodName)} Period`;

      if (
        typeof copiedScheduleDB["routines"][scheduleName]["events"][Number(i)]["startTime"] ==
        "string"
      ) {
        const event = copiedScheduleDB["routines"][scheduleName]["events"][Number(i)] as {
          rawPeriodName: string;
          name: string;
          startTime: string | number;
          endTime: string | number;
          periodName?: string;
          userCreated?: boolean;
        };
        event["startTime"] = createCustomDate(event["startTime"] as string);
        event["endTime"] = createCustomDate(event["endTime"] as string);
      }

      copiedScheduleDB["routines"][scheduleName]["events"][Number(i)]["periodName"] = periodName;
    }

    if (
      storage.getString("passingPeriods") == "true" ||
      storage.getString("passingPeriods") === undefined
    ) {
      for (let i = copiedScheduleDB["routines"][scheduleName]["events"].length - 1; i >= 0; i--) {
        const event = copiedScheduleDB["routines"][scheduleName]["events"][i];
        if (event.name == "Passing") {
          if (i == copiedScheduleDB["routines"][scheduleName]["events"].length - 1) {
            copiedScheduleDB["routines"][scheduleName]["events"].pop();
            continue;
          }

          if (i == 0) {
            copiedScheduleDB["routines"][scheduleName]["events"].shift();
            continue;
          }

          copiedScheduleDB["routines"][scheduleName]["events"][i]["periodName"] =
            `Passing - ${copiedScheduleDB["routines"][scheduleName]["events"][i + 1]["periodName"]}`;
        }
      }
    } else {
      for (let i = copiedScheduleDB["routines"][scheduleName]["events"].length - 1; i >= 0; i--) {
        const event = copiedScheduleDB["routines"][scheduleName]["events"][i];
        if (event.name == "Passing") {
          copiedScheduleDB["routines"][scheduleName]["events"].splice(i, 1);
        }
      }
    }

    if (copiedScheduleDB["routines"][scheduleName]["events"].length >= 2) {
      const times = copiedScheduleDB["routines"][scheduleName]["events"];
      const firstPeriod = times[0]["periodName"];
      const lastPeriod = times[times.length - 1]["periodName"];
      if (firstPeriod == "Break") {
        times.shift();
      }

      if (lastPeriod == "Break") {
        times.pop();
      }
    }
  }

  // we have converted UnparsedSchedule to Schedule, so we can return it
  return copiedScheduleDB as unknown as Schedule;
}
