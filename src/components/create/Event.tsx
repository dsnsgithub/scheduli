import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function modifyEvent(schedule: any, setSchedule: Function, currentRoutine: string, eventIndex: number, property: string, newValue: string) {
	const newSchedule = { ...schedule };
	newSchedule["routines"][currentRoutine]["events"][eventIndex][property] = newValue;

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
