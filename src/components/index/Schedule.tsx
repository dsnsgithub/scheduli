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

function formatDate(timestamp: number) {
	const date = new Date(timestamp); // Convert Unix timestamp to milliseconds
	const timeString = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
	return timeString;
}

function sameDay(d1: Date, d2: Date) {
	return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
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

// @ts-ignore
export default function Schedule(props: { scheduleTimes: UpdatedTime[]; scheduleDB: ScheduleDB }) {
	let title = "Today's Schedule:";
	const currentDate = new Date();
	const currentTime = currentDate.getTime();

	let scheduleTimes = props.scheduleTimes;

	// School is over
	if (props.scheduleTimes[props.scheduleTimes.length - 1]["endTime"] < currentTime) {
		const tomorrowScheduleName = findCorrectSchedule(props.scheduleDB, new Date(currentDate.setDate(currentDate.getDate() + 1)));
		if (tomorrowScheduleName != null) {
			// @ts-ignore
			scheduleTimes = props.scheduleDB["routines"][tomorrowScheduleName]["events"];
			title = "Tomorrow's Schedule:";
		}
	}

	return (
		<>
			<h2 className="font-bold text-3xl flex justify-center mb-2">{title}</h2>

			<table className="w-full text-sm text-center">
				<thead className="text-lg bg-wedgewood-300">
					<tr>
						<td scope="col" className="px-3 py-3">
							<b>Event</b>
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
