import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faChevronDown } from "@fortawesome/free-solid-svg-icons";

import React from "react";
import { Dialog, Tab, Listbox } from "@headlessui/react";

function Event(props: { name: string; startTime: string; endTime: string; schedule: any; setSchedule: Function; currentRoutine: string; eventIndex: number }) {
	return (
		<div className="flex flex-col mt-8">
			<div className="shadow-xl p-10 mt-8 bg-wedgewood-400">
				<div className="flex items-center justify-between">
					<div>
						<label className="text-lg">Name:</label>
						<input
							autoFocus={true}
							className="rounded shadow appearance-none border w-64 p-2 ml-4"
							onChange={(e) => modifyEvent(props.schedule, props.setSchedule, props.currentRoutine, props.eventIndex, "name", e.target.value)}
							defaultValue={props.name}
						></input>
					</div>

					<button onClick={() => removeEvent(props.currentRoutine, props.schedule, props.setSchedule, props.eventIndex)}>
						<FontAwesomeIcon icon={faXmark} size="xl"></FontAwesomeIcon>
					</button>
				</div>

				<div className="flex mt-6 items-center">
					<label className="text-lg">Start Time:</label>
					<input
						className="rounded shadow appearance-none border w-64 p-2 ml-4"
						type="time"
						onChange={(e) => modifyEvent(props.schedule, props.setSchedule, props.currentRoutine, props.eventIndex, "startTime", e.target.value)}
						defaultValue={props.startTime}
					></input>

					<label className="text-lg ml-4">End Time:</label>
					<input
						className="rounded shadow appearance-none border w-64 p-2 ml-4"
						type="time"
						onChange={(e) => modifyEvent(props.schedule, props.setSchedule, props.currentRoutine, props.eventIndex, "endTime", e.target.value)}
						defaultValue={props.endTime}
					></input>
				</div>
			</div>
		</div>
	);
}

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

