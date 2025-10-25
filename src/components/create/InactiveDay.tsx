import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function removeInactiveDay(
  rawName: string,
  schedule: any,
  setSchedule: Function,
) {
  const newSchedule = { ...schedule };

  const index = newSchedule["about"]["inactiveDays"].findIndex(
    (item: { days: string | string[] }) => {
      if (Array.isArray(item.days)) {
        return item.days.includes(rawName);
      } else {
        return item.days === rawName;
      }
    },
  );

  newSchedule["about"]["inactiveDays"].splice(index, 1);

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function InactiveDay(props: {
  rawName: string;
  schedule: any;
  description: string;
  setSchedule: Function;
  days: string | string[];
}) {
  return (
    <div className="shadow-lg p-4 bg-wedgewood-300 rounded-lg lg:ml-4 ml-4 mt-2 flex flex-row items-center justify-center">
      <div>
        <h4 className="text-md font-bold">{props.description}</h4>
        <h4 className="text-sm">
          {typeof props.days == "string"
            ? props.days
            : `${props.days[0]} to ${props.days[1]}`}
        </h4>
      </div>

      <button
        onClick={() =>
          removeInactiveDay(props.rawName, props.schedule, props.setSchedule)
        }
      >
        <FontAwesomeIcon
          className="ml-4"
          icon={faXmark}
          size="xl"
        ></FontAwesomeIcon>
      </button>
    </div>
  );
}
