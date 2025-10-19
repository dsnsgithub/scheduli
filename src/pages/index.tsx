import React from "react";
import Link from "next/link";

import Schedule from "../components/index/Schedule";
import Status from "../components/index/Status";
import Countdown from "../components/index/Countdown";

import About from "./about";

export interface ScheduleDB {
  about: About;
  routines: Routines;
}

export interface Routines {
  [key: string]: Schedule;
}
export interface About {
  startDate: string;
  endDate: string;
  inactiveDays: any[];
  allEvents: string[];
}

export interface Schedule {
  officialName: string;
  days: any[];
  times: Time[];
  events: Time[];
}

export interface Time {
  rawPeriodName: string;
  name: string;
  startTime: number;
  endTime: number;
  periodName: string;
  userCreated?: boolean;
}

export interface UpdatedTime {
  periodName: string;
  rawPeriodName: string;
  startTime: number;
  endTime: number;
}

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

function getOrdinalNumber(number: any) {
  if (!Number(number)) {
    // this is not a number lol
    return number;
  }

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

function createAvailablePeriodsDB(scheduleDB: any) {
  let availablePeriods = new Set();

  for (const routineName in scheduleDB["routines"]) {
    const routine = scheduleDB["routines"][routineName];
    for (const event of routine.events) {
      availablePeriods.add(event.name);
    }
  }

  let entry: Record<string, null> = {};

  // @ts-ignore
  for (const period of availablePeriods) {
    // @ts-ignore
    entry[period] = null;
  }

  return entry;
}

function mergeObjects(objectA: any, objectB: any) {
  const result = { ...objectB };

  for (const key in objectA) {
    if (objectB.hasOwnProperty(key)) {
      result[key] = objectA[key];
    }
  }

  return result;
}

function removePassing(scheduleDB: ScheduleDB) {
  for (const scheduleName in scheduleDB["routines"]) {
    for (
      let i = scheduleDB["routines"][scheduleName]["events"].length - 1;
      i >= 0;
      i--
    ) {
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

  const removedPeriodNames = JSON.parse(
    localStorage.getItem("removedPeriods") || "",
  );
  return removedPeriodNames.includes(period);
}

function parseUserDate(dateString: string) {
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

function findCorrectSchedule(scheduleDB: ScheduleDB, currentDate: Date) {
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
      let [startDate, endDate] = item["days"];
      startDate = parseUserDate(startDate);
      endDate = parseUserDate(endDate);

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

    // @ts-ignore
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

          if (
            startDate.getTime() < currentTime &&
            endDate.getTime() > currentTime
          ) {
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
  let [scheduleDB, setScheduleDB] = React.useState<null | ScheduleDB>();
  const [isLoading, setLoading] = React.useState(true);

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
      setScheduleDB(
        JSON.parse(localStorage.getItem("currentSchedule") || "{}"),
      );
      setLoading(false);
    }
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
          <h2 className="text-2xl text-center bg-wedgewood-200 border-wedgewood-300 border-2 p-4 rounded m-4">
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

  const currentDate = new Date();
  const currentTime = currentDate.getTime();

  if (!localStorage.getItem("periodNames"))
    createAvailablePeriodsDB(scheduleDB);
  if (!localStorage.getItem("removedPeriods")) createRemovedPeriodsDB();

  // parse schedules, fixing names and other issues
  // must loop backwards to avoid weird index issues
  for (const scheduleName in scheduleDB["routines"]) {
    if (scheduleName == "about") continue;

    // @ts-ignore
    for (
      let i = scheduleDB["routines"][scheduleName]["events"].length - 1;
      i >= 0;
      i--
    ) {
      const rawPeriodName =
        scheduleDB["routines"][scheduleName]["events"][i]["name"];
      // @ts-ignore
      if (checkRemovedPeriods(rawPeriodName)) {
        // @ts-ignore
        scheduleDB["routines"][scheduleName]["events"].splice(i, 1);
        continue;
      }

      let periodName = findCorrectPeriodName(rawPeriodName);
      if (periodName.length == 1)
        periodName = `${getOrdinalNumber(periodName)} period`;

      if (
        typeof scheduleDB["routines"][scheduleName]["events"][Number(i)][
          "startTime"
        ] == "string"
      ) {
        // @ts-ignore
        scheduleDB["routines"][scheduleName]["events"][Number(i)]["startTime"] =
          createCustomDate(
            // @ts-ignore
            scheduleDB["routines"][scheduleName]["events"][Number(i)][
              "startTime"
            ],
          );
        // @ts-ignore
        scheduleDB["routines"][scheduleName]["events"][Number(i)]["endTime"] =
          createCustomDate(
            // @ts-ignore
            scheduleDB["routines"][scheduleName]["events"][Number(i)][
              "endTime"
            ],
          );
      }

      // @ts-ignore
      scheduleDB["routines"][scheduleName]["events"][Number(i)]["periodName"] =
        periodName;
    }

    // @ts-ignore
    for (
      let i = scheduleDB["routines"][scheduleName]["events"].length - 1;
      i >= 0;
      i--
    ) {
      const event = scheduleDB["routines"][scheduleName]["events"][i];
      // @ts-ignore
      if (event.name == "Passing") {
        // @ts-ignore
        if (i == scheduleDB["routines"][scheduleName]["events"].length - 1) {
          // @ts-ignore
          scheduleDB["routines"][scheduleName]["events"].pop();
          continue;
        }

        if (i == 0) {
          // @ts-ignore
          scheduleDB["routines"][scheduleName]["events"].shift();
          continue;
        }

        // @ts-ignore
        scheduleDB["routines"][scheduleName]["events"][i]["periodName"] =
          `Passing - ${scheduleDB["routines"][scheduleName]["events"][i + 1]["periodName"]}`;
      }
    }

    const times = scheduleDB["routines"][scheduleName][
      "events"
    ] as UpdatedTime[];
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
  if (!scheduleDB["about"]["inactiveDays"]) {
    // @ts-ignore
    scheduleDB["about"]["inactiveDays"] = scheduleDB["about"]["inactive"].map(
      // @ts-ignore
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
      const scheduleTimes =
        scheduleDB["routines"][tomorrowScheduleName]["events"];

      return (
        <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
          <Status
            time=""
            timeRange=""
            className="No events for today."
          ></Status>

          <div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 p-10">
            <h2 className="font-bold text-3xl flex justify-center mb-2 text-center">
              {"Tomorrow's Schedule:"}
            </h2>
            <Schedule
              scheduleTimes={scheduleTimes}
              scheduleDB={removePassing(scheduleDB)}
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

  let scheduleTimes = scheduleDB["routines"][correctScheduleName]["events"];

  // @ts-ignore
  if (scheduleTimes[scheduleTimes.length - 1]["endTime"] < currentTime) {
    const tomorrowScheduleName = findCorrectSchedule(
      scheduleDB,
      new Date(currentDate.setDate(currentDate.getDate() + 1)),
    );
    if (tomorrowScheduleName != null) {
      scheduleTimes = scheduleDB["routines"][tomorrowScheduleName]["events"];

      return (
        <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
          <Status
            time=""
            timeRange=""
            className="All events are over for today."
          ></Status>

          <div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 p-10">
            <h2 className="font-bold text-3xl flex justify-center mb-2 text-center">
              {"Tomorrow's Schedule:"}
            </h2>
            <Schedule
              scheduleTimes={scheduleTimes}
              scheduleDB={removePassing(scheduleDB)}
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
          scheduleDB={removePassing(scheduleDB)}
        ></Schedule>
      </div>
    </div>
  );
}
