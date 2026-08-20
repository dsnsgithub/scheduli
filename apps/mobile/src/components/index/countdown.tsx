import { ParsedEvent } from "@scheduli/types";

import Status from "./status";

function formatDate(timestamp: number) {
  const date = new Date(timestamp); // Convert Unix timestamp to milliseconds
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return timeString;
}

function timeBetweenDates(firstDate: number, secondDate: number) {
  const timeDifference = secondDate - firstDate;

  let hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  let secondString = String(seconds);
  let minuteString = String(minutes);
  if (seconds < 10) secondString = `0${seconds}`;
  if (minutes < 10) minuteString = `0${minutes}`;
  if (!hours) {
    return `${minuteString}:${secondString}`;
  }

  return `${hours}:${minuteString}:${secondString}`;
}

function percentageThrough(currentTime: number, startTime: number, endTime: number) {
  return 1 - (endTime - currentTime) / (endTime - startTime);
}

export default function Countdown(props: { scheduleTimes: ParsedEvent[]; currentDate: Date }) {
  let scheduleTimes = props.scheduleTimes;
  const currentTime = props.currentDate.getTime();

  // School hasn't started
  if (scheduleTimes[0]["startTime"] > currentTime) {
    const timeTil = timeBetweenDates(currentTime, scheduleTimes[0]["startTime"]);

    return (
      <Status
        percentage={0}
        time={timeTil}
        timeRange={`${formatDate(scheduleTimes[0]["startTime"])} to ${formatDate(scheduleTimes[0]["endTime"])}`}
        eventName={`Start of ${scheduleTimes[0]["periodName"]}`}
      ></Status>
    );
  }

  // School is over
  if (scheduleTimes[scheduleTimes.length - 1]["endTime"] < currentTime) {
    return <Status time="" timeRange="" eventName="All events are over!" percentage={0}></Status>;
  }

  for (const [periodIndex, period] of scheduleTimes.entries()) {
    const nextPeriod = scheduleTimes[periodIndex + 1];

    if (period["startTime"] <= currentTime && period["endTime"] >= currentTime) {
      return (
        <Status
          percentage={percentageThrough(currentTime, period["startTime"], period["endTime"])}
          time={`${timeBetweenDates(currentTime, period["endTime"])}`}
          timeRange={`${formatDate(period["startTime"])} to ${formatDate(period["endTime"])}`}
          eventName={`End of ${period["periodName"]}`}
        ></Status>
      );
    }

    // if there is a break in the schedule
    if (nextPeriod && period["endTime"] < currentTime && nextPeriod["startTime"] > currentTime) {
      return (
        <Status
          time={`${timeBetweenDates(currentTime, nextPeriod["startTime"])}`}
          percentage={percentageThrough(currentTime, period["endTime"], nextPeriod["startTime"])}
          timeRange={`${formatDate(nextPeriod["startTime"])} to ${formatDate(nextPeriod["endTime"])}`}
          eventName={`Start of ${nextPeriod["periodName"]}`}
        ></Status>
      );
    }
  }
}
