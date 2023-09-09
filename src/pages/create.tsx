
import React from "react";
import Link from "next/link";

import EventEditor from "../components/create/EventEditor";
import Routine from "../components/create/Routine";
import ImportSchedule from "../components/create/ImportSchedule";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

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

function updateAbout(property: string, newValue: string, schedule: any, setSchedule: Function) {
	const newSchedule = { ...schedule };
	newSchedule["about"][property] = newValue;

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

function reset(setScheduleDB: Function, setCurrentRoutine: Function) {
	const result = confirm("Are you sure that you want to reset your entire schedule?");

	if (result) {
		localStorage.clear();
		fetch("/api/schedule/default")
			.then((res) => res.json())
			.then((data) => {
				setScheduleDB(data);
				localStorage.setItem("currentSchedule", JSON.stringify(data));

				setCurrentRoutine(Object.keys(JSON.parse(localStorage.getItem("currentSchedule") || "")["routines"])[0]);
			});
	}
}

export default function Create() {
	const [currentRoutine, setCurrentRoutine] = React.useState("Routine 1");
	const [schedule, setSchedule] = React.useState({});
	const [isLoading, setLoading] = React.useState(true);

	const [isImportOpen, setIsImportOpen] = React.useState(false);

	React.useEffect(() => {
		if (localStorage.getItem("currentSchedule") != null) {
			setSchedule(JSON.parse(localStorage.getItem("currentSchedule") || ""));

			//! remove later
			// @ts-ignore
			setCurrentRoutine(Object.keys(JSON.parse(localStorage.getItem("currentSchedule") || "")["routines"])[0]);
			setLoading(false);
		} else {
			fetch("/api/schedule/default")
				.then((res) => res.json())
				.then((data) => {
					localStorage.setItem("currentSchedule", JSON.stringify(data));
					setSchedule(data);
					// @ts-ignore
					setCurrentRoutine(Object.keys(JSON.parse(localStorage.getItem("currentSchedule") || "")["routines"])[0]);
					setLoading(false);
				});
		}
	}, []);

	if (isLoading) {
		return (
			<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
				<div className="flex items-center justify-center flex-col shadow-xl rounded-lg p-10 lg:p-24 bg-wedgewood-300">
					<h2 className="text-2xl mt-4">Loading...</h2>
				</div>
			</div>
		);
	}

	let routinesElemList = [];
	// @ts-ignore
	for (const routine in schedule["routines"]) {
		if (routine == currentRoutine) {
			routinesElemList.push(
				// @ts-ignore
				<Routine
					key={routine}
					rawName={routine}
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
					rawName={routine}
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
			<div className="flex justify-between items-center mb-10">
				<h1 className="font-bold text-3xl">Create a New Schedule Plan</h1>

				<button onClick={() => reset(setSchedule, setCurrentRoutine)}>
					<FontAwesomeIcon icon={faRotateLeft} size="xl"></FontAwesomeIcon>
				</button>
			</div>

			<div className="shadow-lg p-10 bg-wedgewood-300">
				<div className="flex flex-row justify-between">
					<h2 className="font-bold text-2xl mb-10">General Information</h2>

					<div>
						<button className="bg-wedgewood-500 ml-4 p-3 px-4 rounded flex items-center " onClick={() => setIsImportOpen(true)}>
							<h1>Import Preset</h1>
							<FontAwesomeIcon icon={faPlus} className="ml-4"></FontAwesomeIcon>
						</button>
						<ImportSchedule schedule={schedule} setSchedule={setSchedule} isOpen={isImportOpen} setIsOpen={setIsImportOpen} setCurrentRoutine={setCurrentRoutine}></ImportSchedule>
					</div>
				</div>

				<div className="flex mt-4 items-center">
					<label className="text-xl">Name: </label>
					<input
						className="rounded shadow appearance-none border w-64 p-2 ml-4"
						// @ts-ignore
						defaultValue={schedule["about"]["name"]}
						onChange={(e) => updateAbout("name", e.target.value, schedule, setSchedule)}
					></input>
					<label className="text-xl ml-10 items-center">Start Date: </label>
					{/* @ts-ignore */}
					<input type="date" className="rounded shadow appearance-none border w-64 p-2 ml-4" defaultValue={schedule["about"]["startDate"]}></input>
					<label className="text-xl ml-10 items-center">End Date: </label>
					{/* @ts-ignore */}
					<input type="date" className="rounded shadow appearance-none border w-64 p-2 ml-4" defaultValue={schedule["about"]["endDate"]}></input>
				</div>
			</div>

			<section className="mt-4">
				<div className="shadow-lg p-10  bg-wedgewood-300">
					<h2 className="font-bold text-2xl mb-8">Routines</h2>
					<h3 className="text-xl mb-10">
						If you used a school preset, use the{" "}
						<Link href="/settings" className="text-blue-700">
							Settings page
						</Link>{" "}
						to customize period names and remove periods.
					</h3>

					<button className="bg-wedgewood-500 p-4 w-64 float-right rounded" onClick={() => createNewRoutine(schedule, setSchedule)}>
						<FontAwesomeIcon icon={faPlus} className="mr-4"></FontAwesomeIcon>
						Create New Routine
					</button>

					{routinesElemList}

				</div>

				<hr className="border-wedgewood-400"></hr>

				<EventEditor currentRoutine={currentRoutine} schedule={schedule} setSchedule={setSchedule}></EventEditor>
			</section>
		</div>
	);
}
