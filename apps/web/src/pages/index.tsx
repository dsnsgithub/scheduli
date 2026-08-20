import { Schedule as ScheduleType, UnparsedDay, UnparsedSchedule } from "@scheduli/types";
import Link from "next/link";
import React from "react";

import Countdown from "@/components/index/Countdown";
import Schedule from "@/components/index/Schedule";
import Status from "@/components/index/Status";

import About from "./about";

//? Utility Functions --------------------------------------------------------------
function createCustomDate(inputTime: string) {
  const currentDate = new Date();

  const [inputHourRaw, inputMinuteRaw] = inputTime.split(":");
  const inputMinute = inputMinuteRaw.replace(/[A-Za-z]/g, ""); // Remove any non-numeric characters

  currentDate.setHours(parseInt(inputHourRaw), parseInt(inputMinute), 0, 0);
  return currentDate.getTime();
}

function sameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getOrdinalNumber(value: string | number) {
  if (!Number(value)) {
    // this is a string
    return value;
  }

  const number = Number(value);

  if (number % 100 >= 11 && number % 100 <= 13) {
    return number + "th";
  }

  switch (number % 10) {
    case 1:
      return number + "st";
    case 2:
      return number + "nd";
    case 3:
      return number + "rd";
    default:
      return number + "th";
  }
}

function createAvailablePeriodsDB(scheduleDB: UnparsedSchedule) {
  const availablePeriods = new Set<string>();

  for (const routineName in scheduleDB["routines"]) {
    const routine = scheduleDB["routines"][routineName];
    for (const event of routine.events) {
      availablePeriods.add(event.name);
    }
  }

  const entry: Record<string, null> = {};

  for (const period of availablePeriods) {
    entry[period] = null;
  }

  return entry;
}

function removePassing(scheduleDB: ScheduleType) {
  for (const scheduleName in scheduleDB["routines"]) {
    for (let i = scheduleDB["routines"][scheduleName]["events"].length - 1; i >= 0; i--) {
      const event = scheduleDB["routines"][scheduleName]["events"][i];
      if (event.periodName.startsWith("Passing")) {
        scheduleDB["routines"][scheduleName]["events"].splice(i, 1);
      }
    }
  }

  return scheduleDB;
}

function createRemovedPeriodsDB() {
  localStorage.setItem("removedPeriods", JSON.stringify([]));
}

function findCorrectPeriodName(periodName: string) {
  if (!localStorage.getItem("periodNames")) return periodName;
  const periodNames = JSON.parse(localStorage.getItem("periodNames") || "");

  return periodNames[periodName] || periodName;
}

function checkRemovedPeriods(period: string) {
  if (!localStorage.getItem("removedPeriods")) return false;

  const removedPeriodNames = JSON.parse(localStorage.getItem("removedPeriods") || "");
  return removedPeriodNames.includes(period);
}

