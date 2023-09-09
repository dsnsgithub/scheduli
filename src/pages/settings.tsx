import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import React from "react";


function updateName(rawPeriodName: string, newName: string, setPeriodNamesDB: Function) {
	const periodNamesDB = JSON.parse(localStorage.getItem("periodNames") || "{}");

	periodNamesDB[rawPeriodName] = newName;

	localStorage.setItem("periodNames", JSON.stringify(periodNamesDB));
	setPeriodNamesDB(periodNamesDB);
}

function removePeriodName(rawPeriodName: string, setRemovedPeriodsDB: Function) {
	const removedPeriodNames = JSON.parse(localStorage.getItem("removedPeriods") || "[]");
	removedPeriodNames.push(rawPeriodName);

	setRemovedPeriodsDB(removedPeriodNames);
	window.localStorage.setItem("removedPeriods", JSON.stringify(removedPeriodNames));
}

function checkRemovedPeriods(period: string) {
	if (!localStorage.getItem("removedPeriods")) return false;

	const removedPeriodNames = JSON.parse(localStorage.getItem("removedPeriods") || "");
	return removedPeriodNames.includes(period);
}

function reset(setPeriodNamesDB: Function, setRemovedPeriodsDB: Function, createAvaliablePeriodsDB: Function, scheduleDB: any) {
	localStorage.clear();

	setPeriodNamesDB(JSON.parse(createAvaliablePeriodsDB(scheduleDB)));
	setRemovedPeriodsDB([]);
	localStorage.setItem("removedPeriods", JSON.stringify([]));
	localStorage.setItem("periodNames", createAvaliablePeriodsDB(scheduleDB));

}

function PeriodNameCustomizer(props: { periodName: string; rawPeriodName: string, setPeriodNamesDB: Function, setRemovedPeriodsDB: Function }) {
	return (
		<div key={props.rawPeriodName} className="flex flex-row justify-center place-items-center items-center rounded bg-wedgewood-300 lg:m-3 lg:p-5">
			<h1 className="py-5 lg:p-6 text-3xl font-bold">{props.rawPeriodName}:</h1>
			<input
				className="rounded shadow appearance-none border w-64 p-3"
				defaultValue={props.periodName || ""}
				onChange={(e) => updateName(props.rawPeriodName, e.target.value, props.setPeriodNamesDB)}
			></input>

			<button onClick={() => removePeriodName(props.rawPeriodName, props.setRemovedPeriodsDB)}>
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
	return JSON.stringify(entry);
}

function createRemovedPeriodsDB(setRemovedPeriodsDB: Function) {
	setRemovedPeriodsDB([]);
	localStorage.setItem("removedPeriods", JSON.stringify([]));
}

export default function Settings() {
	let [scheduleDB, setScheduleDB] = React.useState(null);
	const [periodNamesDB, setPeriodNamesDB] = React.useState(null);
	const [removedPeriodsDB, setRemovedPeriodsDB] = React.useState(null);
	const [isLoading, setLoading] = React.useState(true);

	
	React.useEffect(() => {
		fetch("/api/schedule/dvhs")
			.then((res) => res.json())
			.then((data) => {
				setScheduleDB(data);

				if (!localStorage.getItem("periodNames")) createAvaliablePeriodsDB(data);
				if (!localStorage.getItem("removedPeriods")) createRemovedPeriodsDB(setRemovedPeriodsDB);

				setPeriodNamesDB(JSON.parse(localStorage.getItem("periodNames") || ""));
				setRemovedPeriodsDB(JSON.parse(localStorage.getItem("removedPeriods") || ""));

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

	const rows = [];
	// @ts-ignore
	for (const rawPeriodName in periodNamesDB) {
		if (checkRemovedPeriods(rawPeriodName)) continue;

		rows.push(
			<PeriodNameCustomizer
				key={rawPeriodName}
				periodName={periodNamesDB[rawPeriodName]}
				rawPeriodName={rawPeriodName}
				setPeriodNamesDB={setPeriodNamesDB}
				setRemovedPeriodsDB={setRemovedPeriodsDB}
			></PeriodNameCustomizer>
		);
	}

	return (
		<div className="container mx-auto lg:mt-10 flex flex-col justify-center lg:p-8 shadow-xl bg-wedgewood-200 ">
			<div className="flex justify-between items-center">
				<h1 className="font-bold text-3xl m-4">Customize Period Names</h1>
				<button onClick={()=>reset(setPeriodNamesDB, setRemovedPeriodsDB, createAvaliablePeriodsDB, scheduleDB)}>
					<FontAwesomeIcon icon={faRotateLeft} size="xl"></FontAwesomeIcon>
				</button>
			</div>

			{rows}
		</div>
	);
}
