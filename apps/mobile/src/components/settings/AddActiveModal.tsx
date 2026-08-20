import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedDay, UnparsedSchedule } from "@scheduli/types";
import { styled } from "nativewind";
import { useState } from "react";
import {
  Alert,
  useColorScheme,
  Modal,
  Pressable,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import storage from "@/src/utils/storage";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSwitch = styled(Switch);

function formatDateToYYYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function customDateSort(item: UnparsedDay | UnparsedDay[]) {
  if (Array.isArray(item)) {
    // For date ranges, use the first date as the sorting key
    return new Date(item[0]).getTime();
  } else if (typeof item === "string") {
    // For individual dates, use the date itself as the sorting key
    return new Date(item).getTime();
  }
}

function arraysAreEqual<T, U>(arr1: Array<T> | T, arr2: Array<U> | U): boolean {
  if (!Array.isArray(arr1)) arr1 = [arr1];
  if (!Array.isArray(arr2)) arr2 = [arr2];

  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

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

function addActiveDay(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  currentRoutine: string,
  weekdays: (UnparsedDay | UnparsedDay[] | [UnparsedDay, UnparsedDay])[],
  setWeekdays: React.Dispatch<
    React.SetStateAction<(UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[]>
  >,
  value: Date | Date[],
  type: string,
) {
  const newSchedule = { ...schedule };
  const copyWeekdays = [...weekdays];

  if (type == "date") {
    if (copyWeekdays.indexOf(formatDateToYYYYMMDD(value as Date)) != -1) {
      return Alert.alert("Error", "Can't add duplicate active days!");
    }

    if (isElementInDayArrays([formatDateToYYYYMMDD(value as Date)], schedule)) {
      return Alert.alert("Error", "There is already a routine which has the same active day.");
    }

    copyWeekdays.push(formatDateToYYYYMMDD(value as Date));
  } else {
    let newIndex = newSchedule["routines"][currentRoutine]["days"].findIndex((item) =>
      arraysAreEqual(item, value as Date[]),
    );

    if (newIndex != -1) {
      return Alert.alert("Error", "Can't add duplicate active days!");
    }

    if (
      isElementInDayArrays(
        [formatDateToYYYYMMDD(value[0]), formatDateToYYYYMMDD(value[1])],
        schedule,
      )
    ) {
      return Alert.alert("Error", "There is already a routine which has the same active day.");
    }
    copyWeekdays.push([formatDateToYYYYMMDD(value[0]), formatDateToYYYYMMDD(value[1])]);
  }

  newSchedule["routines"][currentRoutine]["days"] = copyWeekdays;
  newSchedule["routines"][currentRoutine]["days"].sort(
    (a, b) => customDateSort(a) - customDateSort(b),
  );

  setWeekdays(copyWeekdays);

  setSchedule(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString();
}

export default function AddActiveModal(props: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  currentRoutine: string;
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
  weekdays: (UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[];
  setWeekdays: React.Dispatch<
    React.SetStateAction<(UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[]>
  >;
}) {
  const [updatedDate, setUpdatedDate] = useState(new Date());
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date(new Date().getTime() + 86400000));

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const colorScheme = useColorScheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
      onDismiss={() => {
        props.setModalVisible(false);
      }}
      onRequestClose={() => {
        props.setModalVisible(false);
      }}
    >
      <StyledTouchableOpacity
        accessible={false}
        className="fixed inset-0 flex w-full h-full items-center justify-center p-4 bg-black/60"
        onPress={() => {
          props.setModalVisible(false);
        }}
      >
        <StyledView className="bg-wedgewood-100 dark:bg-gray-950 dark:border-wedgewood-600 border-2 border-wedgewood-600 w-full p-5 rounded-xl">
          <StyledText className="font-poppinsBold text-xl text-center mb-4 text-wedgewood-950 dark:text-wedgewood-300">
            Add Special Active Day
          </StyledText>

          <StyledView className="flex flex-row items-center justify-center shadow-lg bg-wedgewood-300 rounded p-3 border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600">
            {isEnabled ? (
              <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                Date Range
              </StyledText>
            ) : (
              <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                Date
              </StyledText>
            )}
            <StyledSwitch
              className="ml-4"
              onValueChange={toggleSwitch}
              value={isEnabled}
              thumbColor="#ddeff0"
              trackColor={{ false: "#bfe0e2", true: "#3b757f" }}
              id="toggleDateRange"
            ></StyledSwitch>
          </StyledView>

          {isEnabled ? (
            <>
              <DateTimePickerModal
                isVisible={startModalVisible}
                date={date1}
                onConfirm={(date) => {
                  setStartModalVisible(false);
                  setDate1(date);
                }}
                onCancel={() => {
                  setStartModalVisible(false);
                }}
                mode="date"
                display="inline"
              ></DateTimePickerModal>

              <DateTimePickerModal
                isVisible={endModalVisible}
                date={date2}
                onConfirm={(date) => {
                  setEndModalVisible(false);
                  setDate2(date);
                }}
                onCancel={() => {
                  setEndModalVisible(false);
                }}
                mode="date"
                display="inline"
              ></DateTimePickerModal>

              <StyledPressable
                accessible={true}
                accessibilityLabel="Edit Start Date"
                className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-4 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600"
                onPress={() => setStartModalVisible(true)}
              >
                <StyledText>
                  <StyledText className="text-xl font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                    Start Date:{" "}
                  </StyledText>
                  <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                    {" "}
                    {formatDate(date1)}{" "}
                  </StyledText>
                </StyledText>
                <FontAwesomeIcon
                  icon={faPencil}
                  size={16}
                  color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
                ></FontAwesomeIcon>
              </StyledPressable>

              <StyledPressable
                accessible={true}
                accessibilityLabel="Edit End Date"
                className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-4 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600"
                onPress={() => setEndModalVisible(true)}
              >
                <StyledText>
                  <StyledText className="text-xl font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                    End Date:{" "}
                  </StyledText>
                  <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                    {" "}
                    {formatDate(date2)}{" "}
                  </StyledText>
                </StyledText>
                <FontAwesomeIcon
                  icon={faPencil}
                  size={16}
                  color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
                ></FontAwesomeIcon>
              </StyledPressable>
            </>
          ) : (
            <>
              <DateTimePickerModal
                isVisible={dateModalVisible}
                date={updatedDate}
                onConfirm={(date) => {
                  setDateModalVisible(false);
                  setUpdatedDate(date);
                }}
                onCancel={() => {
                  setDateModalVisible(false);
                }}
                mode="date"
                display="inline"
              ></DateTimePickerModal>

              <StyledPressable
                className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-4 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600"
                onPress={() => setDateModalVisible(true)}
                accessible={true}
                accessibilityLabel="Edit Date"
              >
                <StyledText>
                  <StyledText className="text-xl font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                    Date:{" "}
                  </StyledText>
                  <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                    {" "}
                    {formatDate(updatedDate)}{" "}
                  </StyledText>
                </StyledText>
                <FontAwesomeIcon
                  icon={faPencil}
                  size={16}
                  color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
                ></FontAwesomeIcon>
              </StyledPressable>
            </>
          )}
          <StyledPressable
            accessible={true}
            accessibilityLabel="Finish"
            className="mt-3 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => {
              if (isEnabled) {
                if (date1.getTime() >= date2.getTime()) {
                  return Alert.alert("Error", "End date must be after start date.");
                }
                addActiveDay(
                  props.scheduleDB,
                  props.setScheduleDB,
                  props.currentRoutine,
                  props.weekdays,
                  props.setWeekdays,
                  [date1, date2],
                  "array",
                );
              } else {
                addActiveDay(
                  props.scheduleDB,
                  props.setScheduleDB,
                  props.currentRoutine,
                  props.weekdays,
                  props.setWeekdays,
                  updatedDate,
                  "date",
                );
              }

              props.setModalVisible(false);
            }}
          >
            <StyledText className="mr-2 font-poppinsBold text-center text-wedgewood-950 dark:text-wedgewood-300">
              Finish
            </StyledText>
            <FontAwesomeIcon
              icon={faPencil}
              size={12}
              color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
            ></FontAwesomeIcon>
          </StyledPressable>
        </StyledView>
      </StyledTouchableOpacity>
    </Modal>
  );
}