function removeRoutineDay(currentRoutine: string, rawDayName: any, schedule: any, setSchedule: Function) {
	// if (Object.keys(schedule["routines"][currentRoutine]["days"]).length <= 1) {
	// 	return alert("You must have at least one active day for a routine.");
	// }

	const newSchedule = { ...schedule };

	const index = newSchedule["routines"][currentRoutine]["days"].indexOf(rawDayName);
	newSchedule["routines"][currentRoutine]["days"].splice(index, 1);

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

function createRoutineDay(currentRoutine: string, rawDayName: any, schedule: any, setSchedule: Function) {
	const newSchedule = { ...schedule };

	const index = newSchedule["routines"][currentRoutine]["days"].indexOf(rawDayName);

	if (index != -1) {
		return alert("You can't have duplicate active routine days.");
	}
	newSchedule["routines"][currentRoutine]["days"].push(rawDayName);

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

function Modal(props: { currentRoutine: string; schedule: any; setSchedule: Function; isOpen: boolean; setIsOpen: Function }) {
	const days = [
		{ id: 0, name: "Sunday", unavailable: false },
		{ id: 1, name: "Monday", unavailable: false },
		{ id: 2, name: "Tuesday", unavailable: false },
		{ id: 3, name: "Wednesday", unavailable: false },
		{ id: 4, name: "Thursday", unavailable: false },
		{ id: 5, name: "Friday", unavailable: false },
		{ id: 6, name: "Saturday", unavailable: false }
	];

	const [selectedDay, setSelectedDay] = React.useState(days[1]);

	// createRoutineDay(props.currentRoutine, props.schedule, props.setSchedule);

	return (
		<Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)} className="relative z-50">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			<div className="fixed inset-0 flex w-screen items-center justify-center p-10">
				<Dialog.Panel className="w-full max-w-lg bg-wedgewood-200 p-10">
					<Dialog.Title className="font-bold text-2xl">Choose New Active Day</Dialog.Title>

					<div className="px-2 py-8 sm:px-0">
						<Tab.Group>
							<Tab.List className="flex space-x-1 bg-wedgewood-300 p-4">
								<Tab className="rounded-xl bg-wedgewood-400 p-3 ui-selected:border-wedgewood-600 ui-selected:bg-wedgewood-500 ui-selected:border-2 ">Day of the Week</Tab>
								<Tab className="rounded-xl bg-wedgewood-400 p-3 ui-selected:border-wedgewood-600 ui-selected:bg-wedgewood-500 ui-selected:border-2 ">Custom Date</Tab>
							</Tab.List>
							<Tab.Panels>
								<Tab.Panel>
									<div className="bg-wedgewood-300 p-10 mt-4">
										<Listbox value={selectedDay} onChange={setSelectedDay}>
											<Listbox.Button className="bg-wedgewood-500 p-4 shadow-xl">
												{selectedDay.name} <FontAwesomeIcon icon={faChevronDown} size="lg"></FontAwesomeIcon>
											</Listbox.Button>
											<Listbox.Options className="bg-wedgewood-400 p-4 shadow-xl">
												{days.map((day) => (
													<Listbox.Option
														key={day.id}
														value={day}
														disabled={day.unavailable}
														className="shadow-xl mt-2 border-2 border-wedgewood-600 ui-active:bg-wedgewood-500 ui-not-active:bg-wedgewood-400 ui-not-active:text-black p-3 rounded"
													>
														{day.name}
													</Listbox.Option>
												))}
											</Listbox.Options>
										</Listbox>
									</div>
								</Tab.Panel>
								<Tab.Panel>Content 2</Tab.Panel>
							</Tab.Panels>

							<div className="grid justify-items-end">
								<button
									className="bg-wedgewood-400 ml-4 p-3 px-4 rounded mt-6"
									onClick={() => { createRoutineDay(props.currentRoutine, selectedDay["id"], props.schedule, props.setSchedule); props.setIsOpen(false);}}
								>
									Add Day
								</button>
							</div>
						</Tab.Group>
					</div>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}

function ActiveRoutineDay(props: { currentRoutine: string; rawDayName: any; day: string; schedule: any; setSchedule: Function }) {
	return (
		<div className="shadow-lg p-4 rounded bg-wedgewood-500 ml-4">
			{props.day}
			<button onClick={() => removeRoutineDay(props.currentRoutine, props.rawDayName, props.schedule, props.setSchedule)}>
				<FontAwesomeIcon className="ml-4" icon={faXmark} size="xl"></FontAwesomeIcon>
			</button>
		</div>
	);
}

function EventEditor(props: { currentRoutine: string; schedule: any; setSchedule: Function }) {
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
				key={event["name"]}
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

		if (Number(day)) {
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
					<h1 className="font-bold text-2xl">{props.currentRoutine + "'s Events"}</h1>
				</div>
			</div>

			<div className="p-6 shadow-lg bg-wedgewood-400 mt-4">
				<h1 className="font-bold text-xl">{"Active Days for " + props.currentRoutine}</h1> <br></br>
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

function modifyEvent(schedule: any, setSchedule: Function, currentRoutine: string, eventIndex: number, property: string, newValue: string) {
	const newSchedule = { ...schedule };
	newSchedule["routines"][currentRoutine]["events"][eventIndex][property] = newValue;

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
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

function removeEvent(currentRoutine: string, schedule: any, setSchedule: Function, eventIndex: number) {
	if (schedule["routines"][currentRoutine]["events"].length >= 0) {
		return alert("You must have at least one event.");
	}

	const newSchedule = { ...schedule };
	newSchedule["routines"][currentRoutine]["events"].splice(eventIndex, 1);

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

function createNewRoutine(schedule: any, setSchedule: Function) {
	const enteredName = prompt("Please enter a routine name:");

	if (enteredName) {
		const newSchedule = { ...schedule };
		newSchedule["routines"][enteredName] = {
			officialName: enteredName,
			days: [1, 2, 3],
			events: [
				{
					name: "New Event!!",
					startTime: "08:40",
					endTime: "08:45"
				}
			]
		};

		setSchedule(newSchedule);
		localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
	}
}

function removeRoutine(name: string, schedule: any, setSchedule: Function) {
	const newSchedule = { ...schedule };
	delete newSchedule["routines"][name];

	if (Object.keys(newSchedule["routines"]).length == 0) {
		return alert("You must have at least one routine.");
	}

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

function selectRoutine(name: string, setCurrectlySelected: Function) {
	setCurrectlySelected(name);
}

function Routine(props: { name: string; schedule: any; currentlySelected: boolean; setCurrectlySelected: Function; setSchedule: Function }) {
	if (props.currentlySelected) {
		return (
			<div key={props.name} className="rounded shadow-xl inline-block border-wedgewood-800 bg-wedgewood-500 border-2 ml-4 p-4" onClick={() => selectRoutine(props.name, props.setCurrectlySelected)}>
				{props.name}
				<button onClick={() => removeRoutine(props.name, props.schedule, props.setSchedule)}>
					<FontAwesomeIcon className="ml-4" icon={faXmark} size="xl"></FontAwesomeIcon>
				</button>
			</div>
		);
	}
	return (
		<div
			key={props.name}
			className="rounded shadow-xl inline-block hover:border-wedgewood-800 bg-wedgewood-500 hover:border ml-4 p-4"
			onClick={() => selectRoutine(props.name, props.setCurrectlySelected)}
		>
			{props.name}
			<button onClick={() => removeRoutine(props.name, props.schedule, props.setSchedule)}>
				<FontAwesomeIcon className="ml-4" icon={faXmark} size="xl"></FontAwesomeIcon>
			</button>
		</div>
	);
}

function updateAbout(property: string, newValue: string, schedule: any, setSchedule: Function) {
	const newSchedule = { ...schedule };
	newSchedule["about"][property] = newValue;

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function Create() {
	const [currentRoutine, setCurrentRoutine] = React.useState("Routine 1");

	const [schedule, setSchedule] = React.useState({
		about: {
			name: "New Schedule!",
			allEvents: ["Event 1"],
			startDate: "2023-09-06",
			endDate: "2030-09-08"
		},
		routines: {
			"Routine 1": {
				officialName: "Routine 1",
				days: [1, 2, 3],
				events: [
					{
						name: "Event 1",
						startTime: "08:40",
						endTime: "08:45"
					}
				]
			}
		}
	});

	React.useEffect(() => {
		if (localStorage.getItem("currentSchedule") != null) {
			setSchedule(JSON.parse(localStorage.getItem("currentSchedule") || ""));

			//! remove later
			setCurrentRoutine("Routine 1");
		} else {
			localStorage.setItem(
				"currentSchedule",
				JSON.stringify({
					about: {
						name: "New Schedule!",
						allEvents: ["Event 1"],
						startDate: "2023-09-06",
						endDate: "2030-09-08"
					},
					routines: {
						"Routine 1": {
							officialName: "Routine 1",
							days: [1, 2, 3],
							events: [
								{
									name: "Event 1",
									startTime: "08:40",
									endTime: "08:45"
								}
							]
						}
					}
				})
			);

			setCurrentRoutine("Routine 1");
		}
	}, []);

	let routinesElemList = [];
	for (const routine in schedule["routines"]) {

		if (routine == currentRoutine) {
			routinesElemList.push(
				// @ts-ignore
				<Routine
					key={routine}
					currentlySelected={true}
					setCurrectlySelected={setCurrentRoutine}
					// @ts-ignore
					name={schedule["routines"][routine]["officialName"]}
					schedule={schedule}
					setSchedule={setSchedule}
				></Routine>
			);
		} else {
			routinesElemList.push(
				<Routine
					key={routine}
					// @ts-ignore
					name={schedule["routines"][routine]["officialName"]}
					schedule={schedule}
					setSchedule={setSchedule}
					currentlySelected={false}
					setCurrectlySelected={setCurrentRoutine}
				></Routine>
			);
		}
	}

	return (
		<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8 shadow-lg bg-wedgewood-200 p-8">
			<h1 className="font-bold text-3xl mb-10">Create a New Schedule Plan</h1>

			<div className="shadow-lg p-10  bg-wedgewood-300">
				<h2 className="font-bold text-2xl mb-10">General Information</h2>
				<div className="flex mt-10 items-center">
					<label className="text-xl">Name: </label>
					<input
						className="rounded shadow appearance-none border w-64 p-2 ml-4"
						defaultValue={schedule["about"]["name"]}
						onChange={(e) => updateAbout("name", e.target.value, schedule, setSchedule)}
					></input>

					<label className="text-xl ml-10 items-center">Start Date: </label>
					<input type="date" className="rounded shadow appearance-none border w-64 p-2 ml-4" defaultValue={schedule["about"]["startDate"]}></input>

					<label className="text-xl ml-10 items-center">End Date: </label>
					<input type="date" className="rounded shadow appearance-none border w-64 p-2 ml-4" defaultValue={schedule["about"]["endDate"]}></input>
				</div>
			</div>

			<section className="mt-4">
				<div className="shadow-lg p-10  bg-wedgewood-300">
					<h2 className="font-bold text-2xl mb-8">Routines</h2>

					<button className="bg-wedgewood-500 p-4 w-64 float-right rounded" onClick={() => createNewRoutine(schedule, setSchedule)}>
						<FontAwesomeIcon icon={faPlus} className="mr-4"></FontAwesomeIcon>
						Create New Routine
					</button>

					{routinesElemList}

					{/* <button className="rounded shadow-xl inline-block border-wedgewood-800 bg-wedgewood-500 border ml-4 p-4">Regular</button>
					<button className="rounded shadow-xl inline-block hover:bg-wedgewood-500 hover:border-wedgewood-800 hover:border ml-4 p-4">Wednesday Block</button>
					<button className="rounded shadow-xl inline-block hover:bg-wedgewood-500 hover:border-wedgewood-800 hover:border ml-4 p-4">Thursday Block</button> */}
				</div>

				<hr className="border-wedgewood-400"></hr>

				<EventEditor currentRoutine={currentRoutine} schedule={schedule} setSchedule={setSchedule}></EventEditor>
			</section>
		</div>
	);
}