function parseUserDate(dateString: string | UnparsedDay) {
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

function findCorrectSchedule(scheduleDB: UnparsedSchedule, currentDate: Date) {
  const currentTime = currentDate.getTime();
  const dayOfTheWeek = currentDate.getDay();
  let mostSpecificSchedule = null;
  let mostSpecificDate = null;

  // Check for summer
  if (
    new Date(scheduleDB["about"]["endDate"]).getTime() < currentTime &&
    new Date(scheduleDB["about"]["startDate"]).getTime() > currentTime
  ) {
    return null;
  }

  // Check for off days
  for (const item of scheduleDB["about"]["inactiveDays"]) {
    if (typeof item["days"] === "object") {
      const [rawStartDate, rawEndDate] = item["days"];
      const startDate = parseUserDate(rawStartDate);
      let endDate = parseUserDate(rawEndDate);

      // add one because the entire day of the endDate considered "off" still
      endDate = new Date(endDate.setDate(endDate.getDate() + 1));

      if (
        new Date(startDate).getTime() < currentTime &&
        new Date(endDate).getTime() > currentTime
      ) {
        return null;
      }
    } else {
      const startDate = parseUserDate(item["days"]);
      let endDate = parseUserDate(item["days"]);
      endDate = new Date(endDate.setDate(endDate.getDate() + 1));

      if (
        new Date(startDate).getTime() < currentTime &&
        new Date(endDate).getTime() > currentTime
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

          if (startDate.getTime() < currentTime && endDate.getTime() > currentTime) {
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

export default function Home() {
  const [scheduleDB, setScheduleDB] = React.useState<null | UnparsedSchedule>();
  const [isLoading, setLoading] = React.useState(true);
  const [currentDate, setCurrentDate] = React.useState(new Date());

  React.useEffect(() => {
    if (!localStorage.getItem("currentSchedule")) {
      setLoading(false);
      // fetch("/api/schedule/default")
      // 	.then((res) => res.json())
      // 	.then((data) => {
      // 		localStorage.setItem("currentSchedule", JSON.stringify(data));
      // 		setScheduleDB(data);
      // 		setLoading(false);
      // 	});
    } else {
      setScheduleDB(JSON.parse(localStorage.getItem("currentSchedule") || "{}"));
      setLoading(false);
    }
  }, []);

  // Re-evaluate the schedule when the calendar day changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDate((prev) => {
        if (prev.toDateString() !== now.toDateString()) {
          return now;
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
        <div className="flex items-center justify-center flex-col shadow-xl rounded-lg p-10 lg:p-24 bg-wedgewood-200 border-wedgewood-300 border-2">
          <h2 className="text-2xl mt-4">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!scheduleDB) {
    return (
      <>
        <div className="container mx-auto flex flex-col justify-center">
          <h2 className="text-2xl text-center bg-wedgewood-200 border-wedgewood-300 border-2 p-4 rounded-sm m-4">
            If you want to try out the web version, create a schedule{" "}
            <Link className="text-blue-700 mt-4" href="/create">
              here.
            </Link>
          </h2>
        </div>
        <About></About>
      </>
    );
  }

  const currentTime = currentDate.getTime();

  if (!localStorage.getItem("periodNames")) createAvailablePeriodsDB(scheduleDB);
  if (!localStorage.getItem("removedPeriods")) createRemovedPeriodsDB();

  const parsedScheduleDB: ScheduleType = JSON.parse(JSON.stringify(scheduleDB));

  // parse schedules, fixing names and other issues
  // must loop backwards to avoid weird index issues
  for (const scheduleName in scheduleDB["routines"]) {
    if (scheduleName == "about") continue;

    for (let i = scheduleDB["routines"][scheduleName]["events"].length - 1; i >= 0; i--) {
      const rawPeriodName = scheduleDB["routines"][scheduleName]["events"][i]["name"];
      if (checkRemovedPeriods(rawPeriodName)) {
        scheduleDB["routines"][scheduleName]["events"].splice(i, 1);
        continue;
      }

      let periodName = findCorrectPeriodName(rawPeriodName);
      if (periodName.length == 1) periodName = `${getOrdinalNumber(periodName)} period`;

      if (
        typeof parsedScheduleDB["routines"][scheduleName]["events"][Number(i)]["startTime"] ==
        "string"
      ) {
        parsedScheduleDB["routines"][scheduleName]["events"][Number(i)]["startTime"] =
          createCustomDate(scheduleDB["routines"][scheduleName]["events"][Number(i)]["startTime"]);
        parsedScheduleDB["routines"][scheduleName]["events"][Number(i)]["endTime"] =
          createCustomDate(scheduleDB["routines"][scheduleName]["events"][Number(i)]["endTime"]);
      }

      parsedScheduleDB["routines"][scheduleName]["events"][Number(i)]["periodName"] = periodName;
    }

    for (let i = parsedScheduleDB["routines"][scheduleName]["events"].length - 1; i >= 0; i--) {
      const event = parsedScheduleDB["routines"][scheduleName]["events"][i];
      if (event.name == "Passing") {
        if (i == parsedScheduleDB["routines"][scheduleName]["events"].length - 1) {
          parsedScheduleDB["routines"][scheduleName]["events"].pop();
          continue;
        }

        if (i == 0) {
          scheduleDB["routines"][scheduleName]["events"].shift();
          continue;
        }

        parsedScheduleDB["routines"][scheduleName]["events"][i]["periodName"] =
          `Passing - ${parsedScheduleDB["routines"][scheduleName]["events"][i + 1]["periodName"]}`;
      }
    }

    const times = parsedScheduleDB["routines"][scheduleName]["events"];
    const firstPeriod = times[0]["periodName"];
    const lastPeriod = times[times.length - 1]["periodName"];
    if (firstPeriod == "Break") {
      times.shift();
    }

    if (lastPeriod == "Break") {
      times.pop();
    }
  }

  // backwards compatibility
  if (!parsedScheduleDB["about"]["inactiveDays"]) {
    parsedScheduleDB["about"]["inactiveDays"] = parsedScheduleDB["about"]["inactive"].map(
      (item) => {
        return { description: "Inactive Day", days: item };
      },
    );

    localStorage.setItem("currentSchedule", JSON.stringify(scheduleDB));
    setScheduleDB(scheduleDB);
  }

  const correctScheduleName = findCorrectSchedule(scheduleDB, currentDate);

  if (correctScheduleName == null) {
    const tomorrowScheduleName = findCorrectSchedule(
      scheduleDB,
      new Date(currentDate.setDate(currentDate.getDate() + 1)),
    );
    if (tomorrowScheduleName != null) {
      const scheduleTimes = parsedScheduleDB["routines"][tomorrowScheduleName]["events"];

      return (
        <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
          <Status time="" timeRange="" className="No events for today."></Status>

          <div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 p-10">
            <h2 className="font-bold text-3xl flex justify-center mb-2 text-center">
              {"Tomorrow's Schedule:"}
            </h2>
            <Schedule
              scheduleTimes={scheduleTimes}
              scheduleDB={removePassing(parsedScheduleDB)}
            ></Schedule>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
        <Status time="" timeRange="" className="No events for today."></Status>
      </div>
    );
  }

  let scheduleTimes = parsedScheduleDB["routines"][correctScheduleName]["events"];

  if (scheduleTimes[scheduleTimes.length - 1]["endTime"] < currentTime) {
    const tomorrowScheduleName = findCorrectSchedule(
      scheduleDB,
      new Date(currentDate.setDate(currentDate.getDate() + 1)),
    );
    if (tomorrowScheduleName != null) {
      scheduleTimes = parsedScheduleDB["routines"][tomorrowScheduleName]["events"];

      return (
        <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
          <Status time="" timeRange="" className="All events are over for today."></Status>

          <div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 p-10">
            <h2 className="font-bold text-3xl flex justify-center mb-2 text-center">
              {"Tomorrow's Schedule:"}
            </h2>
            <Schedule
              scheduleTimes={scheduleTimes}
              scheduleDB={removePassing(parsedScheduleDB)}
            ></Schedule>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
      <Countdown scheduleTimes={scheduleTimes}></Countdown>

      <div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 p-10">
        <h2 className="font-bold text-3xl flex justify-center mb-2 text-center">
          {"Today's Schedule:"}
        </h2>
        <Schedule
          scheduleTimes={scheduleTimes}
          scheduleDB={removePassing(parsedScheduleDB)}
        ></Schedule>
      </div>
    </div>
  );
}
