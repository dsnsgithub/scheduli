import { ParsedDay, Schedule } from "@scheduli/types";

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

export default function specialSchedule(scheduleDB: Schedule, currentDate: Date) {
  const currentTime = currentDate.getTime();

  // Check for summer
  if (
    parseUserDate(scheduleDB["about"]["endDate"]).getTime() + 24 * 60 * 60 * 1000 <= currentTime ||
    parseUserDate(scheduleDB["about"]["startDate"]).getTime() >= currentTime
  ) {
    return "Outside of Start/End Date";
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
        return item["description"];
      }
    } else {
      const startDate = parseUserDate(item["days"]);
      let endDate = parseUserDate(item["days"]);
      endDate = new Date(endDate.setDate(endDate.getDate() + 1));

      if (
        new Date(startDate).getTime() <= currentTime &&
        new Date(endDate).getTime() >= currentTime
      ) {
        return item["description"];
      }
    }
  }

  return null;
}
