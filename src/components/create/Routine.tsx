import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function selectRoutine(name: string, setCurrentlySelected: Function) {
	setCurrentlySelected(name);
}

function removeRoutine(name: string, schedule: any, setSchedule: Function) {
	const newSchedule = { ...schedule };
	delete newSchedule["routines"][name];

	if (Object.keys(newSchedule["routines"]).length == 0) {
		return alert("You must have at least one routine.");
	}

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function Routine(props: { name: string; rawName: string; schedule: any; currentlySelected: boolean; setCurrentlySelected: Function; setSchedule: Function }) {
	if (props.currentlySelected) {
		return (
			<div
				key={props.rawName}
				className="rounded shadow-xl inline-block border-wedgewood-600 bg-wedgewood-400 border-2 hover:cursor-pointer ml-4 p-4 mb-4"
				onClick={() => selectRoutine(props.name, props.setCurrentlySelected)}
			>
				{props.name}
				<button onClick={() => removeRoutine(props.rawName, props.schedule, props.setSchedule)}>
					<FontAwesomeIcon className="ml-4" icon={faXmark} size="xl"></FontAwesomeIcon>
				</button>
			</div>
		);
	}
	return (
		<div
			key={props.rawName}
			className="rounded shadow-xl inline-block hover:border-wedgewood-600 bg-wedgewood-400 hover:border hover:cursor-pointer ml-4 p-4 mb-4"
			onClick={() => selectRoutine(props.rawName, props.setCurrentlySelected)}
		>
			{props.name}
			<button onClick={() => removeRoutine(props.rawName, props.schedule, props.setSchedule)}>
				<FontAwesomeIcon className="ml-4" icon={faXmark} size="xl"></FontAwesomeIcon>
			</button>
		</div>
	);
}
