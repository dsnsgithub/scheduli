import React from "react";
import Link from "next/link";

import Schedule from "../components/index/Schedule";
import Status from "../components/index/Status";
import Countdown from "../components/index/Countdown";

export interface ScheduleDB {
	about: About;
	routines: Routines;
}

export interface Routines {
	[key: string]: Schedule;
}
export interface About {
	startDate: string;
	endDate: string;
	inactive: any[];
	allEvents: string[];
}

export interface Schedule {
	officialName: string;
	days: any[];
	times: Time[];
}

export interface Time {
	rawPeriodName: string;
	startTime: number;
	endTime: number;
}

export interface UpdatedTime {
	periodName: string;
	rawPeriodName: string;
	startTime: number;
	endTime: number;
}

//? Utility Functions --------------------------------------------------------------
function createCustomDate(inputTime: string) {
	const currentDate = new Date();

	const [inputHourRaw, inputMinuteRaw] = inputTime.split(":");
	const inputMinute = inputMinuteRaw.replace(/[A-Za-z]/g, ""); // Remove any non-numeric characters
	const isPM = inputTime.includes("PM");

	let hour = parseInt(inputHourRaw);
	if (isPM && hour !== 12) {
		hour += 12;
	} else if (hour == 12 && !isPM) {
		hour -= 12;
	}

	currentDate.setHours(hour, parseInt(inputMinute), 0, 0);
	return currentDate.getTime();
}

