import { useAutoAnimate } from "@formkit/auto-animate/react";
import { faPlus, faFileImport, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faFileExport } from "@fortawesome/free-solid-svg-icons/faFileExport";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UnparsedSchedule } from "@scheduli/types";
import React from "react";
import Image from "next/image";

import EventEditor from "@/components/create/EventEditor";
import ImportSchedule from "@/components/create/ImportSchedule";
import InactiveDayEditor from "@/components/create/InactiveDayEditor";
import googlePlayBadge from "../../public/mobile/google-play-badge.png";
import appleBadge from "../../public/mobile/apple.svg";
import Routine from "@/components/create/Routine";
import { generateICSFile } from "@/lib/generateICSFile";

function createNewRoutine(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
) {
  const enteredName = prompt("Please enter a routine name:");

  if (enteredName) {
    const newSchedule = { ...schedule };
    newSchedule["routines"][enteredName] = {
      officialName: enteredName,
      days: [1, 2, 3],
      events: [
        {
          rawPeriodName: "New Event!!",
          name: "New Event!!",
          startTime: "08:40",
          endTime: "08:45",
        },
      ],
    };

    setSchedule(newSchedule);
    localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
  }
}

function updateAbout(
  property: "name" | "startDate" | "endDate" | "lastUpdated" | "compatibleVersion" | "link",
  newValue: string,
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
) {
  const newSchedule: UnparsedSchedule = JSON.parse(JSON.stringify(schedule));
  newSchedule["about"][property] = newValue;

  setSchedule(newSchedule);
  localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
}

function reset(
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule | null>>,
  setCurrentRoutine: React.Dispatch<React.SetStateAction<string>>,
  setScheduleName: React.Dispatch<React.SetStateAction<string>>,
  setScheduleStartDate: React.Dispatch<React.SetStateAction<string>>,
  setScheduleEndDate: React.Dispatch<React.SetStateAction<string>>,
) {
  const result = confirm("Are you sure that you want to reset your entire schedule?");

  if (result) {
    localStorage.clear();
    fetch("/api/schedule/default")
      .then((res) => res.json())
      .then((data) => {
        setScheduleDB(data);
        localStorage.setItem("currentSchedule", JSON.stringify(data));

        setScheduleName(JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["name"]);
        setScheduleStartDate(
          JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["startDate"],
        );
        setScheduleEndDate(
          JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["endDate"],
        );

        setCurrentRoutine(
          Object.keys(JSON.parse(localStorage.getItem("currentSchedule") || "")["routines"])[0],
        );
      });
  }
}

