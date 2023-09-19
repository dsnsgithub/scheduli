import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function sortByStartTime(array: any) {
	return array.sort((a: any, b: any) => {
		const startTimeA = a.startTime.split(":").map(Number);
		const startTimeB = b.startTime.split(":").map(Number);

		if (startTimeA[0] !== startTimeB[0]) {
			return startTimeA[0] - startTimeB[0]; // Sort by hour
		} else {
			return startTimeA[1] - startTimeB[1]; // If hours are the same, sort by minute
		}
	});
}

function modifyEvent(schedule: any, setSchedule: Function, currentRoutine: string, eventIndex: number, property: string, newValue: string) {
	const newSchedule = { ...schedule };
	newSchedule["routines"][currentRoutine]["events"][eventIndex][property] = newValue;

	newSchedule["routines"][currentRoutine]["events"] = sortByStartTime(newSchedule["routines"][currentRoutine]["events"]);

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
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

export default function Event(props: { name: string; startTime: string; endTime: string; schedule: any; setSchedule: Function; currentRoutine: string; eventIndex: number }) {
	return (
		<div className="flex flex-col mt-8">
			<div className="shadow-xl p-2 md:p-8 lg:p-10 mt-8 bg-wedgewood-400">
				<div className="flex items-center justify-between">
					<div>
						<label className="text-lg">Name:</label>
						<input
							// autoFocus={true}
							className="rounded shadow outline-none border-2 border-wedgewood-500 focus:border-wedgewood-600 lg:w-64 p-2 md:ml-4 bg-wedgewood-300 "
							onChange={(e) => modifyEvent(props.schedule, props.setSchedule, props.currentRoutine, props.eventIndex, "name", e.target.value)}
							defaultValue={props.name}
							maxLength={32}
						></input>
					</div>

					<button onClick={() => removeEvent(props.currentRoutine, props.schedule, props.setSchedule, props.eventIndex)}>
						<FontAwesomeIcon icon={faXmark} size="xl"></FontAwesomeIcon>
					</button>
				</div>

				<div className="lg:flex mt-6 items-center">
					<div>
						<label className="text-lg">Start Time:</label>
						<input
							className="rounded shadow outline-none border-2 border-wedgewood-500 focus:border-wedgewood-600 lg:w-64 p-2 md:ml-4 bg-wedgewood-300"
							type="time"
							onChange={(e) => modifyEvent(props.schedule, props.setSchedule, props.currentRoutine, props.eventIndex, "startTime", e.target.value)}
							defaultValue={props.startTime}
						></input>
					</div>

					<div>
						<label className="text-lg lg:ml-4">End Time:</label>
						<input
							className="rounded shadow outline-none border-2 border-wedgewood-500 focus:border-wedgewood-600 lg:w-64 p-2 md:ml-4 bg-wedgewood-300"
							type="time"
							onChange={(e) => modifyEvent(props.schedule, props.setSchedule, props.currentRoutine, props.eventIndex, "endTime", e.target.value)}
							defaultValue={props.endTime}
						></input>
					</div>
				</div>
			</div>
		</div>
	);
}
