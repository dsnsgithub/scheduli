//? Credit to https://github.com/SalikSayyed/react-native-picker-weekday
//? Original code: https://github.com/SalikSayyed/react-native-picker-weekday/blob/main/src/index.tsx

import { UnparsedDay, UnparsedSchedule } from "@scheduli/types";
import { styled } from "nativewind";
import { Alert, Text, TouchableOpacity, View } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

function isElementInDayArrays(inputArray: Array<UnparsedDay>, scheduleDB: UnparsedSchedule) {
  // Extract the day arrays from the data object
  const dayArrays = Object.values(scheduleDB.routines)
    .map((routine) => routine.days)
    .flat();

  // Iterate through the inputArray and dayArrays to check for common elements
  for (const element of inputArray) {
    for (const dayArray of dayArrays) {
      if (Array.isArray(dayArray)) {
        // If dayArray is an array, check if element is in it
        if (dayArray.includes(element)) {
          return true; // Found a match, return true
        }
      } else {
        // If dayArray is not an array, convert it to an array and check for a match
        if (element === dayArray) {
          return true; // Found a match, return true
        }
      }
    }
  }

  // No match found, return false
  return false;
}

export default function DayPicker(props: {
  weekdays: (UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[];
  setWeekdays: React.Dispatch<
    React.SetStateAction<(UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[]>
  >;
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
}) {
  function daysIO(v: number) {
    if (props.weekdays.includes(v)) {
      const weekdayRemoved = props.weekdays.filter((element) => element !== v);
      props.setWeekdays(weekdayRemoved);
    } else {
      if (isElementInDayArrays([v], props.scheduleDB)) {
        Alert.alert("Error", "There is already a routine which has the same active day.");
      } else {
        props.setWeekdays([...props.weekdays, v]);
      }
    }
  }

  const days = ["S", "M", "T", "W", "Th", "F", "S"];
  const daysMeaning = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <StyledView className="flex flex-row flex-wrap items-center justify-center border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 dark:bg-wedgewood-950 dark:border-wedgewood-600 mt-2 py-4">
      {days.map((value, index) => {
        if (!props.weekdays.includes(index)) {
          return (
            <StyledTouchableOpacity
              accessible={true}
              accessibilityLabel={`Toggle ${daysMeaning[index]} to ON`}
              key={index}
              className="rounded-md p-2 border-2 border-wedgewood-400 bg-wedgewood-300 dark:bg-wedgewood-950 dark:border-wedgewood-800 w-10 h-10 mx-1 mt-2"
              onPress={() => daysIO(index)}
            >
              <StyledText className="dark:text-wedgewood-500 text-center">{value}</StyledText>
            </StyledTouchableOpacity>
          );
        } else {
          return (
            <StyledTouchableOpacity
              key={index}
              accessible={true}
              accessibilityLabel={`Toggle ${daysMeaning[index]} to OFF`}
              className="p-2 rounded-md border-2 border-wedgewood-600 bg-wedgewood-500 dark:border-wedgewood-400 dark:bg-wedgewood-600 w-10 h-10 mx-1 mt-2"
              onPress={() => daysIO(index)}
            >
              <StyledText className="dark:text-wedgewood-100 text-center">{value}</StyledText>
            </StyledTouchableOpacity>
          );
        }
      })}
    </StyledView>
  );
}
