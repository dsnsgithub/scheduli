import React from "react";
export interface ScheduleDB {
	about: About;
	regular: Schedule;
	wednesday: Schedule;
	thursday: Schedule;
	minimum: Schedule;
	rally: Schedule;
	assembly: Schedule;
	"finalShort1+4": Schedule;
	"finalShort2+5": Schedule;
	"finalShort3+6": Schedule;
	finalReverse: Schedule;
}

export interface About {
	startDate: string;
	endDate: string;
	noSchool: any[];
	avaliablePeriods: string[];
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

function formatDate(timestamp: number) {
	const date = new Date(timestamp); // Convert Unix timestamp to milliseconds
	const timeString = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
	return timeString;
}

function timeBetweenDates(firstDate: number, secondDate: number) {
	const timeDifference = secondDate - firstDate;

	let hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
	let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

	let secondString = String(seconds);
	let minuteString = String(minutes);
	if (seconds < 10) secondString = `0${seconds}`;
	if (minutes < 10) minuteString = `0${minutes}`;
	if (!hours) {
		return `${minuteString}:${secondString}`;
	}

	return `${hours}:${minuteString}:${secondString}`;
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

// @ts-ignore
function Schedule(props: { scheduleTimes: UpdatedTime[], scheduleDB: ScheduleDB }) {
	let title = "Today's Schedule:"
	const currentDate = new Date();
	const currentTime = currentDate.getTime();

	let scheduleTimes = props.scheduleTimes;

	// School is over
	if (props.scheduleTimes[props.scheduleTimes.length - 1]["endTime"] < currentTime) {
		const tomorrowScheduleName = findCorrectSchedule(props.scheduleDB, new Date(currentDate.setDate(currentDate.getDate() + 1)));
		if (tomorrowScheduleName != null) {
			// @ts-ignore
			scheduleTimes = props.scheduleDB[tomorrowScheduleName]["times"];
			title = "Tomorrow's Schedule:"
		}
	}

	return (
		<>
			<h2 className="font-bold text-3xl flex justify-center mb-2">{title}</h2>

			<table className="w-full text-sm text-center">
				<thead className="text-lg bg-wedgewood-300">
					<tr>
						<td scope="col" className="px-3 py-3">
							<b>Period</b>
						</td>
						<td scope="col" className="px-3 py-3">
							<b>Start Time</b>
						</td>
						<td scope="col" className="px-3 py-3">
							<b>End Time</b>
						</td>
					</tr>
				</thead>
				<tbody className="bg-wedgewood-200">
					{scheduleTimes.map(({ rawPeriodName, startTime, endTime, periodName }) => {
						return (
							<tr key={startTime} className="border-0">
								<td scope="row" className="px-3 py-3 font-medium">
									{periodName}
								</td>
								<td className="px-3 py-3 font-medium">{formatDate(startTime)}</td>
								<td className="px-3 py-3 font-medium ">{formatDate(endTime)}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</>
	);
}

function createAvaliablePeriodsDB(scheduleDB: ScheduleDB) {
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
	for (const item of scheduleDB["about"]["noSchool"]) {
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

	for (const schedule in scheduleDB) {
		if (schedule == "about") continue;

		// @ts-ignore
		const days = scheduleDB[schedule]["days"];

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

function Status(props: { time: string; className: string; timeRange: string }) {
	return (
		<div className="flex items-center justify-center flex-col shadow-xl rounded-lg p-10 lg:p-24 bg-wedgewood-300">
			<h3 className="text-6xl font-bold">{props.time}</h3>
			<h4 className="text-2xl mt-4">{props.className}</h4>
			<h4 className="mt-4">{props.timeRange}</h4>
		</div>
	);
}

// @ts-ignore
function Countdown(props: { scheduleTimes }) {
	let scheduleTimes = props.scheduleTimes;
	const [currentTime, setCurrentTime] = React.useState(new Date().getTime());

	React.useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date().getTime());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// School has started
	if (scheduleTimes[0]["startTime"] > currentTime) {
		const timeTil = timeBetweenDates(currentTime, scheduleTimes[0]["startTime"]);

		return <Status time={timeTil} timeRange="Make sure to complete your homework!" className={scheduleTimes[0]["periodName"]}></Status>;
	}

	// School is over
	if (scheduleTimes[scheduleTimes.length - 1]["endTime"] < currentTime) {
		return <Status time="The school day is over." timeRange="" className="Make sure to complete your homework!"></Status>;
	}

	for (let periodIndex in scheduleTimes) {
		// @ts-ignore
		periodIndex = Number(periodIndex);
		const period = scheduleTimes[periodIndex];
		const nextPeriod = scheduleTimes[periodIndex + 1];

		if (period["startTime"] <= currentTime && period["endTime"] >= currentTime) {
			if (nextPeriod) {
				return (
					<Status
						time={`${nextPeriod["periodName"]} will start in ${timeBetweenDates(currentTime, nextPeriod["startTime"])}.`}
						timeRange={`${formatDate(period["startTime"])} to ${formatDate(period["endTime"])}`}
						className={period["periodName"]}
					></Status>
				);
			} else {
				return (
					<Status
						time={`School will end in ${timeBetweenDates(currentTime, period["endTime"])}`}
						timeRange={`${formatDate(period["startTime"])} to ${formatDate(period["endTime"])}`}
						className={period["periodName"]}
					></Status>
				);
			}
		}

		// if there is a break in the schedule
		if (nextPeriod && period["endTime"] < currentTime && nextPeriod["startTime"] > currentTime) {
			return (
				<Status
					time={`${nextPeriod["periodName"]} will start in ${timeBetweenDates(currentTime, nextPeriod["startTime"])}.`}
					timeRange={`${formatDate(nextPeriod["startTime"])} to ${formatDate(nextPeriod["endTime"])}`}
					className={nextPeriod["periodName"]}
				></Status>
			);
		}
	}
}

export default function Home() {
	let [scheduleDB, setScheduleDB] = React.useState(null);
	const [isLoading, setLoading] = React.useState(true);

	React.useEffect(() => {

		// if (!localStorage.getItem("currentSchedule")) {
			fetch("/api/schedule/dvhs")
				.then((res) => res.json())
				.then((data) => {
					setScheduleDB(data);
					setLoading(false);
				});
		// } else {
		// 	setScheduleDB(JSON.parse(localStorage.getItem("currentSchedule") || "{}"));
		// 	setLoading(false);
		// }
		
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
					<h2 className="text-2xl mt-4">No schedule found...</h2>
				</div>
			</div>
		);
	}

	//? all necessary prereqs are collected
	const currentDate = new Date();
	// const currentDate = new Date(new Date().setDate(new Date().getDate() + 1));

	if (!localStorage.getItem("periodNames")) createAvaliablePeriodsDB(scheduleDB);
	if (!localStorage.getItem("removedPeriods")) createRemovedPeriodsDB();

	// parse schedules, fixing names and other issues
	// must loop backwards to avoid weird index issues

	for (const scheduleName in scheduleDB as ScheduleDB) {
		if (scheduleName == "about") continue;

		// @ts-ignore
		for (let i = scheduleDB[scheduleName]["times"].length - 1; i >= 0; i--) {
			const rawPeriodName = scheduleDB[scheduleName]["times"][i]["rawPeriodName"];
			// @ts-ignore
			if (checkRemovedPeriods(rawPeriodName)) {
				// @ts-ignore
				scheduleDB[scheduleName]["times"].splice(i, 1);
				continue;
			}

			let periodName = findCorrectPeriodName(rawPeriodName);
			if (periodName.length == 1) periodName = `${getOrdinalNumber(periodName)} period`;
			if (periodName == "Passing") {
				// @ts-ignore
				scheduleDB[scheduleName]["times"].splice(i, 1);
				continue;
			}

			if (typeof scheduleDB[scheduleName]["times"][Number(i)]["startTime"] == "string") {
				// @ts-ignore
				scheduleDB[scheduleName]["times"][Number(i)]["startTime"] = createCustomDate(scheduleDB[scheduleName]["times"][Number(i)]["startTime"]);
				// @ts-ignore
				scheduleDB[scheduleName]["times"][Number(i)]["endTime"] = createCustomDate(scheduleDB[scheduleName]["times"][Number(i)]["endTime"]);
			}
				
			// @ts-ignore
			scheduleDB[scheduleName]["times"][Number(i)]["periodName"] = periodName;
		}

		const times = scheduleDB[scheduleName]["times"] as UpdatedTime[];
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
	scheduleDB["about"]["avaliablePeriods"] = scheduleDB["about"]["avaliablePeriods"].filter((element) => !checkRemovedPeriods(element));

	const correctScheduleName = findCorrectSchedule(scheduleDB, currentDate);
	console.log(correctScheduleName);
	console.log(scheduleDB);

	if (correctScheduleName == null) {
		const tomorrowScheduleName = findCorrectSchedule(scheduleDB, new Date(currentDate.setDate(currentDate.getDate() + 1)));
		if (tomorrowScheduleName != null) {
			const scheduleTimes = scheduleDB[tomorrowScheduleName]["times"];

			return (
				<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
					<Status time="No School!" timeRange="" className="Enjoy your time off!"></Status>

					<div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 shadow-xl p-10">
						<h2 className="font-bold text-3xl flex justify-center mb-2">{"Tomorrow's Schedule:"}</h2>
						<Schedule scheduleTimes={scheduleTimes} scheduleDB={scheduleDB}></Schedule>
					</div>
				</div>
			);
		};


		return (
			<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
				<Status time="No School!" timeRange="" className="Enjoy your time off!"></Status>

				{/* <div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 rounded-full">
					<Schedule></Schedule>
				</div> */}
			</div>
		);

		// await populateTomorrowSection(scheduleDB, currentDate);
		// return;
	}

	const scheduleTimes = scheduleDB[correctScheduleName]["times"];

	return (
		<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
			<Countdown scheduleTimes={scheduleTimes}></Countdown>

			<div className="table-fixed px-0 mt-8 lg:px-64 xl:px-96 shadow-xl p-10">
				<Schedule scheduleTimes={scheduleTimes} scheduleDB={scheduleDB}></Schedule>
			</div>
		</div>
	);
}
