import React from "react";
import { Dialog, Tab } from "@headlessui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faCalendarWeek,
} from "@fortawesome/free-solid-svg-icons";

function customDateSort(item: any) {
  const days = item["days"];
  if (Array.isArray(days)) {
    // For date ranges, use the first date as the sorting key
    return new Date(days[0]).getTime();
  } else {
    // For individual dates, use the date itself as the sorting key
    return new Date(days).getTime();
  }
}

function createInactiveDay(
  days: any,
  description: string,
  schedule: any,
  setSchedule: Function,
) {
  const newSchedule = { ...schedule };

  const index = newSchedule["about"]["inactiveDays"].findIndex(
    (newItem: { days: string | string[] }) => {
      if (Array.isArray(newItem.days)) {
        return newItem.days.includes(days);
      } else {
        return newItem.days === days;
      }
    },
  );

  if (index != -1) {
    return alert("You can't have duplicate active routine days.");
  }
  newSchedule["about"]["inactiveDays"].push({
    description: description,
    days: days,
  });

  // @ts-ignore
  newSchedule["about"]["inactiveDays"].sort(
    (a: any, b: any) => customDateSort(a) - customDateSort(b),
  );

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function InactiveDayModal(props: {
  schedule: any;
  setSchedule: Function;
  isOpen: boolean;
  setIsOpen: Function;
}) {
  // Date Range
  const [selectedDate1, setSelectedDate1] = React.useState("2023-09-06");
  const [selectedDate2, setSelectedDate2] = React.useState("2023-09-10");

  const [selectedDate, setSelectedDate] = React.useState("2023-09-06");
  const [currentSelection, setCurrentSelection] = React.useState(0);

  const [inactiveName, setInactiveName] = React.useState("New Inactive Day");

  // createRoutineDay(props.currentRoutine, props.schedule, props.setSchedule);

  return (
    <Dialog
      open={props.isOpen}
      onClose={() => props.setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-10">
        <Dialog.Panel className="w-full max-w-lg bg-wedgewood-200 p-10">
          <Dialog.Title className="font-bold text-2xl">
            Choose New Inactive Day
          </Dialog.Title>

          <div className="flex space-x-1 bg-wedgewood-300 p-4 items-center justify-between mt-4 rounded-lg">
            <label className="text-xl lg:ml-10">Name: </label>
            <input
              className="rounded shadow outline-none border-2 border-wedgewood-500 focus:border-wedgewood-600 lg:w-64 p-3 md:ml-4 bg-wedgewood-300"
              // @ts-ignore
              value={inactiveName}
              onChange={(e) => {
                setInactiveName(e.target.value);
              }}
              maxLength={32}
            ></input>
          </div>

          <div className="px-2 py-8 sm:px-0">
            <Tab.Group
              onChange={(index) => {
                setCurrentSelection(index);
              }}
            >
              <Tab.List className="flex space-x-1 bg-wedgewood-300 p-6 rounded-lg">
                <Tab className="rounded-xl bg-wedgewood-200 p-3 ui-selected:border-wedgewood-400 ui-selected:bg-wedgewood-300 ui-selected:border-2">
                  <FontAwesomeIcon
                    icon={faCalendarDay}
                    size="lg"
                    className="mr-4"
                  ></FontAwesomeIcon>
                  Single Date
                </Tab>
                <Tab className="rounded-xl bg-wedgewood-200 p-3 ui-selected:border-wedgewood-400 ui-selected:bg-wedgewood-300 ui-selected:border-2">
                  <FontAwesomeIcon
                    icon={faCalendarWeek}
                    size="lg"
                    className="mr-4"
                  ></FontAwesomeIcon>
                  Date Range
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  <div className="bg-wedgewood-300 p-10 mt-4">
                    <input
                      type="date"
                      className="rounded shadow appearance-none border w-64 p-3 ml-4"
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
                        className="rounded shadow appearance-none border w-64 p-3 ml-2"
                        onChange={(e) => setSelectedDate1(e.target.value)}
                        defaultValue="2023-09-06"
                      ></input>
                    </div>

                    <div className="flex items-center mt-4">
                      <label>End Date:</label>

                      <input
                        type="date"
                        className="rounded shadow appearance-none border w-64 p-3 ml-2"
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
