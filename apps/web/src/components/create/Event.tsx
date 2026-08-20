import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UnparsedEvent, UnparsedSchedule } from "@scheduli/types";

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

function modifyEvent(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
  currentRoutine: string,
  eventIndex: number,
  property: string,
  newValue: string,
) {
  const newSchedule = { ...schedule } as UnparsedSchedule;
  newSchedule["routines"][currentRoutine]["events"][eventIndex][property as keyof UnparsedEvent] =
    newValue;

  newSchedule["routines"][currentRoutine]["events"] = sortByStartTime(
    newSchedule["routines"][currentRoutine]["events"],
  );

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

function removeEvent(
  currentRoutine: string,
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
  eventIndex: number,
) {
  if (schedule["routines"][currentRoutine]["events"].length <= 1) {
    return alert("You must have at least one event.");
  }

  const newSchedule = { ...schedule };
  newSchedule["routines"][currentRoutine]["events"].splice(eventIndex, 1);

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function Event(props: {
  name: string;
  startTime: string;
  endTime: string;
  schedule: UnparsedSchedule;
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>;
  currentRoutine: string;
  eventIndex: number;
}) {
  return (
    <div className="flex flex-col mt-6 sm:mt-8">
      <div className="shadow-xl p-4 sm:p-6 lg:p-8 mt-4 sm:mt-6 bg-wedgewood-100 rounded-lg border-2 border-wedgewood-300">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-base sm:text-lg font-semibold block">Name:</label>
            <input
              // autoFocus={true}
              className="mt-2 w-full rounded-sm shadow-sm outline-hidden border-2 border-wedgewood-500 focus:border-wedgewood-600 p-3 bg-wedgewood-200"
              onChange={(e) =>
                modifyEvent(
                  props.schedule,
                  props.setSchedule,
                  props.currentRoutine,
                  props.eventIndex,
                  "name",
                  e.target.value,
                )
              }
              defaultValue={props.name}
              maxLength={32}
            ></input>
          </div>

          <button
            onClick={() =>
              removeEvent(props.currentRoutine, props.schedule, props.setSchedule, props.eventIndex)
            }
          >
            <FontAwesomeIcon icon={faXmark} size="xl"></FontAwesomeIcon>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="text-base sm:text-lg font-semibold block">Start Time:</label>
            <input
              className="mt-2 w-full rounded-sm shadow-sm outline-hidden border-2 border-wedgewood-500 focus:border-wedgewood-600 p-3 bg-wedgewood-200"
              type="time"
              onChange={(e) =>
                modifyEvent(
                  props.schedule,
                  props.setSchedule,
                  props.currentRoutine,
                  props.eventIndex,
                  "startTime",
                  e.target.value,
                )
              }
              defaultValue={props.startTime}
            ></input>
          </div>

          <div>
            <label className="text-base sm:text-lg font-semibold block">End Time:</label>
            <input
              className="mt-2 w-full rounded-sm shadow-sm outline-hidden border-2 border-wedgewood-500 focus:border-wedgewood-600 p-3 bg-wedgewood-200"
              type="time"
              onChange={(e) =>
                modifyEvent(
                  props.schedule,
                  props.setSchedule,
                  props.currentRoutine,
                  props.eventIndex,
                  "endTime",
                  e.target.value,
                )
              }
              defaultValue={props.endTime}
            ></input>
          </div>
        </div>
      </div>
    </div>
  );
}
