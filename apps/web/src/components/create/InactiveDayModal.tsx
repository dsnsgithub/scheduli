import { faCalendarDay, faCalendarWeek } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, Tab } from "@headlessui/react";
import { UnparsedDay, UnparsedSchedule } from "@scheduli/types";
import React from "react";

function customDateSort(item: { description?: string; days?: UnparsedDay | UnparsedDay[] }) {
  const days = item["days"];
  if (Array.isArray(days)) {
    // For date ranges, use the first date as the sorting key
    return new Date(days[0]).getTime();
  } else {
    // For individual dates, use the date itself as the sorting key
    return new Date(days as UnparsedDay).getTime();
  }
}

function createInactiveDay(
  days: UnparsedDay | UnparsedDay[],
  description: string,
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
) {
  const newSchedule = { ...schedule };

  const index = newSchedule["about"]["inactiveDays"].findIndex((newItem) => {
    if (Array.isArray(newItem.days)) {
      return newItem.days.includes(days as UnparsedDay);
    } else {
      return newItem.days === days;
    }
  });

  if (index != -1) {
    return alert("You can't have duplicate active routine days.");
  }
  newSchedule["about"]["inactiveDays"].push({
    description: description,
    days: days,
  });

  newSchedule["about"]["inactiveDays"].sort((a, b) => customDateSort(a) - customDateSort(b));

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function InactiveDayModal(props: {
  schedule: UnparsedSchedule;
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // Date Range
  const [selectedDate1, setSelectedDate1] = React.useState("2023-09-06");
  const [selectedDate2, setSelectedDate2] = React.useState("2023-09-10");

  const [selectedDate, setSelectedDate] = React.useState("2023-09-06");
  const [currentSelection, setCurrentSelection] = React.useState(0);

  const [inactiveName, setInactiveName] = React.useState("New Inactive Day");

  // createRoutineDay(props.currentRoutine, props.schedule, props.setSchedule);

  return (
    <Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 sm:p-10">
        <Dialog.Panel className="w-full max-w-lg bg-wedgewood-200 p-4 sm:p-8 rounded-lg">
          <Dialog.Title className="font-bold text-xl sm:text-2xl">
            Choose New Inactive Day
          </Dialog.Title>

          <div className="flex flex-col sm:flex-row gap-2 bg-wedgewood-300 p-3 sm:p-4 items-start sm:items-center justify-between mt-4 rounded-lg">
            <label className="text-base sm:text-lg font-semibold">Name</label>
            <input
              className="rounded-sm shadow-sm outline-hidden border-2 border-wedgewood-500 focus:border-wedgewood-600 w-full sm:w-64 p-3 bg-wedgewood-300"
              value={inactiveName}
              onChange={(e) => {
                setInactiveName(e.target.value);
              }}
              maxLength={32}
            ></input>
          </div>

          <div className="px-1 py-6 sm:px-0">
            <Tab.Group
              onChange={(index) => {
                setCurrentSelection(index);
              }}
            >
              <Tab.List className="flex flex-wrap gap-2 bg-wedgewood-300 p-2 sm:p-4 rounded-lg">
                <Tab className="rounded-xl bg-wedgewood-200 px-3 py-2 ui-selected:border-wedgewood-400 ui-selected:bg-wedgewood-300 ui-selected:border-2">
                  <FontAwesomeIcon
                    icon={faCalendarDay}
                    size="lg"
                    className="mr-2"
                  ></FontAwesomeIcon>
                  Single Date
                </Tab>
                <Tab className="rounded-xl bg-wedgewood-200 px-3 py-2 ui-selected:border-wedgewood-400 ui-selected:bg-wedgewood-300 ui-selected:border-2">
                  <FontAwesomeIcon
                    icon={faCalendarWeek}
                    size="lg"
                    className="mr-2"
                  ></FontAwesomeIcon>
                  Date Range
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  <div className="bg-wedgewood-300 p-4 sm:p-6 mt-4 rounded-lg">
                    <input
                      type="date"
                      className="rounded-sm shadow-sm appearance-none border w-full p-3"
                      onChange={(e) => setSelectedDate(e.target.value)}
                      defaultValue="2023-09-06"
                    ></input>
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <div className="bg-wedgewood-300 p-4 sm:p-6 mt-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm sm:text-base font-semibold">Start Date</label>
                      <input
                        type="date"
                        className="rounded-sm shadow-sm appearance-none border w-full sm:w-64 p-3"
                        onChange={(e) => setSelectedDate1(e.target.value)}
                        defaultValue="2023-09-06"
                      ></input>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                      <label className="text-sm sm:text-base font-semibold">End Date</label>

                      <input
                        type="date"
                        className="rounded-sm shadow-sm appearance-none border w-full sm:w-64 p-3"
                        onChange={(e) => setSelectedDate2(e.target.value)}
                        defaultValue="2023-09-10"
                      ></input>
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>

              <div className="grid justify-items-end">
                <button
                  className="bg-wedgewood-400 p-3 px-4 rounded-sm mt-6 hover:bg-wedgewood-500 transition-colors"
                  onClick={() => {
                    if (currentSelection == 0) {
                      createInactiveDay(
                        selectedDate,
                        inactiveName,
                        props.schedule,
                        props.setSchedule,
                      );
                    } else {
                      createInactiveDay(
                        [selectedDate1, selectedDate2],
                        inactiveName,
                        props.schedule,
                        props.setSchedule,
                      );
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
