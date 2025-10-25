import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

export default function Feedback() {
  const [contactEmail, setContactEmail] = React.useState("");
  const [linkToSchedule, setLinkToSchedule] = React.useState("");
  const [additionalInformation, setAdditionalInformation] = React.useState("");

  return (
    <div className="container mx-auto mt-10">
      <div className="shadow-xl flex flex-col items-center bg-wedgewood-200 border-wedgewood-300 border-2 p-8">
        <h1 className="text-4xl font-bold mb-8">Feedback - Request Schedule</h1>

        <div className="flex flex-row items-center">
          <h3 className="text-2xl font-bold">Contact Email:</h3>
          <input
            className="rounded shadow outline-none border-2 border-wedgewood-500 focus:border-wedgewood-600 p-3 md:ml-4 bg-wedgewood-300 w-full"
            // @ts-ignore
            value={contactEmail}
            onChange={(e) => {
              setContactEmail(e.target.value);
            }}
          ></input>
        </div>

        <div className="flex flex-row items-center mt-4">
          <h3 className="text-2xl font-bold">Schedule Link (PDF/Website):</h3>
          <input
            className="rounded shadow outline-none border-2 border-wedgewood-500 focus:border-wedgewood-600 p-3 md:ml-4 bg-wedgewood-300 w-full"
            // @ts-ignore
            value={linkToSchedule}
            onChange={(e) => {
              setLinkToSchedule(e.target.value);
            }}
          ></input>
        </div>

        <div className="mt-4">
          <h3 className="text-2xl font-bold text-center">
            Additional Information:
          </h3>
          <textarea
            className="rounded shadow outline-none border-2 border-wedgewood-500 focus:border-wedgewood-600 p-2 md:ml-4 bg-wedgewood-300 resize"
            rows={5}
            cols={60}
            // @ts-ignore
            value={additionalInformation}
            onChange={(e) => {
              setAdditionalInformation(e.target.value);
            }}
          ></textarea>
        </div>

        <button
          className="mt-4 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-black"
          onClick={async () => {
            await fetch("/api/feedback", {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify({
                email: contactEmail,
                scheduleLink: linkToSchedule,
                additionalInformation: additionalInformation,
              }),
            });

            alert(`Submitted feedback.`);
          }}
        >
          <h3 className="mr-2 font-bold text-center dark:text-wedgewood-300">
            Finish
          </h3>
          <FontAwesomeIcon icon={faPencil} size="lg"></FontAwesomeIcon>
        </button>
      </div>
    </div>
  );
}
