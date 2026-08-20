import { useAutoAnimate } from "@formkit/auto-animate/react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UnparsedDay, UnparsedEvent, UnparsedSchedule } from "@scheduli/types";
import Link from "next/link";
import React from "react";

import ActiveDayModal from "./ActiveDayModal";
import ActiveRoutineDay from "./ActiveRoutineDay";
import Event from "./Event";

function convertDayToString(number: UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[]) {
  const days = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };

  return days[Number(number) as keyof typeof days];
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

function createNewEvent(
  currentRoutine: string,
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
) {
  const enteredName = prompt("Please enter an event name:");

  if (enteredName) {
    const newSchedule = { ...schedule } as UnparsedSchedule;
    newSchedule["routines"][currentRoutine]["events"].push({
      name: enteredName,
      rawPeriodName: enteredName,
      startTime: "08:40",
      endTime: "08:45",
    });

    newSchedule["routines"][currentRoutine]["events"] = sortByStartTime(
      newSchedule["routines"][currentRoutine]["events"],
    );

    setSchedule(newSchedule);
    localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
  }
}

export default function EventEditor(props: {
  currentRoutine: string;
  schedule: UnparsedSchedule;
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [parent] = useAutoAnimate();
  const [activeDays] = useAutoAnimate();

  const eventElemList = [];

  if (props.schedule["about"]["name"].includes("School Schedule")) {
    return (
      <div className="shadow-lg p-10 bg-wedgewood-200">
        <div className="flex justify-between items-center">
          <h1 className="text-xl mb-10">
            Since you used a school preset, use the{" "}
            <Link href="/settings" className="text-blue-700">
              Settings page
            </Link>{" "}
            to customize period names and remove periods.
          </h1>
        </div>
      </div>
    );
  }

  if (!props.schedule["routines"][props.currentRoutine]) {
    return (
      <div className="shadow-lg p-10 bg-wedgewood-200">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl">{"No Routine Selected."}</h1>
        </div>
      </div>
    );
  }

  // if (Object.keys(props.schedule["routines"][props.currentRoutine])) {
  // 	return (
  // 		<div className="shadow-lg p-10 bg-wedgewood-300">
  // 			<div className="flex justify-between items-center">
  // 				<h1 className="font-bold text-2xl">{"No Events."}</h1>
  // 			</div>
  // 		</div>
  // 	);
  // }

  for (const index in props.schedule["routines"][props.currentRoutine]["events"]) {
    const event = props.schedule["routines"][props.currentRoutine]["events"][index];
    eventElemList.push(
      <Event
        key={event["startTime"]}
        name={event["name"]}
        startTime={event["startTime"]}
        endTime={event["endTime"]}
        schedule={props.schedule}
        setSchedule={props.setSchedule}
        currentRoutine={props.currentRoutine}
        eventIndex={Number(index)}
      ></Event>,
    );
  }

  const activeWhenElemList = [];
  for (const index in props.schedule["routines"][props.currentRoutine]["days"]) {
    const day = props.schedule["routines"][props.currentRoutine]["days"][index];
    let cleanName = day;

    if (Number(day) || Number(day) === 0) {
      cleanName = convertDayToString(day);
    }

    activeWhenElemList.push(
      <ActiveRoutineDay
        key={String(day)}
        currentRoutine={props.currentRoutine}
        rawDayName={day}
        day={cleanName}
        schedule={props.schedule}
        setSchedule={props.setSchedule}
      ></ActiveRoutineDay>,
    );
  }

  return (
    <div className="shadow-lg p-4 sm:p-6 lg:p-10 bg-wedgewood-200" ref={parent}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl">
            {props.schedule["routines"][props.currentRoutine]["officialName"] +
              "'s Events"}
          </h1>
        </div>
      </div>

      <div className="lg:p-6 p-4 shadow-lg bg-wedgewood-100 mt-4 lg:mt-8 rounded-lg">
        <h1 className="font-bold text-lg sm:text-xl">
          {"Active Days for " +
            props.schedule["routines"][props.currentRoutine]["officialName"]}
        </h1>{" "}
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3" ref={activeDays}>
          {activeWhenElemList}

          <button
            className="bg-wedgewood-400 p-3 px-4 rounded-sm hover:bg-wedgewood-500 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} className=""></FontAwesomeIcon>
          </button>
          <ActiveDayModal
            currentRoutine={props.currentRoutine}
            schedule={props.schedule}
            setSchedule={props.setSchedule}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          ></ActiveDayModal>
        </div>
      </div>

      {eventElemList}

      <div className="grid justify-items-stretch sm:justify-items-end">
        <div>
          <button
            className="bg-wedgewood-400 p-4 w-full sm:w-64 mt-6 rounded-sm hover:bg-wedgewood-500 transition-colors"
            onClick={() =>
              createNewEvent(
                props.currentRoutine,
                props.schedule,
                props.setSchedule,
              )
            }
          >
            <FontAwesomeIcon icon={faPlus} className="mr-4"></FontAwesomeIcon>
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
}