export default function Create() {
  const [currentRoutine, setCurrentRoutine] = React.useState("Routine 1");
  const [schedule, setSchedule] = React.useState<UnparsedSchedule | null>(null);
  const [isLoading, setLoading] = React.useState(true);

  const [isImportOpen, setIsImportOpen] = React.useState(false);

  const [scheduleName, setScheduleName] = React.useState("");
  const [scheduleStartDate, setScheduleStartDate] = React.useState("");
  const [scheduleEndDate, setScheduleEndDate] = React.useState("");

  const [routines] = useAutoAnimate();

  React.useEffect(() => {
    if (localStorage.getItem("currentSchedule") != null) {
      setSchedule(JSON.parse(localStorage.getItem("currentSchedule") || ""));

      setScheduleName(JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["name"]);
      setScheduleStartDate(
        JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["startDate"],
      );
      setScheduleEndDate(
        JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["endDate"],
      );

      setCurrentRoutine(
        Object.keys(JSON.parse(localStorage.getItem("currentSchedule") || "")["routines"])[0],
      );
      setLoading(false);
    } else {
      fetch("/api/schedule/default")
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem("currentSchedule", JSON.stringify(data));
          setSchedule(data);

          setScheduleName(
            JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["name"],
          );
          setScheduleStartDate(
            JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["startDate"],
          );
          setScheduleEndDate(
            JSON.parse(localStorage.getItem("currentSchedule") || "")["about"]["endDate"],
          );

          setCurrentRoutine(
            Object.keys(JSON.parse(localStorage.getItem("currentSchedule") || "")["routines"])[0],
          );
          setLoading(false);
        });
    }
  }, []);

  if (isLoading || !schedule) {
    return (
      <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
        <div className="flex items-center justify-center flex-col shadow-xl rounded-lg p-10 lg:p-24 bg-wedgewood-300">
          <h2 className="text-2xl mt-4">Loading...</h2>
        </div>
      </div>
    );
  }

  // backwards compatibility
  if (!schedule["about"]["inactiveDays"]) {
    const newSchedule = JSON.parse(JSON.stringify(schedule));

    newSchedule["about"]["inactiveDays"] = schedule["about"]["inactive"].map((item) => {
      return { description: "Inactive Day", days: item };
    });

    localStorage.setItem("currentSchedule", JSON.stringify(newSchedule));
    setSchedule(newSchedule);
  }

  const routinesElemList = [];
  for (const routine in schedule["routines"]) {
    if (routine == currentRoutine) {
      routinesElemList.push(
        <Routine
          key={routine}
          rawName={routine}
          currentlySelected={true}
          setCurrentlySelected={setCurrentRoutine}
          name={schedule["routines"][routine]["officialName"]}
          schedule={schedule}
          setSchedule={setSchedule}
        ></Routine>,
      );
    } else {
      routinesElemList.push(
        <Routine
          key={routine}
          rawName={routine}
          name={schedule["routines"][routine]["officialName"]}
          schedule={schedule}
          setSchedule={setSchedule}
          currentlySelected={false}
          setCurrentlySelected={setCurrentRoutine}
        ></Routine>,
      );
    }
  }

  return (
    <div className="container mx-auto mt-10 flex flex-col justify-center px-3 sm:px-6 lg:p-8">
      <div className="mb-4 block rounded-lg border-2 border-wedgewood-300 bg-wedgewood-100 p-4 shadow-sm sm:hidden">
        <h3 className="text-base font-semibold text-wedgewood-900">
          Using a mobile device?
        </h3>
        <p className="text-sm text-wedgewood-800 mt-1">
          Download Scheduli on iOS or Android for the best experience.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 items-center justify-center">
          <a href="https://apps.apple.com/us/app/scheduli/id6470429917?platform=iphone">
            <Image
              src={appleBadge}
              alt="Download on the App Store"
              height={40}
            ></Image>
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.scheduli.schedulimobile">
            <Image
              src={googlePlayBadge}
              alt="Get it on Google Play"
              height={60}
            ></Image>
          </a>
        </div>
      </div>
      <ImportSchedule
        schedule={schedule}
        setSchedule={setSchedule}
        isOpen={isImportOpen}
        setIsOpen={setIsImportOpen}
        setCurrentRoutine={setCurrentRoutine}
        setScheduleStartDate={setScheduleStartDate}
        setScheduleEndDate={setScheduleEndDate}
        setScheduleName={setScheduleName}
      ></ImportSchedule>
      <div className="shadow-lg lg:p-10 bg-wedgewood-200 border-wedgewood-300 border-2 p-4 sm:p-6 rounded-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="font-bold text-2xl sm:text-3xl">
            General Information
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="border-2 border-wedgewood-400 bg-wedgewood-300 px-3 py-2 sm:px-4 sm:py-3 rounded-md flex items-center gap-2 hover:bg-wedgewood-400 transition-colors"
              onClick={() => setIsImportOpen(true)}
            >
              <FontAwesomeIcon icon={faFileImport}></FontAwesomeIcon>
              <span className="text-sm sm:text-base">Import</span>
            </button>

            {schedule ? (
              <button
                className="border-2 border-wedgewood-400 bg-wedgewood-300 px-3 py-2 sm:px-4 sm:py-3 rounded-md flex items-center gap-2 hover:bg-wedgewood-400 transition-colors"
                onClick={() => {
                  const icsContent = generateICSFile(schedule);
                  const blob = new Blob([icsContent], {
                    type: "text/calendar",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${schedule.about.name.replace(
                    /\s+/g,
                    "_"
                  )}.ics`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
              >
                <FontAwesomeIcon icon={faFileExport}></FontAwesomeIcon>
                <span className="text-sm sm:text-base">Export .ics</span>
              </button>
            ) : (
              <></>
            )}

            <button
              className="border-2 border-red-400 bg-red-300 px-3 py-2 sm:px-4 sm:py-3 rounded-md flex items-center gap-2 hover:bg-red-400 transition-colors"
              onClick={() =>
                reset(
                  setSchedule,
                  setCurrentRoutine,
                  setScheduleName,
                  setScheduleStartDate,
                  setScheduleEndDate
                )
              }
            >
              <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
              <span className="text-sm sm:text-base">Reset Schedule</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div>
            <label className="text-base sm:text-lg font-semibold block">
              Name
            </label>
            <input
              className="mt-2 w-full rounded-sm shadow-sm outline-hidden border-2 border-wedgewood-500 focus:border-wedgewood-600 p-3 bg-wedgewood-200"
              value={scheduleName}
              onChange={(e) => {
                updateAbout("name", e.target.value, schedule, setSchedule);
                setScheduleName(e.target.value);
              }}
              maxLength={32}
            ></input>
          </div>

          <div>
            <label className="text-base sm:text-lg font-semibold block">
              Start Date
            </label>
            <input
              type="date"
              className="mt-2 w-full rounded-sm shadow-sm outline-hidden border-2 border-wedgewood-500 focus:border-wedgewood-600 p-3 bg-wedgewood-200"
              value={scheduleStartDate}
              onChange={(e) => {
                updateAbout("startDate", e.target.value, schedule, setSchedule);
                setScheduleStartDate(e.target.value);
              }}
            ></input>
          </div>

          <div>
            <label className="text-base sm:text-lg font-semibold block">
              End Date
            </label>
            <input
              type="date"
              className="mt-2 w-full rounded-sm shadow-sm outline-hidden border-2 border-wedgewood-500 focus:border-wedgewood-600 p-3 bg-wedgewood-200"
              value={scheduleEndDate}
              onChange={(e) => {
                updateAbout("endDate", e.target.value, schedule, setSchedule);
                setScheduleEndDate(e.target.value);
              }}
            ></input>
          </div>
        </div>

        <InactiveDayEditor schedule={schedule} setSchedule={setSchedule}></InactiveDayEditor>
      </div>

      <section className="mt-4 bg-wedgewood-200 border-wedgewood-300 border-2 rounded-lg">
        <div className="shadow-lg p-4 sm:p-6 lg:p-10" ref={routines}>
          <div className="flex flex-row justify-between mb-4 sm:mb-6">
            <h2 className="font-bold text-2xl sm:text-3xl">Routines</h2>
          </div>

          <div className="flex flex-wrap items-center lg:p-6 p-4 border-2 border-wedgewood-300 bg-wedgewood-100 rounded-lg shadow-xl mt-4 lg:mt-10 gap-3 sm:gap-4">
            {routinesElemList}

            <button
              className="bg-wedgewood-400 p-3 px-4 rounded-sm hover:bg-wedgewood-500 transition-colors"
              onClick={() => createNewRoutine(schedule, setSchedule)}
            >
              <FontAwesomeIcon icon={faPlus} className=""></FontAwesomeIcon>
              {/* <h4 className="hidden lg:inline lg:ml-4">Create Routine</h4> */}
            </button>
          </div>
        </div>

        <hr className="border-wedgewood-400"></hr>

        <EventEditor
          currentRoutine={currentRoutine}
          schedule={schedule}
          setSchedule={setSchedule}
        ></EventEditor>
      </section>
    </div>
  );
}
