import { ParsedDay } from "@scheduli/types";
import { styled } from "nativewind";
import { JSX, useEffect, useState } from "react";
import { Text, View } from "react-native";

import UpcomingEventCard from "@/src/components/index/UpcomingEventCard";
import { daysUntil, formatDate, parseUserDate } from "@/src/utils/date";
import parseScheduleDB from "@/src/utils/parseScheduleDB";
import storage from "@/src/utils/storage";

const StyledView = styled(View);
const StyledText = styled(Text);

export default function Upcoming() {
  if (
    !storage.getString("currentSchedule") ||
    storage.getString("currentSchedule") === "undefined"
  ) {
    return (
      <StyledView className="p-4 pb-32">
        <StyledView className="flex flex-row items-center justify-between">
          <StyledView className="flex flex-row items-center mb-4">
            <StyledText className="font-poppinsBold text-2xl ml-4 text-wedgewood-950 dark:text-wedgewood-300">
              Upcoming Events
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledText className="m-6 text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          It looks like you haven't set up a schedule yet.
        </StyledText>
      </StyledView>
    );
  }

  const scheduleDB = parseScheduleDB(JSON.parse(storage.getString("currentSchedule")!));
  const specialEvents: [number, JSX.Element][] = [];

  const [currentDate, setCurrentDate] = useState(new Date().getTime());
  useEffect(() => {
    const id = setInterval(() => {
      if (new Date().getTime() !== currentDate) {
        setCurrentDate(new Date().getTime());
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Inactive days
  for (const item of scheduleDB["about"]["inactiveDays"]) {
    let [startDate, endDate] = item["days"] as ParsedDay[];

    if (typeof item["days"] === "object") {
      if (currentDate >= parseUserDate(startDate).getTime()) continue;

      const dUntil = daysUntil(parseUserDate(startDate));
      specialEvents.push([
        parseUserDate(startDate).getTime(),
        <UpcomingEventCard
          key={`${item["description"]}-${dUntil}`}
          title={item["description"]}
          subtitle={`${formatDate(parseUserDate(startDate))} to ${formatDate(parseUserDate(endDate))}`}
          daysUntil={dUntil}
        />,
      ]);
    } else {
      if (currentDate >= parseUserDate(item["days"]).getTime()) continue;

      const dUntil = daysUntil(parseUserDate(item["days"]));
      specialEvents.push([
        parseUserDate(item["days"]).getTime(),
        <UpcomingEventCard
          key={`${item["description"]}-${dUntil}`}
          title={item["description"]}
          subtitle={formatDate(parseUserDate(item["days"]))}
          daysUntil={dUntil}
        />,
      ]);
    }
  }

  // Routine special days
  for (const routine in scheduleDB["routines"]) {
    const item = scheduleDB["routines"][routine];
    for (const day of item["days"]) {
      if (typeof day === "string") {
        if (currentDate >= parseUserDate(day).getTime()) continue;

        const dUntil = daysUntil(parseUserDate(day));
        specialEvents.push([
          parseUserDate(day).getTime(),
          <UpcomingEventCard
            key={`${item["officialName"]}-${dUntil}`}
            title={item["officialName"]}
            subtitle={formatDate(parseUserDate(day))}
            daysUntil={dUntil}
            pressable={false}
          />,
        ]);
      }
    }
  }

  specialEvents.sort((a, b) => a[0] - b[0]);

  return (
    <StyledView className="p-4 pb-32">
      <StyledText className="font-poppinsBold text-2xl mb-2 text-center text-wedgewood-950 dark:text-wedgewood-300">
        Inactive Days
      </StyledText>

      {specialEvents.length ? (
        specialEvents.map(([, el]) => el)
      ) : (
        <StyledText className="text-wedgewood-950 dark:text-wedgewood-300 font-poppins text-lg mt-4 p-2">
          No upcoming special/important events.
        </StyledText>
      )}
    </StyledView>
  );
}
