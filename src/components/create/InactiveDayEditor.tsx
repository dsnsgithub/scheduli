import InactiveDay from "./InactiveDay";
import InactiveDayModal from "./InactiveDayModal";
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function InactiveDayEditor(props: { schedule: any; setSchedule: Function }) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [parent] = useAutoAnimate();

	let inactiveDaysElemList = [];

	for (const index in props.schedule["about"]["inactiveDays"]) {
		const inactiveDay = props.schedule["about"]["inactiveDays"][index];

		inactiveDaysElemList.push(
			<InactiveDay
				key={inactiveDay["days"]}
				rawName={inactiveDay["days"]}
				days={inactiveDay["days"]}
				description={inactiveDay["description"]}
				schedule={props.schedule}
				setSchedule={props.setSchedule}
			></InactiveDay>
		);
	}

	return (
		<div className="lg:p-6 p-4 shadow-lg bg-wedgewood-300 mt-4 lg:mt-10 rounded-lg">
			<h1 className="font-bold text-xl mb-4">Inactive Days:</h1>

			<div className="flex flex-wrap" ref={parent}>
				{inactiveDaysElemList}

				<button className="shadow-lg p-4 bg-wedgewood-400 lg:ml-4 ml-4 mt-2 flex flex-row items-center justify-center rounded" onClick={() => setIsOpen(true)}>
					<FontAwesomeIcon icon={faPlus} className=""></FontAwesomeIcon>
				</button>

				<InactiveDayModal schedule={props.schedule} setSchedule={props.setSchedule} isOpen={isOpen} setIsOpen={setIsOpen}></InactiveDayModal>
			</div>
		</div>
	);
}
