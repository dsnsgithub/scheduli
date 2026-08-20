import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UnparsedDay, UnparsedSchedule } from "@scheduli/types";

function removeRoutineDay(
  currentRoutine: string,
  rawDayName: UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[],
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
) {
  // if (Object.keys(schedule["routines"][currentRoutine]["days"]).length <= 1) {
  // 	return alert("You must have at least one active day for a routine.");
  // }

  const newSchedule = { ...schedule };

  const index = newSchedule["routines"][currentRoutine]["days"].indexOf(rawDayName);
  newSchedule["routines"][currentRoutine]["days"].splice(index, 1);

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function ActiveRoutineDay(props: {
  currentRoutine: string;
  rawDayName: UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[];
  day: UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[];
  schedule: UnparsedSchedule;
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>;
}) {
  return (
    <div className="flex items-center justify-between shadow-lg px-4 py-2 bg-wedgewood-300 rounded-sm w-full sm:w-auto min-w-[140px]">
      <span className="text-sm sm:text-base">{props.day}</span>
      <button
        onClick={() =>
          removeRoutineDay(
            props.currentRoutine,
            props.rawDayName,
            props.schedule,
            props.setSchedule,
          )
        }
      >
        <FontAwesomeIcon
          className="ml-3"
          icon={faXmark}
          size="xl"
        ></FontAwesomeIcon>
      </button>
    </div>
  );
}
