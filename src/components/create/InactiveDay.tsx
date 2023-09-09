import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function removeInactiveDay(rawName: string, schedule: any, setSchedule: Function) {
	const newSchedule = { ...schedule };

	const index = newSchedule["about"]["inactive"].indexOf(rawName);
	newSchedule["about"]["inactive"].splice(index, 1);

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function InactiveDay(props: { rawName: string; schedule: any; name: string, setSchedule: Function }) {
	return (
		<div className="shadow-lg p-4 bg-wedgewood-500 lg:ml-4 ml-4 mt-2 inline-block">
			{props.name}
			<button onClick={() => removeInactiveDay(props.rawName, props.schedule, props.setSchedule)}>
				<FontAwesomeIcon className="ml-4" icon={faXmark} size="xl"></FontAwesomeIcon>
			</button>
		</div>
	);
}
