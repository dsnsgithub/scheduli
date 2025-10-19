import React from "react";

import EventEditor from "../components/create/EventEditor";
import Routine from "../components/create/Routine";
import ImportSchedule from "../components/create/ImportSchedule";
import InactiveDayEditor from "../components/create/InactiveDayEditor";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faRotateLeft,
  faFileImport,
} from "@fortawesome/free-solid-svg-icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";

function createNewRoutine(schedule: any, setSchedule: Function) {
  const enteredName = prompt("Please enter a routine name:");

  if (enteredName) {
    const newSchedule = { ...schedule };
    newSchedule["routines"][enteredName] = {
      officialName: enteredName,
      days: [1, 2, 3],
      events: [
        {
          name: "New Event!!",
          startTime: "08:40",
          endTime: "08:45",
        },
      ],
    };

    setSchedule(newSchedule);
    localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
  }
}

function updateAbout(
  property: string,
  newValue: string,
  schedule: any,
  setSchedule: Function,
) {
  const newSchedule = { ...schedule };
  newSchedule["about"][property] = newValue;

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

function reset(
  setScheduleDB: Function,
  setCurrentRoutine: Function,
  setScheduleName: Function,
  setScheduleStartDate: Function,
  setScheduleEndDate: Function,
) {
  const result = confirm(
    "Are you sure that you want to reset your entire schedule?",
  );

  if (result) {
    localStorage.clear();
    fetch("/api/schedule/default")
      .then((res) => res.json())
      .then((data) => {
        setScheduleDB(data);
        localStorage.setItem("currentSchedule", JSON.stringify(data));

        setScheduleName(
          JSON.parse(localStorage.getItem("currentSchedule") || "")["about"][
            "name"
          ],
        );
        setScheduleStartDate(
          JSON.parse(localStorage.getItem("currentSchedule") || "")["about"][
            "startDate"
          ],
        );
        setScheduleEndDate(
          JSON.parse(localStorage.getItem("currentSchedule") || "")["about"][
            "endDate"
          ],
        );

        setCurrentRoutine(
          Object.keys(
            JSON.parse(localStorage.getItem("currentSchedule") || "")[
              "routines"
            ],
          )[0],
        );
      });
  }
}

export default function Create() {
  const [currentRoutine, setCurrentRoutine] = React.useState("Routine 1");
  const [schedule, setSchedule] = React.useState({});
  const [isLoading, setLoading] = React.useState(true);

  const [isImportOpen, setIsImportOpen] = React.useState(false);

  const [scheduleName, setScheduleName] = React.useState("");
  const [scheduleStartDate, setScheduleStartDate] = React.useState("");
  const [scheduleEndDate, setScheduleEndDate] = React.useState("");

  const [routines] = useAutoAnimate();

  React.useEffect(() => {
    if (localStorage.getItem("currentSchedule") != null) {
      setSchedule(JSON.parse(localStorage.getItem("currentSchedule") || ""));

      setScheduleName(
        JSON.parse(localStorage.getItem("currentSchedule") || "")["about"][
          "name"
        ],
      );
      setScheduleStartDate(
        JSON.parse(localStorage.getItem("currentSchedule") || "")["about"][
          "startDate"
        ],
      );
      setScheduleEndDate(
        JSON.parse(localStorage.getItem("currentSchedule") || "")["about"][
          "endDate"
        ],
      );

      setCurrentRoutine(
        Object.keys(
          JSON.parse(localStorage.getItem("currentSchedule") || "")["routines"],
        )[0],
      );
      setLoading(false);
    } else {
      fetch("/api/schedule/default")
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("currentSchedule", JSON.stringify(data));
          setSchedule(data);

          setScheduleName(
            JSON.parse(localStorage.getItem("currentSchedule") || "")["about"][
              "name"
            ],
          );
          setScheduleStartDate(
            JSON.parse(localStorage.getItem("currentSchedule") || "")["about"][
              "startDate"
            ],
          );
          setScheduleEndDate(
            JSON.parse(localStorage.getItem("currentSchedule") || "")["about"][
              "endDate"
            ],
          );

          setCurrentRoutine(
            Object.keys(
              JSON.parse(localStorage.getItem("currentSchedule") || "")[
                "routines"
              ],
            )[0],
          );
          setLoading(false);
        });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
        <div className="flex items-center justify-center flex-col shadow-xl rounded-lg p-10 lg:p-24 bg-wedgewood-300">
          <h2 className="text-2xl mt-4">Loading...</h2>
        </div>
      </div>
    );
  }

  // backwards compatibility
  // @ts-ignore
  if (!schedule["about"]["inactiveDays"]) {
    // @ts-ignore
    schedule["about"]["inactiveDays"] = schedule["about"]["inactive"].map(
      // @ts-ignore
      (item) => {
        return { description: "Inactive Day", days: item };
      },
    );

    localStorage.setItem("currentSchedule", JSON.stringify(schedule));
    setSchedule(schedule);
  }

  let routinesElemList = [];
  // @ts-ignore
  for (const routine in schedule["routines"]) {
    if (routine == currentRoutine) {
      routinesElemList.push(
        // @ts-ignore
        <Routine
          key={routine}
          rawName={routine}
          currentlySelected={true}
          setCurrentlySelected={setCurrentRoutine}
          // @ts-ignore
          name={schedule["routines"][routine]["officialName"]}
          schedule={schedule}
          setSchedule={setSchedule}
        ></Routine>,
      );
    } else {
      routinesElemList.push(
        <Routine
          key={routine}
          rawName={routine}
          // @ts-ignore
          name={schedule["routines"][routine]["officialName"]}
          schedule={schedule}
          setSchedule={setSchedule}
          currentlySelected={false}
          setCurrentlySelected={setCurrentRoutine}
        ></Routine>,
      );
    }
  }

  return (
    <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8 p-2">
      <ImportSchedule
        schedule={schedule}
        setSchedule={setSchedule}
        isOpen={isImportOpen}
        setIsOpen={setIsImportOpen}
        setCurrentRoutine={setCurrentRoutine}
        setScheduleStartDate={setScheduleStartDate}
        setScheduleEndDate={setScheduleEndDate}
        setScheduleName={setScheduleName}
      ></ImportSchedule>
      <div className="shadow-lg lg:p-10 bg-wedgewood-200 border-wedgewood-300 border-2 p-2 rounded-lg">
        <div className="flex flex-row justify-between">
          <h2 className="font-bold text-3xl mb-10">General Information</h2>

          <div className="flex flex-row items-center">
            <button
              className="bg-wedgewood-400 ml-4 p-4 lg:p-3 lg:px-4 rounded flex items-center mr-4"
              onClick={() => setIsImportOpen(true)}
            >
              <FontAwesomeIcon
                icon={faFileImport}
                className=""
              ></FontAwesomeIcon>
              <h4 className="hidden lg:inline lg:ml-4">Import Schedule</h4>
            </button>
            <button
              onClick={() =>
                reset(
                  setSchedule,
                  setCurrentRoutine,
                  setScheduleName,
                  setScheduleStartDate,
                  setScheduleEndDate,
                )
              }
            >
              <FontAwesomeIcon icon={faRotateLeft} size="xl"></FontAwesomeIcon>
            </button>
          </div>
        </div>

        <div className="lg:flex lg:mt-4">
          <div>
            <label className="text-xl lg:ml-10">Name: </label>
            <input
              className="rounded shadow outline-none border-2 border-wedgewood-500 focus:border-wedgewood-600 lg:w-64 p-2 md:ml-4 bg-wedgewood-300"
              // @ts-ignore
              value={scheduleName}
              onChange={(e) => {
                updateAbout("name", e.target.value, schedule, setSchedule);
                setScheduleName(e.target.value);
              }}
              maxLength={32}
            ></input>
          </div>

          <div>
            <label className="text-xl lg:ml-10 items-center">
              Start Date:{" "}
            </label>
            <input
              type="date"
              className="rounded shadow outline-none border-2 border-wedgewood-500 focus:border-wedgewood-600 lg:w-64 p-2 md:ml-4 bg-wedgewood-300"
              // @ts-ignore
              value={scheduleStartDate}
              onChange={(e) => {
                updateAbout("startDate", e.target.value, schedule, setSchedule);
                setScheduleStartDate(e.target.value);
              }}
            ></input>
          </div>

          <div>
            <label className="text-xl lg:ml-10 items-center">End Date: </label>
            <input
              type="date"
              className="rounded shadow outline-none border-2 border-wedgewood-500 focus:border-wedgewood-600 lg:w-64 p-2 md:ml-4 bg-wedgewood-300"
              // @ts-ignore
              value={scheduleEndDate}
              onChange={(e) => {
                updateAbout("endDate", e.target.value, schedule, setSchedule);
                setScheduleEndDate(e.target.value);
              }}
            ></input>
          </div>
        </div>

        <InactiveDayEditor
          schedule={schedule}
          setSchedule={setSchedule}
        ></InactiveDayEditor>
      </div>

      <section className="mt-4 bg-wedgewood-200 border-wedgewood-300 border-2 rounded-lg">
        <div className="shadow-lg p-2 lg:p-10" ref={routines}>
          <div className="flex flex-row justify-between mb-6">
            <h2 className="font-bold text-3xl">Routines</h2>
          </div>

          {routinesElemList}

          <button
            className="bg-wedgewood-400 ml-4 p-3 px-4 rounded"
            onClick={() => createNewRoutine(schedule, setSchedule)}
          >
            <FontAwesomeIcon icon={faPlus} className=""></FontAwesomeIcon>
            {/* <h4 className="hidden lg:inline lg:ml-4">Create Routine</h4> */}
          </button>
        </div>

        <hr className="border-wedgewood-400"></hr>

        <EventEditor
          currentRoutine={currentRoutine}
          schedule={schedule}
          setSchedule={setSchedule}
        ></EventEditor>
      </section>
    </div>
  );
}
