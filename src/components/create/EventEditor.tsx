import React from "react";

import Event from "./Event";
import Modal from "./Modal";
import ActiveRoutineDay from "./ActiveRoutineDay";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function convertDayToString(number: number) {
	const days = {
		0: "Sunday",
		1: "Monday",
		2: "Tuesday",
		3: "Wednesday",
		4: "Thursday",
		5: "Friday",
		6: "Saturday"
	};

	//@ts-ignore
	return days[Number(number)];
}

function createNewEvent(currentRoutine: string, schedule: any, setSchedule: Function) {
	const enteredName = prompt("Please enter an event name:");

	if (enteredName) {
		const newSchedule = { ...schedule };
		newSchedule["routines"][currentRoutine]["events"].push({
			name: enteredName,
			startTime: "08:40",
			endTime: "08:45"
		});

		setSchedule(newSchedule);
		localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
	}
}

export default function EventEditor(props: { currentRoutine: string; schedule: any; setSchedule: Function }) {
	const [isOpen, setIsOpen] = React.useState(false);

	let eventElemList = [];

	if (!props.schedule["routines"][props.currentRoutine]) {
		return (
			<div className="shadow-lg p-10 bg-wedgewood-300">
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
			></Event>
		);
	}

	let activeWhenElemList = [];
	for (const index in props.schedule["routines"][props.currentRoutine]["days"]) {
		let day = props.schedule["routines"][props.currentRoutine]["days"][index];
		let cleanName = day;

		if (Number(day) || Number(day) === 0) {
			cleanName = convertDayToString(day);
		}

		activeWhenElemList.push(
			<ActiveRoutineDay key={day} currentRoutine={props.currentRoutine} rawDayName={day} day={cleanName} schedule={props.schedule} setSchedule={props.setSchedule}></ActiveRoutineDay>
		);
	}

	return (
		<div className="shadow-lg p-10 bg-wedgewood-300">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="font-bold text-2xl">{props.schedule["routines"][props.currentRoutine]["officialName"] + "'s Events"}</h1>
				</div>
			</div>

			<div className="p-6 shadow-lg bg-wedgewood-400 mt-4">
				<h1 className="font-bold text-xl">{"Active Days for " + props.schedule["routines"][props.currentRoutine]["officialName"]}</h1> <br></br>
				<div className="flex items-center">
					{activeWhenElemList}

					<button className="bg-wedgewood-500 ml-4 p-3 px-4 rounded" onClick={() => setIsOpen(true)}>
						<FontAwesomeIcon icon={faPlus} className=""></FontAwesomeIcon>
					</button>
					<Modal currentRoutine={props.currentRoutine} schedule={props.schedule} setSchedule={props.setSchedule} isOpen={isOpen} setIsOpen={setIsOpen}></Modal>
				</div>
			</div>

			{eventElemList}

			<div className="grid justify-items-end">
				<div>
					<button className="bg-wedgewood-500 p-4 w-64 mt-6 rounded" onClick={() => createNewEvent(props.currentRoutine, props.schedule, props.setSchedule)}>
						<FontAwesomeIcon icon={faPlus} className="mr-4"></FontAwesomeIcon>
						Add Event
					</button>
				</div>
			</div>
		</div>
	);
}
