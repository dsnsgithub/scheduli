import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UnparsedDay, UnparsedSchedule } from "@scheduli/types";

function removeInactiveDay(
  rawName: UnparsedDay | UnparsedDay[],
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
) {
  const newSchedule = { ...schedule };

  const index = newSchedule["about"]["inactiveDays"].findIndex((item) => {
    if (Array.isArray(item.days)) {
      return item.days.includes(rawName as UnparsedDay);
    } else {
      return item.days === rawName;
    }
  });

  newSchedule["about"]["inactiveDays"].splice(index, 1);

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function InactiveDay(props: {
  rawName: UnparsedDay | UnparsedDay[];
  schedule: UnparsedSchedule;
  description: string;
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>;
  days: UnparsedDay | UnparsedDay[];
}) {
  return (
    <div className="shadow-lg px-4 py-3 bg-wedgewood-300 rounded-lg flex flex-row items-center justify-between w-full sm:w-auto min-w-[180px]">
      <div>
        <h4 className="text-sm sm:text-md font-bold">{props.description}</h4>
        <h4 className="text-xs sm:text-sm">
          {Array.isArray(props.days)
            ? `${props.days[0]} to ${props.days[1]}`
            : props.days}
        </h4>
      </div>

      <button
        onClick={() =>
          removeInactiveDay(props.rawName, props.schedule, props.setSchedule)
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
