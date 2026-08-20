import { ParsedEvent } from "@scheduli/types";
import { FlexWidget, ImageWidget, TextWidget } from "react-native-android-widget";

import ScheduleIcon from "@/assets/dynamic/scheduleicon";
import findCorrectSchedule from "@/src/utils/findCorrectSchedule";
import parseScheduleDB from "@/src/utils/parseScheduleDB";
import storage from "@/src/utils/storage";

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

  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  } else if (minutes === 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  } else {
    return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
}

function percentageThrough(currentTime: number, startTime: number, endTime: number) {
  return 1 - (endTime - currentTime) / (endTime - startTime);
}

function Countdown(props: { scheduleTimes: ParsedEvent[]; currentDate: Date }) {
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
      if (nextPeriod) {
        return (
          <Status
            percentage={percentageThrough(currentTime, period["startTime"], period["endTime"])}
            time={`${timeBetweenDates(currentTime, nextPeriod["startTime"])}`}
            timeRange={`${formatDate(period["startTime"])} to ${formatDate(period["endTime"])}`}
            eventName={`Until ${nextPeriod["periodName"]}`}
          ></Status>
        );
      } else {
        return (
          <Status
            percentage={percentageThrough(currentTime, period["startTime"], period["endTime"])}
            time={`${timeBetweenDates(currentTime, period["endTime"])}`}
            timeRange={`${formatDate(period["startTime"])} to ${formatDate(period["endTime"])}`}
            eventName={`End of ${period["periodName"]}`}
          ></Status>
        );
      }
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

function Status(props: { time: string; eventName: string; timeRange: string; percentage: number }) {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {props.time ? (
        <TextWidget text={props.time} style={{ fontSize: 26, fontWeight: "bold" }}></TextWidget>
      ) : (
        <FlexWidget></FlexWidget>
      )}
      {props.eventName ? (
        <TextWidget text={props.eventName} style={{ fontSize: 20 }}></TextWidget>
      ) : (
        <FlexWidget></FlexWidget>
      )}
      {props.timeRange ? (
        <TextWidget text={props.timeRange} style={{ fontSize: 15 }}></TextWidget>
      ) : (
        <FlexWidget></FlexWidget>
      )}
    </FlexWidget>
  );
}

export function StatusWidget(props: { currentDate: Date }) {
  if (
    !storage.getString("currentSchedule") ||
    storage.getString("currentSchedule") == "undefined"
  ) {
    return (
      <FlexWidget
        clickAction="MY_ACTION"
        clickActionData={{ id: 0 }}
        style={{
          height: "match_parent",
          width: "match_parent",
          backgroundColor: "#bfe0e2",
          borderStyle: "solid",
          borderColor: "#5faab1",
          borderRadius: 16,
          padding: 10,
          borderWidth: 4,
        }}
      >
        <FlexWidget
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "match_parent",
          }}
        >
          <ImageWidget
            image={ScheduleIcon(new Date().getDate())}
            imageWidth={40}
            imageHeight={40}
          />
          <TextWidget
            text="You have no schedule set up."
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: "#000000",
              marginLeft: 5,
            }}
          />
        </FlexWidget>
      </FlexWidget>
    );
  }

  const scheduleDB = parseScheduleDB(JSON.parse(storage.getString("currentSchedule")));
  const correctScheduleName = findCorrectSchedule(scheduleDB, new Date());

  if (findCorrectSchedule(scheduleDB, new Date()) == null) {
    return (
      <FlexWidget
        clickAction="MY_ACTION"
        clickActionData={{ id: 0 }}
        style={{
          height: "match_parent",
          width: "match_parent",
          backgroundColor: "#bfe0e2",
          borderStyle: "solid",
          borderColor: "#5faab1",
          borderRadius: 16,
          padding: 10,
          borderWidth: 4,
        }}
      >
        <FlexWidget
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "match_parent",
          }}
        >
          <ImageWidget
            image={ScheduleIcon(new Date().getDate())}
            imageWidth={40}
            imageHeight={40}
          />
          <TextWidget
            text="No events today."
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: "#000000",
              marginLeft: 5,
            }}
          />
        </FlexWidget>
      </FlexWidget>
    );
  }

  const scheduleTimes = scheduleDB["routines"][correctScheduleName]?.["events"];

  return (
    <FlexWidget
      clickAction="MY_ACTION"
      clickActionData={{ id: 0 }}
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#bfe0e2",
        borderStyle: "solid",
        borderColor: "#5faab1",
        borderRadius: 16,
        padding: 10,
        borderWidth: 4,
      }}
    >
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "match_parent",
        }}
      >
        <ImageWidget image={ScheduleIcon(new Date().getDate())} imageWidth={40} imageHeight={40} />
        <TextWidget
          text={`${scheduleDB["routines"][correctScheduleName]["officialName"]} Schedule`}
          style={{
            fontWeight: "bold",
            fontSize: 16,
            color: "#000000",
            marginLeft: 5,
          }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
          padding: 8,
          borderRadius: 16,
          width: "match_parent",
          backgroundColor: "#92cace",
          marginTop: 15,
        }}
      >
        <Countdown scheduleTimes={scheduleTimes} currentDate={props.currentDate}></Countdown>
      </FlexWidget>

      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "match_parent",
          height: 20,
          marginTop: 10,
        }}
      >
        <TextWidget
          text={`${props.currentDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}  - Tap to Refresh`}
          style={{
            fontWeight: "bold",
            fontSize: 16,
            color: "#000000",
            marginLeft: 5,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
