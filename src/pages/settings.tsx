import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import React from "react";


function updateName(rawPeriodName: string, newName: string) {
	const periodNamesDB = JSON.parse(localStorage.getItem("periodNames") || "{}");

	periodNamesDB[rawPeriodName] = newName;

	localStorage.setItem("periodNames", JSON.stringify(periodNamesDB));
}

function removePeriodName(rawPeriodName: string) {
	const removedPeriodNames = JSON.parse(localStorage.getItem("removedPeriods") || "[]");
	removedPeriodNames.push(rawPeriodName);

	window.localStorage.setItem("removedPeriods", JSON.stringify(removedPeriodNames));
	location.reload();
}

function checkRemovedPeriods(period: string) {
	if (!localStorage.getItem("removedPeriods")) return false;

	const removedPeriodNames = JSON.parse(localStorage.getItem("removedPeriods") || "");
	return removedPeriodNames.includes(period);
}

function reset(setLoading: Function) {
	location.reload();
	// setLoading(true);
	localStorage.clear();
	// setLoading(false);
}

function PeriodNameCustomizer(props: { periodName: string; rawPeriodName: string }) {
	return (
		<div key={props.rawPeriodName} className="flex flex-row justify-center place-items-center rounded bg-wedgewood-300 lg:m-3 lg:p-5">
			<h1 className="py-5 lg:p-6 text-3xl font-bold">{props.rawPeriodName}:</h1>
			<input
				className="shadow appearance-none border roundedfocus:outline-none focus:shadow-outline p-2 lg:p-4"
				defaultValue={props.periodName || ""}
				onChange={(e) => updateName(props.rawPeriodName, e.target.value)}
			></input>

			<button onClick={() => removePeriodName(props.rawPeriodName)}>
				<FontAwesomeIcon className="ml-4" icon={faXmark} size="xl"></FontAwesomeIcon>
			</button>
		</div>
	);
}

// @ts-ignore
function createAvaliablePeriodsDB(scheduleDB) {
	const avaliablePeriods = scheduleDB["about"]["avaliablePeriods"];
	let entry: Record<string, null> = {};

	for (const period of avaliablePeriods) {
		entry[period] = null;
	}

	localStorage.setItem("periodNames", JSON.stringify(entry));
}

function createRemovedPeriodsDB() {
	localStorage.setItem("removedPeriods", JSON.stringify([]));
}

export default function Settings() {
	let [scheduleDB, setScheduleDB] = React.useState(null);
	const [periodNamesDB, setPeriodNamesDB] = React.useState(null);
	const [isLoading, setLoading] = React.useState(true);

	
	React.useEffect(() => {
		fetch("/api/schedule/dvhs")
			.then((res) => res.json())
			.then((data) => {
				setScheduleDB(data);

				if (!localStorage.getItem("periodNames")) createAvaliablePeriodsDB(data);
				if (!localStorage.getItem("removedPeriods")) createRemovedPeriodsDB();

				setPeriodNamesDB(JSON.parse(localStorage.getItem("periodNames") || ""));

				setLoading(false);
			});
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

	console.log(scheduleDB)
	


	// const periodNamesDB = JSON.parse(localStorage.getItem("periodNames") || "");
	console.log(periodNamesDB);

	const rows = [];
	// @ts-ignore
	for (const rawPeriodName in periodNamesDB) {
		if (checkRemovedPeriods(rawPeriodName)) continue;

		rows.push(<PeriodNameCustomizer periodName={periodNamesDB[rawPeriodName]} rawPeriodName={rawPeriodName}></PeriodNameCustomizer>);
	}

	return (
		<div className="container mx-auto lg:mt-10 flex flex-col justify-center lg:p-8 shadow-xl bg-wedgewood-200 ">
			<div className="flex justify-between items-center">
				<h1 className="font-bold text-3xl m-4">Customize Period Names</h1>
				<button onClick={() => reset(setLoading)}><FontAwesomeIcon icon={faRotateLeft} size="xl"></FontAwesomeIcon></button>
			</div>

			{rows}
		</div>
	);
}
