import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UnparsedSchedule } from "@scheduli/types";

function selectRoutine(
  name: string,
  setCurrentlySelected: React.Dispatch<React.SetStateAction<string>>,
) {
  setCurrentlySelected(name);
}

function removeRoutine(
  name: string,
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
) {
  const newSchedule = { ...schedule };
  delete newSchedule["routines"][name];

  if (Object.keys(newSchedule["routines"]).length == 0) {
    return alert("You must have at least one routine.");
  }

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function Routine(props: {
  name: string;
  rawName: string;
  schedule: UnparsedSchedule;
  currentlySelected: boolean;
  setCurrentlySelected: React.Dispatch<React.SetStateAction<string>>;
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>;
}) {
  if (props.currentlySelected) {
    return (
      <div
        key={props.rawName}
        className="rounded-sm shadow-xl inline-flex items-center justify-between gap-3 border-wedgewood-400 bg-wedgewood-300 border-2 hover:cursor-pointer px-4 py-3 w-full sm:w-auto"
        onClick={() => selectRoutine(props.name, props.setCurrentlySelected)}
      >
        {props.name}
        <button
          onClick={() =>
            removeRoutine(props.rawName, props.schedule, props.setSchedule)
          }
        >
          <FontAwesomeIcon
            className=""
            icon={faXmark}
            size="xl"
          ></FontAwesomeIcon>
        </button>
      </div>
    );
  }
  return (
    <div
      key={props.rawName}
      className="rounded-sm shadow-xl inline-flex items-center justify-between gap-3 hover:border-wedgewood-400 bg-wedgewood-200 border-2 border-wedgewood-200 hover:cursor-pointer px-4 py-3 w-full sm:w-auto"
      onClick={() => selectRoutine(props.rawName, props.setCurrentlySelected)}
    >
      {props.name}
      <button
        onClick={() =>
          removeRoutine(props.rawName, props.schedule, props.setSchedule)
        }
      >
        <FontAwesomeIcon
          className=""
          icon={faXmark}
          size="xl"
        ></FontAwesomeIcon>
      </button>
    </div>
  );
}
