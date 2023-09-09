import React from "react";
import { Dialog, Tab, Listbox } from "@headlessui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function ImportSchedule(props: { schedule: any; setSchedule: Function; isOpen: boolean; setIsOpen: Function; setCurrentRoutine: Function; setScheduleStartDate: Function, setScheduleEndDate: Function, setScheduleName: Function }) {
	const schedulesArray = [{ id: "dvhs", name: "DVHS", unavailable: false }];
	const [selectedSchedule, setSelectedSchedule] = React.useState(schedulesArray[0]);

	return (
		<Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)} className="relative z-50">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			<div className="fixed inset-0 flex w-screen items-center justify-center p-10">
				<Dialog.Panel className="w-full max-w-lg bg-wedgewood-200 p-10">
					<Dialog.Title className="font-bold text-2xl">Choose Schedule Preset</Dialog.Title>

					<div className="bg-wedgewood-300 p-10 mt-4">
						<Listbox value={selectedSchedule} onChange={setSelectedSchedule}>
							<Listbox.Button className="bg-wedgewood-500 p-4 shadow-xl">
								{selectedSchedule.name} <FontAwesomeIcon icon={faChevronDown} size="lg"></FontAwesomeIcon>
							</Listbox.Button>
							<Listbox.Options className="bg-wedgewood-400 p-4 shadow-xl">
								{schedulesArray.map((schedule) => (
									<Listbox.Option
										key={schedule.id}
										value={schedule}
										disabled={schedule.unavailable}
										className="shadow-xl mt-2 border-2 border-wedgewood-600 ui-active:bg-wedgewood-500 ui-not-active:bg-wedgewood-400 ui-not-active:text-black p-3 rounded"
									>
										{schedule.name}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Listbox>
					</div>

					<div className="grid justify-items-end">
						<button
							className="bg-wedgewood-400 ml-4 p-3 px-4 rounded mt-6"
							onClick={() => {
								fetch(`/api/schedule/${selectedSchedule.id}`)
									.then((res) => res.json())
									.then((data) => {
										localStorage.setItem("currentSchedule", JSON.stringify(data));
										props.setSchedule(data);

										localStorage.setItem("periodNames", "");
										localStorage.setItem("removedPeriods", "");

										props.setCurrentRoutine(Object.keys(JSON.parse(localStorage.getItem("currentSchedule") || "")["routines"])[0]);

										props.setScheduleName(JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["name"]);
										props.setScheduleStartDate(JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["startDate"]);
										props.setScheduleEndDate(JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["endDate"]);
									});
								props.setIsOpen(false);
							}}
						>
							Add Day
						</button>
					</div>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}
