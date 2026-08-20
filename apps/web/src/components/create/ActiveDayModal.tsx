import { faChevronDown, faCalendarDay, faCalendarWeek } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, Tab, Listbox } from "@headlessui/react";
import { UnparsedDay, UnparsedSchedule } from "@scheduli/types";
import React from "react";

function createRoutineDay(
  currentRoutine: string,
  rawDayName: UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[],
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
) {
  const newSchedule = { ...schedule };

  const index = newSchedule["routines"][currentRoutine]["days"].indexOf(rawDayName);

  if (index != -1) {
    return alert("You can't have duplicate active routine days.");
  }
  newSchedule["routines"][currentRoutine]["days"].push(rawDayName);

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

export default function ActiveDayModal(props: {
  currentRoutine: string;
  schedule: UnparsedSchedule;
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const days = [
    { id: 0, name: "Sunday", unavailable: false },
    { id: 1, name: "Monday", unavailable: false },
    { id: 2, name: "Tuesday", unavailable: false },
    { id: 3, name: "Wednesday", unavailable: false },
    { id: 4, name: "Thursday", unavailable: false },
    { id: 5, name: "Friday", unavailable: false },
    { id: 6, name: "Saturday", unavailable: false },
  ];

  const [selectedDay, setSelectedDay] = React.useState(days[1]);
  const [selectedDate, setSelectedDate] = React.useState("2023-09-06");
  const [currentSelection, setCurrentSelection] = React.useState(0);

  // createRoutineDay(props.currentRoutine, props.schedule, props.setSchedule);

  return (
    <Dialog open={props.isOpen} onClose={() => props.setIsOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 sm:p-10">
        <Dialog.Panel className="w-full max-w-lg bg-wedgewood-200 p-4 sm:p-8 rounded-lg">
          <Dialog.Title className="font-bold text-xl sm:text-2xl">
            Choose New Active Day
          </Dialog.Title>

          <div className="px-1 py-6 sm:px-0">
            <Tab.Group
              onChange={(index) => {
                setCurrentSelection(index);
              }}
            >
              <Tab.List className="flex flex-wrap gap-2 bg-wedgewood-300 p-2 sm:p-4 rounded-lg">
                <Tab className="rounded-xl bg-wedgewood-400 px-3 py-2 ui-selected:border-wedgewood-600 ui-selected:bg-wedgewood-500 ui-selected:border-2 ">
                  <FontAwesomeIcon
                    icon={faCalendarWeek}
                    size="lg"
                    className="mr-2"
                  ></FontAwesomeIcon>
                  Day of the Week
                </Tab>
                <Tab className="rounded-xl bg-wedgewood-400 px-3 py-2 ui-selected:border-wedgewood-600 ui-selected:bg-wedgewood-500 ui-selected:border-2 ">
                  <FontAwesomeIcon
                    icon={faCalendarDay}
                    size="lg"
                    className="mr-2"
                  ></FontAwesomeIcon>
                  Custom Date
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  <div className="bg-wedgewood-300 p-4 sm:p-6 mt-4 rounded-lg">
                    <Listbox value={selectedDay} onChange={setSelectedDay}>
                      <Listbox.Button className="bg-wedgewood-500 p-3 sm:p-4 shadow-xl rounded-lg w-full flex items-center justify-between">
                        {selectedDay.name}{" "}
                        <FontAwesomeIcon icon={faChevronDown} size="lg"></FontAwesomeIcon>
                      </Listbox.Button>
                      <Listbox.Options className="bg-wedgewood-400 p-3 sm:p-4 shadow-xl rounded-lg mt-3">
                        {days.map((day) => (
                          <Listbox.Option
                            key={day.id}
                            value={day}
                            disabled={day.unavailable}
                            className="shadow-xl mt-2 border-2 border-wedgewood-600 ui-active:bg-wedgewood-500 ui-not-active:bg-wedgewood-400 ui-not-active:text-black p-3 rounded-sm"
                          >
                            {day.name}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Listbox>
                  </div>
                </Tab.Panel>
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
              </Tab.Panels>

              <div className="grid justify-items-end">
                <button
                  className="bg-wedgewood-400 p-3 px-4 rounded-sm mt-6 hover:bg-wedgewood-500 transition-colors"
                  onClick={() => {
                    if (currentSelection == 0) {
                      createRoutineDay(
                        props.currentRoutine,
                        selectedDay["id"],
                        props.schedule,
                        props.setSchedule,
                      );
                    } else {
                      createRoutineDay(
                        props.currentRoutine,
                        selectedDate,
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
