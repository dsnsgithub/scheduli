import InactiveDay from "./InactiveDay";
import InactiveDayModal from "./InactiveDayModal";
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function InactiveDayEditor(props: { schedule: any; setSchedule: Function }) {
	const [isOpen, setIsOpen] = React.useState(false);

	let inactiveDaysElemList = [];

	for (const index in props.schedule["about"]["inactive"]) {
		const inactiveDay = props.schedule["about"]["inactive"][index];
		if (typeof inactiveDay == "object") {
			const newName = `${inactiveDay[0]} to ${inactiveDay[1]}`;
			inactiveDaysElemList.push(<InactiveDay key={inactiveDay} rawName={inactiveDay} name={newName} schedule={props.schedule} setSchedule={props.setSchedule}></InactiveDay>);
		} else {
			inactiveDaysElemList.push(<InactiveDay key={inactiveDay} rawName={inactiveDay} name={inactiveDay} schedule={props.schedule} setSchedule={props.setSchedule}></InactiveDay>);
		}
	}

	return (
		<div className="lg:p-6 p-4 shadow-lg bg-wedgewood-300 mt-4 lg:mt-10">
			<h1 className="font-bold text-xl mb-4">Inactive Days:</h1>

			<div>
				{inactiveDaysElemList}

				<button className="bg-wedgewood-400 ml-4 p-3 px-4 rounded inline-block" onClick={() => setIsOpen(true)}>
					<FontAwesomeIcon icon={faPlus} className=""></FontAwesomeIcon>
				</button>
				<InactiveDayModal schedule={props.schedule} setSchedule={props.setSchedule} isOpen={isOpen} setIsOpen={setIsOpen}></InactiveDayModal>
			</div>
		</div>
	);
}
