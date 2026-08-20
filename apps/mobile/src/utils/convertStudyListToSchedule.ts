import { UnparsedEvent, UnparsedSchedule } from "@scheduli/types";

function daysToNumbers(s: string): number[] {
  const daysMap: { [key: string]: number } = {
    Su: 0,
    M: 1,
    Tu: 2,
    W: 3,
    Th: 4,
    F: 5,
    Sa: 6,
  };
  const result: number[] = [];
  let i = 0;
  while (i < s.length) {
    // Check 2-letter abbreviation first (greedy)
    if (i + 2 <= s.length && s.substring(i, i + 2) in daysMap) {
      result.push(daysMap[s.substring(i, i + 2)]);
      i += 2;
    }
    // Then check 1-letter
    else if (i + 1 <= s.length && s.substring(i, i + 1) in daysMap) {
      result.push(daysMap[s.substring(i, i + 1)]);
      i += 1;
    } else {
      throw new Error(`Invalid day abbreviation at position ${i}: '${s.substring(i)}'`);
    }
  }
  return result;
}

function formatTime(time: { hour: number; minute: number }): string {
  const hourStr = time.hour.toString().padStart(2, "0");
  const minStr = time.minute.toString().padStart(2, "0");
  return `${hourStr}:${minStr}`;
}

function sortByStartTime(array: UnparsedEvent[]) {
  return array.sort((a, b) => {
    const startTimeA = a.startTime.split(":").map(Number);
    const startTimeB = b.startTime.split(":").map(Number);

    if (startTimeA[0] !== startTimeB[0]) {
      return startTimeA[0] - startTimeB[0]; // Sort by hour
    } else {
      return startTimeA[1] - startTimeB[1]; // If hours are the same, sort by minute
    }
  });
}

export default async function convertStudyListToSchedule(
  studyList: string,
  quarterName: string,
  year: Number,
): Promise<UnparsedSchedule> {
  const termCalendar = await fetch(
    `https://anteaterapi.com/v2/rest/calendar?year=${year}&quarter=${quarterName}`,
  ).then((response) => response.json());

  let defaultSchedule: UnparsedSchedule = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/api/schedule/uci`,
  ).then((response) => response.json());

  defaultSchedule.about.name = `UCI ${quarterName} ${year} Schedule`;
  defaultSchedule.about.startDate = termCalendar.data.instructionStart;
  defaultSchedule.about.endDate = termCalendar.data.instructionEnd;

  if (!studyList) {
    return null;
  }

  let courseCodes = [];
  for (const classObj of studyList.split("\n")) {
    const firstTerm = classObj.trim().split(" ")[0];
    if (Number(firstTerm)) {
      courseCodes.push(Number(firstTerm));
    }
  }

  interface CourseData {
    name: string;
    days: string;
    startTime: { hour: number; minute: number };
    endTime: { hour: number; minute: number };
  }

  let rawUCIData: CourseData[] = [];
  const courseData = await fetch(
    `https://anteaterapi.com/v2/rest/websoc?quarter=${quarterName}&sectionCodes=${courseCodes.join(",")}&year=${year}`,
  ).then((res) => res.json());

  if (courseData["ok"]) {
    for (const school of courseData["data"]["schools"]) {
      for (const department of school["departments"]) {
        for (const course of department["courses"]) {
          for (const section of course["sections"]) {
            for (const meeting of section["meetings"]) {
              const courseName =
                `${course["deptCode"]} ${course["courseNumber"]} ${section["sectionType"]}` as string;

              if (!meeting["days"] || !meeting["startTime"] || !meeting["endTime"]) continue;

              rawUCIData.push({
                name: courseName,
                days: meeting["days"],
                startTime: meeting["startTime"],
                endTime: meeting["endTime"],
              });
            }
          }
        }
      }
    }
  }

  defaultSchedule["about"]["allEvents"] = Object.keys(rawUCIData);

  const daysOfTheWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  for (let index in daysOfTheWeek) {
    const classesToday: CourseData[] = [];
    for (const course of rawUCIData) {
      const days = daysToNumbers(course["days"]);

      if (days.includes(Number(index))) {
        classesToday.push(course);
      }
    }

    if (Object.keys(classesToday).length === 0) {
      continue;
    }

    defaultSchedule["routines"][
      daysOfTheWeek[Number(index)] as keyof (typeof defaultSchedule)["routines"]
    ] = {
      officialName: daysOfTheWeek[Number(index)],
      days: [Number(index)],
      events: [],
    };

    for (const course of classesToday) {
      const { startTime, endTime } = course;

      defaultSchedule["routines"][daysOfTheWeek[index]].events.push({
        rawPeriodName: course.name,
        name: course.name,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
      });
    }
  }

  for (const routine in defaultSchedule["routines"]) {
    defaultSchedule["routines"][routine]["events"] = sortByStartTime(
      defaultSchedule["routines"][routine]["events"],
    );
  }

  return defaultSchedule;
}
