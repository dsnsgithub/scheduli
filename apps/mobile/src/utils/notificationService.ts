import notifee, { AndroidForegroundServiceType } from "@notifee/react-native";

import findCorrectSchedule from "./findCorrectSchedule";
import parseScheduleDB from "./parseScheduleDB";
import storage from "./storage";

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

async function displayFormattedNotification(props: {
  time: string;
  eventName: string;
  timeRange: string;
  percentage: number;
  channelID: string;
}) {
  await notifee.displayNotification({
    id: "timer",
    title: `${props.time} - ${props.eventName}`,
    body: `${props.timeRange}`,
    android: {
      smallIcon: "ic_scheduli_notification",
      channelId: props.channelID,
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: "default",
      },
      progress: {
        max: 100,
        current: props.percentage * 100,
        indeterminate: false,
      },
      asForegroundService: true,
      foregroundServiceTypes: [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SPECIAL_USE],
      onlyAlertOnce: true,
    },
  });
}

export default async function notificationService() {
  let lastNotification = false;
  if (!storage.getString("currentSchedule") || storage.getString("currentSchedule") == "undefined")
    return;

  const persistentChannelID = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    vibration: false,
    badge: false,
  });

  const timer = setInterval(async () => {
    if (storage.getString("notificationEnabled") == "false") {
      await notifee.stopForegroundService();

      return clearInterval(timer);
    }

    const scheduleDB = parseScheduleDB(JSON.parse(storage.getString("currentSchedule")));

    const currentDate = new Date();
    const currentTime = currentDate.getTime();

    // Check if there are any special events tomorrow, and send notification if there are
    const tomorrow = new Date();
    tomorrow.setDate(currentDate.getDate() + 1);
    tomorrow.setHours(0);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    tomorrow.setMilliseconds(0);

    const correctScheduleName = findCorrectSchedule(scheduleDB, currentDate);
    if (correctScheduleName == null) {
      if (lastNotification) return;
      lastNotification = true;
      return await notifee.displayNotification({
        id: "timer",
        title: `No events today.`,
        body: "",
        android: {
          smallIcon: "ic_scheduli_notification",
          channelId: persistentChannelID,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: "default",
          },
          asForegroundService: true,
          foregroundServiceTypes: [
            AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
          ],
          onlyAlertOnce: true,
        },
      });
    }

    const scheduleTimes = scheduleDB["routines"][correctScheduleName]["events"];

    // School hasn't started
    if (scheduleTimes[0]["startTime"] > currentTime) {
      const timeTil = timeBetweenDates(currentTime, scheduleTimes[0]["startTime"]);

      lastNotification = false;
      return displayFormattedNotification({
        time: timeTil,
        timeRange: `${formatDate(scheduleTimes[0]["startTime"])} to ${formatDate(scheduleTimes[0]["endTime"])}`,
        eventName: `Start of ${scheduleTimes[0]["periodName"]}`,
        percentage: 0,
        channelID: persistentChannelID,
      });
    }

    // School is over
    if (scheduleTimes[scheduleTimes.length - 1]["endTime"] < currentTime) {
      if (lastNotification) return;
      lastNotification = true;
      return await notifee.displayNotification({
        id: "timer",
        title: `All events are over.`,
        body: "",
        android: {
          smallIcon: "ic_scheduli_notification",
          channelId: persistentChannelID,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: "default",
          },
          asForegroundService: true,
          foregroundServiceTypes: [
            AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
          ],
          onlyAlertOnce: true,
        },
      });
    }

    lastNotification = false;

    for (const [periodIndex, period] of scheduleTimes.entries()) {
      const nextPeriod = scheduleTimes[periodIndex + 1];

      if (period["startTime"] <= currentTime && period["endTime"] >= currentTime) {
        if (nextPeriod) {
          return displayFormattedNotification({
            time: `${timeBetweenDates(currentTime, nextPeriod["startTime"])}`,
            timeRange: `${formatDate(period["startTime"])} to ${formatDate(period["endTime"])}`,
            eventName: `Until ${nextPeriod["periodName"]}`,
            percentage: percentageThrough(currentTime, period["startTime"], period["endTime"]),
            channelID: persistentChannelID,
          });
        } else {
          return displayFormattedNotification({
            time: `${timeBetweenDates(currentTime, period["endTime"])}`,
            timeRange: `${formatDate(period["startTime"])} to ${formatDate(period["endTime"])}`,
            eventName: `End of ${period["periodName"]}`,
            percentage: percentageThrough(currentTime, period["startTime"], period["endTime"]),
            channelID: persistentChannelID,
          });
        }
      }

      // if there is a break in the schedule
      if (nextPeriod && period["endTime"] < currentTime && nextPeriod["startTime"] > currentTime) {
        return displayFormattedNotification({
          time: `${timeBetweenDates(currentTime, nextPeriod["startTime"])}`,
          timeRange: `${formatDate(nextPeriod["startTime"])} to ${formatDate(nextPeriod["endTime"])}`,
          eventName: `Start of ${nextPeriod["periodName"]}`,
          percentage: percentageThrough(currentTime, period["endTime"], nextPeriod["startTime"]),
          channelID: persistentChannelID,
        });
      }
    }
  }, 1000);
}
