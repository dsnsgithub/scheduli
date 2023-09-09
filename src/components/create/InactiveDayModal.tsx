import React from "react";
import { Dialog, Tab, Listbox } from "@headlessui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

function customDateSort(item: any) {
	if (Array.isArray(item)) {
		// For date ranges, use the first date as the sorting key
		return new Date(item[0]);
	} else if (typeof item === "string") {
		// For individual dates, use the date itself as the sorting key
		return new Date(item);
	}
}

function createInactiveDay(item: any, schedule: any, setSchedule: Function) {
	const newSchedule = { ...schedule };

	const index = newSchedule["about"]["inactive"].indexOf(item);

	if (index != -1) {
		return alert("You can't have duplicate active routine days.");
	}
	newSchedule["about"]["inactive"].push(item);

	// @ts-ignore
	newSchedule["about"]["inactive"].sort((a: any, b: any) => customDateSort(a) - customDateSort(b));

	setSchedule(newSchedule);
	localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function InactiveDayModal(props: { schedule: any; setSchedule: Function; isOpen: boolean; setIsOpen: Function }) {
	// Date Range
	const [selectedDate1, setSelectedDate1] = React.useState("2023-09-06");
	const [selectedDate2, setSelectedDate2] = React.useState("2023-09-10");

	const [selectedDate, setSelectedDate] = React.useState("2023-09-06");
	const [currentSelection, setCurrentSelection] = React.useState(0);

	// createRoutineDay(props.currentRoutine, props.schedule, props.setSchedule);

	return (
		<Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)} className="relative z-50">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			<div className="fixed inset-0 flex w-screen items-center justify-center p-10">
				<Dialog.Panel className="w-full max-w-lg bg-wedgewood-200 p-10">
					<Dialog.Title className="font-bold text-2xl">Choose New Inactive Day</Dialog.Title>

					<div className="px-2 py-8 sm:px-0">
						<Tab.Group
							onChange={(index) => {
								setCurrentSelection(index);
							}}
						>
							<Tab.List className="flex space-x-1 bg-wedgewood-300 p-4">
								<Tab className="rounded-xl bg-wedgewood-400 p-3 ui-selected:border-wedgewood-600 ui-selected:bg-wedgewood-500 ui-selected:border-2 ">Single Date</Tab>
								<Tab className="rounded-xl bg-wedgewood-400 p-3 ui-selected:border-wedgewood-600 ui-selected:bg-wedgewood-500 ui-selected:border-2 ">Date Range</Tab>
							</Tab.List>
							<Tab.Panels>
								<Tab.Panel>
									<div className="bg-wedgewood-300 p-10 mt-4">
										<input
											type="date"
											className="rounded shadow appearance-none border w-64 p-2 ml-4"
											onChange={(e) => setSelectedDate(e.target.value)}
											defaultValue="2023-09-06"
										></input>
									</div>
								</Tab.Panel>
								<Tab.Panel>
									<div className="bg-wedgewood-300 p-10 mt-4">
										<div className="flex items-center">
											<label>Start Date:</label>
											<input
												type="date"
												className="rounded shadow appearance-none border w-64 p-2 ml-2"
												onChange={(e) => setSelectedDate1(e.target.value)}
												defaultValue="2023-09-06"
											></input>
										</div>

										<div className="flex items-center mt-4">
											<label>End Date:</label>

											<input
												type="date"
												className="rounded shadow appearance-none border w-64 p-2 ml-2"
												onChange={(e) => setSelectedDate2(e.target.value)}
												defaultValue="2023-09-10"
											></input>
										</div>
									</div>
								</Tab.Panel>
							</Tab.Panels>

							<div className="grid justify-items-end">
								<button
									className="bg-wedgewood-400 ml-4 p-3 px-4 rounded mt-6"
									onClick={() => {
										if (currentSelection == 0) {
											createInactiveDay(selectedDate, props.schedule, props.setSchedule);
										} else {
											createInactiveDay([selectedDate1, selectedDate2], props.schedule, props.setSchedule);
										}
										props.setIsOpen(false);
									}}
								>
									Add Day
								</button>
							</div>
						</Tab.Group>
					</div>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
}
