import React from "react";
import Status from "./Status";

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

  let hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
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

// @ts-ignore
export default function Countdown(props: { scheduleTimes }) {
  let scheduleTimes = props.scheduleTimes;
  const [currentTime, setCurrentTime] = React.useState(new Date().getTime());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // School has not started yet
  if (scheduleTimes[0]["startTime"] > currentTime) {
    const timeTil = timeBetweenDates(
      currentTime,
      scheduleTimes[0]["startTime"],
    );

    return (
      <Status
        time={timeTil}
        timeRange=""
        className={`Until ${scheduleTimes[0]["periodName"]}`}
      ></Status>
    );
  }

  // School is over
  if (scheduleTimes[scheduleTimes.length - 1]["endTime"] < currentTime) {
    return (
      <Status time="" timeRange="" className="All events are over!"></Status>
    );
  }

  for (let periodIndex in scheduleTimes) {
    // @ts-ignore
    periodIndex = Number(periodIndex);
    const period = scheduleTimes[periodIndex];
    const nextPeriod = scheduleTimes[periodIndex + 1];

    if (
      period["startTime"] <= currentTime &&
      period["endTime"] >= currentTime
    ) {
      if (nextPeriod) {
        return (
          <Status
            time={`${timeBetweenDates(currentTime, nextPeriod["startTime"])}`}
            timeRange={`${formatDate(period["startTime"])} to ${formatDate(period["endTime"])}`}
            className={`Until ${nextPeriod["periodName"]}`}
          ></Status>
        );
      } else {
        return (
          <Status
            time={`${timeBetweenDates(currentTime, period["endTime"])}`}
            timeRange={`${formatDate(period["startTime"])} to ${formatDate(period["endTime"])}`}
            className={`End of ${period["periodName"]}`}
          ></Status>
        );
      }
    }

    // if there is a break in the schedule
    if (
      nextPeriod &&
      period["endTime"] < currentTime &&
      nextPeriod["startTime"] > currentTime
    ) {
      return (
        <Status
          time={`${timeBetweenDates(currentTime, nextPeriod["startTime"])}`}
          timeRange={`${formatDate(nextPeriod["startTime"])} to ${formatDate(nextPeriod["endTime"])}`}
          className={`Until ${nextPeriod["periodName"]}`}
        ></Status>
      );
    }
  }
}
