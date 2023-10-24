import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

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

export default function ActiveRoutineDay(props: { currentRoutine: string; rawDayName: any; day: string; schedule: any; setSchedule: Function }) {
	return (
		<div className="flex justify-between flex-row shadow-lg p-4 bg-wedgewood-400 lg:ml-4 ml-4">
			{props.day}
			<button onClick={() => removeRoutineDay(props.currentRoutine, props.rawDayName, props.schedule, props.setSchedule)}>
				<FontAwesomeIcon className="ml-4" icon={faXmark} size="xl"></FontAwesomeIcon>
			</button>	
		</div>
	);
}
