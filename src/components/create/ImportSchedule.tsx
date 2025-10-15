import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, Listbox } from "@headlessui/react";
import React from "react";
import { UnparsedSchedule, UnparsedEvent } from "@/types";
import Link from "next/link";

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
      throw new Error(
        `Invalid day abbreviation at position ${i}: '${s.substring(i)}'`,
      );
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

export async function convertStudyListToSchedule(
  studyList: string,
  quarterName: string,
  year: Number,
): Promise<UnparsedSchedule | null> {
  const termCalendar = await fetch(
    `https://anteaterapi.com/v2/rest/calendar?year=${year}&quarter=${quarterName}`,
  ).then((response) => response.json());

  let defaultSchedule: UnparsedSchedule = await fetch("/api/schedule/uci").then(
    (response) => response.json(),
  );

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

export default function ImportSchedule(props: {
  schedule: any;
  setSchedule: Function;
  isOpen: boolean;
  setIsOpen: Function;
  setCurrentRoutine: Function;
  setScheduleStartDate: Function;
  setScheduleEndDate: Function;
  setScheduleName: Function;
}) {
  const schedulesArray = [{ id: "dvhs", name: "DVHS", unavailable: false }];
  const [selectedSchedule, setSelectedSchedule] = React.useState(
    schedulesArray[0],
  );

  const [studyList, setStudyList] = React.useState("Paste here.");
  const [selectedQuarter, setSelectedQuarter] = React.useState<string | null>(
    null,
  );

  const [possibleQuartersData, setPossibleQuartersData] = React.useState<
    { [key: string]: string }[] | null
  >(null);

  React.useEffect(() => {
    const fetchQuarters = async () => {
      const possibleQuartersData = await fetch(
        "https://anteaterapi.com/v2/rest/websoc/terms",
      ).then((res) => res.json());

      setPossibleQuartersData(possibleQuartersData.data);
      setSelectedQuarter(
        possibleQuartersData ? possibleQuartersData.data[0].shortName : "",
      );

      console.log(
        possibleQuartersData ? possibleQuartersData.data[0].shortName : "",
      );
    };

    fetchQuarters();
  }, []);

  return (
    <Dialog
      open={props.isOpen}
      onClose={() => props.setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-10">
        <Dialog.Panel className="w-full max-w-lg bg-wedgewood-200 p-10">
          <Dialog.Title className="font-bold text-2xl">
            Choose Schedule Preset
          </Dialog.Title>

          <div className="bg-wedgewood-300 p-10 mt-4">
            <Listbox value={selectedSchedule} onChange={setSelectedSchedule}>
              <Listbox.Button className="bg-wedgewood-500 p-4 shadow-xl">
                {selectedSchedule.name}{" "}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  size="lg"
                ></FontAwesomeIcon>
              </Listbox.Button>
              <Listbox.Options className="bg-wedgewood-400 p-4 shadow-xl">
                {schedulesArray.map((schedule) => (
                  <Listbox.Option
                    key={schedule.id}
                    value={schedule}
                    disabled={schedule.unavailable}
                    className="shadow-xl mt-2 border-2 border-wedgewood-600 ui-active:bg-wedgewood-500 ui-not-active:bg-wedgewood-400 ui-not-active:text-black p-3 rounded"
                  >
                    {schedule.name}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>

          <div className="grid justify-items-end">
            <button
              className="bg-wedgewood-400 ml-4 p-3 px-4 rounded mt-6"
              onClick={() => {
                fetch(`/api/schedule/${selectedSchedule.id}`)
                  .then((res) => res.json())
                  .then((data) => {
                    localStorage.setItem(
                      "currentSchedule",
                      JSON.stringify(data),
                    );
                    props.setSchedule(data);

                    localStorage.setItem("periodNames", "");
                    localStorage.setItem("removedPeriods", "");

                    props.setCurrentRoutine(
                      Object.keys(
                        JSON.parse(
                          localStorage.getItem("currentSchedule") || "",
                        )["routines"],
                      )[0],
                    );

                    props.setScheduleName(
                      JSON.parse(localStorage.getItem("currentSchedule") || "")[
                        "about"
                      ]["name"],
                    );
                    props.setScheduleStartDate(
                      JSON.parse(localStorage.getItem("currentSchedule") || "")[
                        "about"
                      ]["startDate"],
                    );
                    props.setScheduleEndDate(
                      JSON.parse(localStorage.getItem("currentSchedule") || "")[
                        "about"
                      ]["endDate"],
                    );
                  });
                props.setIsOpen(false);
              }}
            >
              Add Schedule
            </button>

            <h2 className="mt-10 text-sm">
              Log into{" "}
              <Link
                className="text-blue-500 hover:text-blue-700"
                href="https://www.reg.uci.edu/cgi-bin/webreg-redirect.sh"
              >
                WebReg/StudentAccess
              </Link>
              , tap Study List, and copy everything below the headers (Code,
              Dept, etc.)
            </h2>

            {/* allow multiple lines */}
            <textarea
              rows={10}
              placeholder="Paste the contents of your Study List below to import it into Scheduli."
              className="border border-gray-300 rounded-md px-4 py-2 w-full "
              onChange={(e) => setStudyList(e.target.value)}
            />

            <button
              className="bg-wedgewood-500 hover:bg-wedgewood-600 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={async () => {
                const data = await convertStudyListToSchedule(
                  studyList,
                  selectedQuarter?.split(" ")[1] || "Fall",
                  Number(selectedQuarter?.split(" ")[0]) || 2025,
                ).catch((error) => {
                  console.error(error);
                  alert("Error converting Study List to Schedule");
                  props.setIsOpen(false);
                  return;
                });

                if (!data || Object.keys(data.routines).length === 0) {
                  alert("Error: Invalid schedule");
                  return;
                }

                localStorage.setItem("currentSchedule", JSON.stringify(data));
                props.setSchedule(data);

                localStorage.setItem("periodNames", "");
                localStorage.setItem("removedPeriods", "");

                props.setCurrentRoutine(
                  Object.keys(
                    JSON.parse(localStorage.getItem("currentSchedule") || "")[
                      "routines"
                    ],
                  )[0],
                );

                props.setScheduleName(
                  JSON.parse(localStorage.getItem("currentSchedule") || "")[
                    "about"
                  ]["name"],
                );
                props.setScheduleStartDate(
                  JSON.parse(localStorage.getItem("currentSchedule") || "")[
                    "about"
                  ]["startDate"],
                );
                props.setScheduleEndDate(
                  JSON.parse(localStorage.getItem("currentSchedule") || "")[
                    "about"
                  ]["endDate"],
                );

                props.setIsOpen(false);
              }}
            >
              Import UCI Schedule
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