function sameDay(d1: Date, d2: Date) {
	return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function getOrdinalNumber(number: any) {
	if (!Number(number)) {
		// this is not a number lol
		return number;
	}

	if (number % 100 >= 11 && number % 100 <= 13) {
		return number + "th";
	}

	switch (number % 10) {
		case 1:
			return number + "st";
		case 2:
			return number + "nd";
		case 3:
			return number + "rd";
		default:
			return number + "th";
	}
}

function createAvaliablePeriodsDB(scheduleDB: ScheduleDB) {
	const avaliablePeriods = scheduleDB["about"]["allEvents"];
	let entry: Record<string, null> = {};

	for (const period of avaliablePeriods) {
		entry[period] = null;
	}

	localStorage.setItem("periodNames", JSON.stringify(entry));
}

function createRemovedPeriodsDB() {
	localStorage.setItem("removedPeriods", JSON.stringify([]));
}

function findCorrectPeriodName(periodName: string) {
	if (!localStorage.getItem("periodNames")) return periodName;
	const periodNames = JSON.parse(localStorage.getItem("periodNames") || "");

	return periodNames[periodName] || periodName;
}

function checkRemovedPeriods(period: string) {
	if (!localStorage.getItem("removedPeriods")) return false;

	const removedPeriodNames = JSON.parse(localStorage.getItem("removedPeriods") || "");
	return removedPeriodNames.includes(period);
}

function findCorrectSchedule(scheduleDB: ScheduleDB, currentDate: Date) {
	const currentTime = currentDate.getTime();
	const dayofTheWeek = currentDate.getDay();
	let mostSpecificSchedule = null;
	let mostSpecificDate = null;

	// Check for summer
	if (new Date(scheduleDB["about"]["endDate"]).getTime() < currentTime && new Date(scheduleDB["about"]["startDate"]).getTime() > currentTime) {
		return null;
	}

	// Check for off days
	for (const item of scheduleDB["about"]["inactive"]) {
		if (typeof item === "object") {
			let [startDate, endDate] = item;
			startDate = new Date(startDate);
			endDate = new Date(endDate);

			// add one because the entire day of the endDate considered "off" still
			endDate = new Date(endDate.setDate(endDate.getDate() + 1));

			if (new Date(startDate).getTime() < currentTime && new Date(endDate).getTime() > currentTime) {
				return null;
			}
		} else {
			const startDate = new Date(item);
			let endDate = new Date(item);
			endDate = new Date(endDate.setDate(endDate.getDate() + 1));

			if (new Date(startDate).getTime() < currentTime && new Date(endDate).getTime() > currentTime) {
				return null;
			}
		}
	}

	for (const schedule in scheduleDB["routines"]) {
		if (schedule == "about") continue;

		// @ts-ignore
		const days = scheduleDB["routines"][schedule]["days"];

		for (const day of days) {
			if (typeof day == "number") {
				if (day == dayofTheWeek) {
					if (typeof mostSpecificDate != "string") {
						mostSpecificSchedule = schedule;
						mostSpecificDate = dayofTheWeek;
					}
				}
			} else {
				if (sameDay(currentDate, new Date(`${day}/${currentDate.getFullYear()}`))) {
					mostSpecificSchedule = schedule;
					mostSpecificDate = dayofTheWeek;
				}
			}
		}
	}

	return mostSpecificSchedule;
}

export default function Home() {
	let [scheduleDB, setScheduleDB] = React.useState(null);
	const [isLoading, setLoading] = React.useState(true);

	React.useEffect(() => {
		if (!localStorage.getItem("currentSchedule")) {
			setLoading(false);
			// fetch("/api/schedule/default")
			// 	.then((res) => res.json())
			// 	.then((data) => {
			// 		localStorage.setItem("currentSchedule", JSON.stringify(data));
			// 		setScheduleDB(data);
			// 		setLoading(false);
			// 	});
		} else {
			setScheduleDB(JSON.parse(localStorage.getItem("currentSchedule") || "{}"));
			setLoading(false);
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

	if (!scheduleDB) {
		return (
			<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
				<div className="flex items-center justify-center flex-col shadow-xl rounded-lg p-10 lg:p-24 bg-wedgewood-300">
					<h2 className="text-2xl mt-4 text-center">
						It looks like you {"haven't"} set up a schedule yet. <br></br>
						{/* You can either
						<div className="flex items-center justify-around p-4">
							<div>
								<h2 className="text-xl font-bold">Create a New Schedule</h2>
							</div>

							<div>
								<h2 className="text-xl font-bold">Select from a Preset</h2>
							</div>
						</div> */}
						Create a schedule{" "}
						<Link className="text-blue-700 mt-4" href="/create">
							here.
						</Link>
					</h2>
				</div>
			</div>
		);
	}

	//? all necessary prereqs are collected
	const currentDate = new Date();
	const currentTime = currentDate.getTime();
	// const currentDate = new Date(new Date().setDate(new Date().getDate() + 1));

	if (!localStorage.getItem("periodNames")) createAvaliablePeriodsDB(scheduleDB);
	if (!localStorage.getItem("removedPeriods")) createRemovedPeriodsDB();

	// parse schedules, fixing names and other issues
	// must loop backwards to avoid weird index issues
	for (const scheduleName in scheduleDB["routines"] as ScheduleDB) {
		if (scheduleName == "about") continue;

		// @ts-ignore
		for (let i = scheduleDB["routines"][scheduleName]["events"].length - 1; i >= 0; i--) {
			const rawPeriodName = scheduleDB["routines"][scheduleName]["events"][i]["name"];
			// @ts-ignore
			if (checkRemovedPeriods(rawPeriodName)) {
				// @ts-ignore
				scheduleDB["routines"][scheduleName]["events"].splice(i, 1);
				continue;
			}

			let periodName = findCorrectPeriodName(rawPeriodName);
			if (periodName.length == 1) periodName = `${getOrdinalNumber(periodName)} period`;

			if (typeof scheduleDB["routines"][scheduleName]["events"][Number(i)]["startTime"] == "string") {
				// @ts-ignore
				scheduleDB["routines"][scheduleName]["events"][Number(i)]["startTime"] = createCustomDate(scheduleDB["routines"][scheduleName]["events"][Number(i)]["startTime"]);
				// @ts-ignore
				scheduleDB["routines"][scheduleName]["events"][Number(i)]["endTime"] = createCustomDate(scheduleDB["routines"][scheduleName]["events"][Number(i)]["endTime"]);
			}

			// @ts-ignore
			scheduleDB["routines"][scheduleName]["events"][Number(i)]["periodName"] = periodName;
		}

		const times = scheduleDB["routines"][scheduleName]["events"] as UpdatedTime[];
		const firstPeriod = times[0]["periodName"];
		const lastPeriod = times[times.length - 1]["periodName"];
		if (firstPeriod == "Break") {
			times.shift();
		}

		if (lastPeriod == "Break") {
			times.pop();
		}
	}

	// @ts-ignore
	scheduleDB["about"]["allEvents"] = scheduleDB["about"]["allEvents"].filter((element) => !checkRemovedPeriods(element));

	const correctScheduleName = findCorrectSchedule(scheduleDB, currentDate);

	if (correctScheduleName == null) {
		const tomorrowScheduleName = findCorrectSchedule(scheduleDB, new Date(currentDate.setDate(currentDate.getDate() + 1)));
		if (tomorrowScheduleName != null) {
			const scheduleTimes = scheduleDB["routines"][tomorrowScheduleName]["events"];

			return (
				<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
					<Status time="" timeRange="" className="No events for today."></Status>

					<div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 shadow-xl p-10">
						<h2 className="font-bold text-3xl flex justify-center mb-2">{"Tomorrow's Schedule:"}</h2>
						<Schedule scheduleTimes={scheduleTimes} scheduleDB={scheduleDB}></Schedule>
					</div>
				</div>
			);
		}

		return (
			<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
				<Status time="" timeRange="" className="No events for today."></Status>
			</div>
		);
	}

	const scheduleTimes = scheduleDB["routines"][correctScheduleName]["events"];

	// @ts-ignore
	if (scheduleTimes[scheduleTimes.length - 1]["endTime"] < currentTime) {
		const tomorrowScheduleName = findCorrectSchedule(scheduleDB, new Date(currentDate.setDate(currentDate.getDate() + 1)));
		if (tomorrowScheduleName != null) {
			return (
				<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
					<Countdown scheduleTimes={scheduleTimes}></Countdown>

					<div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 shadow-xl p-10">
						<h2 className="font-bold text-3xl flex justify-center mb-2">{"Tomorrow's Schedule:"}</h2>
						<Schedule scheduleTimes={scheduleTimes} scheduleDB={scheduleDB}></Schedule>
					</div>
				</div>
			);
		}
	}

	return (
		<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
			<Countdown scheduleTimes={scheduleTimes}></Countdown>

			<div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 shadow-xl p-10">
				<h2 className="font-bold text-3xl flex justify-center mb-2">{"Today's Schedule:"}</h2>
				<Schedule scheduleTimes={scheduleTimes} scheduleDB={scheduleDB}></Schedule>
			</div>
		</div>
	);
}
