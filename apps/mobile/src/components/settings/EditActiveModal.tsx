import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedDay, UnparsedSchedule } from "@scheduli/types";
import { styled } from "nativewind";
import { useState } from "react";
import {
  Alert,
  useColorScheme,
  Modal,
  Pressable,
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

function editActiveDay(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  currentRoutine: string,
  weekdays: (UnparsedDay | UnparsedDay[] | [UnparsedDay, UnparsedDay])[],
  setWeekdays: React.Dispatch<
    React.SetStateAction<(UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[]>
  >,
  activeDay: UnparsedDay | UnparsedDay[],
  date: Date | Date[],
) {
  const newSchedule = { ...schedule };

  let index;
  if (typeof activeDay == "string") {
    let newIndex = weekdays.indexOf(formatDateToYYYYMMDD(date as Date));
    if (newIndex != -1) {
      return Alert.alert("Error", "Can't add duplicate active days!");
    }
    index = weekdays.indexOf(activeDay);

    newSchedule["routines"][currentRoutine]["days"][index] = formatDateToYYYYMMDD(date as Date);
  } else {
    let newIndex = weekdays.findIndex((item) => arraysAreEqual(item, date));

    if (newIndex != -1) {
      return Alert.alert("Error", "Can't add duplicate active days!");
    }

    index = weekdays.findIndex((item) => arraysAreEqual(item, activeDay));

    newSchedule["routines"][currentRoutine]["days"][index] = [
      formatDateToYYYYMMDD(date[0]),
      formatDateToYYYYMMDD(date[1]),
    ];
  }

  newSchedule["routines"][currentRoutine]["days"].sort(
    (a, b) => customDateSort(a) - customDateSort(b),
  );
  setWeekdays(newSchedule["routines"][currentRoutine]["days"]);

  setSchedule(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

function deleteActiveDay(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  currentRoutine: string,
  weekdays: (UnparsedDay | UnparsedDay[] | [UnparsedDay, UnparsedDay])[],
  setWeekdays: React.Dispatch<
    React.SetStateAction<(UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[]>
  >,
  activeDay: UnparsedDay | UnparsedDay[],
) {
  const newSchedule = { ...schedule };

  const index = weekdays.indexOf(activeDay);

  newSchedule["routines"][currentRoutine]["days"].splice(index, 1);

  setWeekdays(newSchedule["routines"][currentRoutine]["days"]);

  setSchedule(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString();
}

function parseUserDate(dateString: string | number | Date) {
  // Create a new Date object from the input date string
  const userDate = new Date(dateString);

  // Get the user's timezone offset in minutes
  const userTimezoneOffset = userDate.getTimezoneOffset();

  // Calculate the user's actual timezone offset in milliseconds
  const userTimezoneOffsetMs = userTimezoneOffset * 60000;

  // Adjust the Date object to represent the date in the user's timezone
  const userTimezoneDate = new Date(userDate.getTime() + userTimezoneOffsetMs);

  return userTimezoneDate;
}

export default function EditActiveDayModal(props: {
  weekdays: (UnparsedDay | UnparsedDay[] | [UnparsedDay, UnparsedDay])[];
  setWeekdays: React.Dispatch<
    React.SetStateAction<(UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[]>
  >;
  currentRoutine: string;
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
  activeDay: UnparsedDay | UnparsedDay[];
}) {
  const [updatedDate, setUpdatedDate] = useState(parseUserDate(props.activeDay as UnparsedDay));

  const [updatedDate1, setUpdatedDate1] = useState(parseUserDate(props.activeDay[0]));
  const [updatedDate2, setUpdatedDate2] = useState(parseUserDate(props.activeDay[1]));

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const colorScheme = useColorScheme();

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
        }}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <StyledTouchableOpacity
          accessible={false}
          className="fixed inset-0 flex w-full h-full items-center justify-center p-4 bg-black/60"
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <StyledView className="bg-wedgewood-100 dark:bg-gray-950 dark:border-wedgewood-600 border-2 border-wedgewood-600 w-full p-5 rounded-xl">
            <StyledView className="flex flex-row items-center justify-between">
              <StyledText className="font-poppinsBold text-xl text-center mb-4 text-wedgewood-950 dark:text-wedgewood-300">
                Edit Special Active Day
              </StyledText>

              <StyledPressable
                accessible={true}
                accessibilityLabel="Delete Active Day"
                className="bg-red-400 rounded-md p-3 mb-4"
                onPress={() => {
                  Alert.alert("Warning", "Are you sure you want to delete this active day?", [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      onPress: () => {
                        deleteActiveDay(
                          props.scheduleDB,
                          props.setScheduleDB,
                          props.currentRoutine,
                          props.weekdays,
                          props.setWeekdays,
                          props.activeDay,
                        );
                      },
                    },
                  ]);
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} size={18}></FontAwesomeIcon>
              </StyledPressable>
            </StyledView>

            {typeof props.activeDay == "string" ? (
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
                  accessible={true}
                  accessibilityLabel="Edit Date"
                  className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-4 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600"
                  onPress={() => setDateModalVisible(true)}
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
            ) : (
              <>
                <DateTimePickerModal
                  isVisible={startModalVisible}
                  date={updatedDate1}
                  onConfirm={(date) => {
                    setStartModalVisible(false);
                    setUpdatedDate1(date);
                  }}
                  onCancel={() => {
                    setStartModalVisible(false);
                  }}
                  mode="date"
                  display="inline"
                ></DateTimePickerModal>

                <DateTimePickerModal
                  isVisible={endModalVisible}
                  date={updatedDate2}
                  onConfirm={(date) => {
                    setEndModalVisible(false);
                    setUpdatedDate2(date);
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
                      {formatDate(updatedDate1)}{" "}
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
                  className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-4 flex flex-row items-center justify-between"
                  onPress={() => setEndModalVisible(true)}
                >
                  <StyledText>
                    <StyledText className="text-xl font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                      End Date:{" "}
                    </StyledText>
                    <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                      {" "}
                      {formatDate(updatedDate2)}{" "}
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
                setModalVisible(false);

                if (typeof props.activeDay == "string") {
                  if (parseUserDate(props.activeDay).getTime() != updatedDate.getTime()) {
                    editActiveDay(
                      props.scheduleDB,
                      props.setScheduleDB,
                      props.currentRoutine,
                      props.weekdays,
                      props.setWeekdays,
                      props.activeDay,
                      updatedDate,
                    );
                  }
                } else {
                  if (updatedDate1.getTime() >= updatedDate2.getTime()) {
                    setUpdatedDate1(parseUserDate(props.activeDay[0]));
                    setUpdatedDate2(parseUserDate(props.activeDay[1]));
                    return Alert.alert("Error", "End date must be after start date.");
                  }

                  if (
                    parseUserDate(props.activeDay[0]).getTime() != updatedDate1.getTime() ||
                    parseUserDate(props.activeDay[1]).getTime() != updatedDate2.getTime()
                  ) {
                    editActiveDay(
                      props.scheduleDB,
                      props.setScheduleDB,
                      props.currentRoutine,
                      props.weekdays,
                      props.setWeekdays,
                      props.activeDay,
                      [updatedDate1, updatedDate2],
                    );
                  }
                }
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

      <StyledPressable
        className="rounded shadow-lg bg-wedgewood-400 p-3 border-2 border-wedgewood-500 m-1 dark:bg-wedgewood-950 dark:border-wedgewood-600"
        onPress={() => setModalVisible(true)}
        accessible={true}
        accessibilityLabel={`Edit Active Day - ${
          typeof props.activeDay == "string"
            ? formatDate(updatedDate)
            : `${formatDate(updatedDate1)} to ${formatDate(updatedDate2)}`
        }`}
      >
        <StyledView className="flex flex-row items-center justify-stretch">
          <StyledText className="mr-2 text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
            {typeof props.activeDay == "string"
              ? formatDate(updatedDate)
              : `${formatDate(updatedDate1)} to ${formatDate(updatedDate2)}`}
          </StyledText>
          <FontAwesomeIcon
            icon={faPencil}
            size={14}
            color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
          ></FontAwesomeIcon>
        </StyledView>
      </StyledPressable>
    </>
  );
}
