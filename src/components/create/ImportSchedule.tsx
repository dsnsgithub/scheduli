import React from "react";
import { Dialog, Tab, Listbox } from "@headlessui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

async function convertStudyListToSchedule(studyList: string) {
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

  let defaultSchedule = {
    about: {
      sync: true,
      lastUpdated: "2025-10-10",
      compatibleVersion: "1.9.3",
      name: "UCI Fall 2025 Schedule",
      startDate: "2025-09-22",
      endDate: "2025-12-13",
      inactiveDays: [],
      allEvents: [] as string[],
    },
    routines: {},
  };

  if (!studyList) {
    return [];
  }

  let courseCodes = [];
  for (const classObj of studyList.split("\n")) {
    const firstTerm = classObj.trim().split(" ")[0];
    if (Number(firstTerm)) {
      courseCodes.push(Number(firstTerm));
    }
  }

  let rawUCIData: Record<
    string,
    { days: string; startTime: string; endTime: string }
  > = {};
  const courseData = await fetch(
    `https://anteaterapi.com/v2/rest/websoc?quarter=Fall&sectionCodes=${courseCodes.join(",")}&year=2025`,
  ).then((res) => res.json());

  if (courseData["ok"]) {
    for (const school of courseData["data"]["schools"]) {
      for (const department of school["departments"]) {
        for (const course of department["courses"]) {
          for (const section of course["sections"]) {
            for (const meeting of section["meetings"]) {
              const courseName =
                `${course["deptCode"]} ${course["courseNumber"]} ${section["sectionType"]}` as string;
              rawUCIData[courseName] = {
                days: meeting["days"],
                startTime: meeting["startTime"],
                endTime: meeting["endTime"],
              };
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

  for (const index in daysOfTheWeek) {
    const classesToday = {};
    for (const courseName in rawUCIData) {
      const days = daysToNumbers(rawUCIData[courseName]["days"]);

      if (days.includes(Number(index))) {
        classesToday[courseName] = rawUCIData[courseName];
      }
    }

    if (Object.keys(classesToday).length === 0) {
      continue;
    }

    defaultSchedule["routines"][daysOfTheWeek[index]] = {
      officialName: daysOfTheWeek[index],
      name: daysOfTheWeek[index],
      days: [index],
      events: [],
    };

    for (const courseName in classesToday) {
      const { startTime, endTime } = rawUCIData[courseName];

      defaultSchedule["routines"][daysOfTheWeek[index]].events.push({
        officialName: courseName,
        name: courseName,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
      });
    }
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
  const [studyList, setStudyList] = React.useState("");

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
            
            

            <p className="mt-10">Paste the contents of your Study List below to import it into Scheduli. To find your Study List, go to WebReg or StudentAccess, and click on Study List once you{"'}ve logged in. Copy everything below the column names (Code, Dept, etc.) under the Enrolled Classes section.</p>
            {/* allow multiple lines */}
            <textarea
              rows={10}
              placeholder=""
              className="border border-gray-300 rounded-md px-4 py-2 w-full "
              onChange={(e) => setStudyList(e.target.value)}
            />

            <button
              className="bg-wedgewood-500 hover:bg-wedgewood-600 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={async () => {
                const data = await convertStudyListToSchedule(studyList);

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
