import { ParsedDay, Schedule } from "@scheduli/types";

function sameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function parseUserDate(dateString: string | number | Date) {
  // Create a new Date object from the input date string
  const userDate = new Date(dateString);

  // Get the user's timezone offset in minutes
  const userTimezoneOffset = userDate.getTimezoneOffset();

  // Calculate the user's actual timezone offset in milliseconds
  const userTimezoneOffsetMs = userTimezoneOffset * 60000;

  // Adjust the Date object to represent the date in the user's timezone
  const userTimezoneDate = new Date(userDate.getTime() + userTimezoneOffsetMs);

  return userTimezoneDate;
}

export default function findCorrectSchedule(
  scheduleDB: Schedule,
  currentDate: Date,
): string | null {
  const currentTime = currentDate.getTime();
  const dayOfTheWeek = currentDate.getDay();
  let mostSpecificSchedule = null;
  let mostSpecificDate = null;

  // Check for summer
  if (
    parseUserDate(scheduleDB["about"]["endDate"]).getTime() + 24 * 60 * 60 * 1000 < currentTime ||
    parseUserDate(scheduleDB["about"]["startDate"]).getTime() >= currentTime
  ) {
    return null;
  }

  // Check for off days
  for (const item of scheduleDB["about"]["inactiveDays"]) {
    if (typeof item["days"] === "object") {
      let [startDate, endDate] = item["days"] as ParsedDay[];
      startDate = parseUserDate(startDate);
      endDate = parseUserDate(endDate);

      // add one because the entire day of the endDate considered "off" still
      endDate = new Date(endDate.setDate(endDate.getDate() + 1));

      if (
        new Date(startDate).getTime() <= currentTime &&
        new Date(endDate).getTime() >= currentTime
      ) {
        return null;
      }
    } else {
      const startDate = parseUserDate(item["days"]);
      let endDate = parseUserDate(item["days"]);
      endDate = new Date(endDate.setDate(endDate.getDate() + 1));

      if (
        new Date(startDate).getTime() <= currentTime &&
        new Date(endDate).getTime() >= currentTime
      ) {
        return null;
      }
    }
  }

  for (const schedule in scheduleDB["routines"]) {
    if (schedule == "about") continue;

    const days = scheduleDB["routines"][schedule]["days"];

    for (const day of days) {
      if (typeof day == "number") {
        if (day == dayOfTheWeek) {
          if (typeof mostSpecificDate != "string") {
            mostSpecificSchedule = schedule;
            mostSpecificDate = dayOfTheWeek;
          }
        }
      } else {
        if (typeof day == "object") {
          const startDate = new Date(day[0]);
          let endDate = new Date(day[1]);
          endDate = new Date(endDate.setDate(endDate.getDate() + 1));

          if (startDate.getTime() <= currentTime && endDate.getTime() >= currentTime) {
            return schedule;
          }
        } else {
          if (sameDay(currentDate, parseUserDate(day))) {
            return schedule;
          }
        }
      }
    }
  }

  return mostSpecificSchedule;
}
