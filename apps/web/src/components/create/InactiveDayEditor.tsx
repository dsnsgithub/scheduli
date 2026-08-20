import { useAutoAnimate } from "@formkit/auto-animate/react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UnparsedSchedule } from "@scheduli/types";
import React from "react";

import InactiveDay from "./InactiveDay";
import InactiveDayModal from "./InactiveDayModal";

export default function InactiveDayEditor(props: {
  schedule: UnparsedSchedule;
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [parent] = useAutoAnimate();

  const inactiveDaysElemList = [];

  for (const index in props.schedule["about"]["inactiveDays"]) {
    const inactiveDay = props.schedule["about"]["inactiveDays"][index];

    inactiveDaysElemList.push(
      <InactiveDay
        key={String(inactiveDay["days"])}
        rawName={inactiveDay["days"]}
        days={inactiveDay["days"]}
        description={inactiveDay["description"]}
        schedule={props.schedule}
        setSchedule={props.setSchedule}
      ></InactiveDay>,
    );
  }

  return (
    <div className="lg:p-6 p-4 border-2 border-wedgewood-300 bg-wedgewood-100 rounded-lg shadow-xl mt-4 lg:mt-8">
      <h1 className="font-bold text-lg sm:text-xl mb-3">Inactive Days:</h1>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3" ref={parent}>
        {inactiveDaysElemList}

        <button
          className="shadow-lg bg-wedgewood-400 flex flex-row items-center justify-center rounded-lg w-14 h-14 sm:w-16 sm:h-16 hover:bg-wedgewood-500 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
        </button>

        <InactiveDayModal
          schedule={props.schedule}
          setSchedule={props.setSchedule}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        ></InactiveDayModal>
      </div>
    </div>
  );
}
