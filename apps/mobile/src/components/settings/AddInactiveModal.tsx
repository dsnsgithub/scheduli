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

import TextModal from "./TextModal";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSwitch = styled(Switch);

function customDateSort(item: UnparsedDay | UnparsedDay[]) {
  if (Array.isArray(item)) {
    return new Date(item[0]).getTime();
  } else if (typeof item === "string") {
    return new Date(item).getTime();
  }
}

function arraysAreEqual<T, U>(arr1: Array<T> | T, arr2: Array<U> | U): boolean {
  if (!Array.isArray(arr1)) arr1 = [arr1];
  if (!Array.isArray(arr2)) arr2 = [arr2];

  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

function addEntry(
  inactiveDay: UnparsedDay | UnparsedDay[],
  description: string,
  scheduleDB: UnparsedSchedule,
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
) {
  const newSchedule = { ...scheduleDB };
  const index = newSchedule["about"]["inactiveDays"].findIndex((item) => {
    if (Array.isArray(item.days)) {
      return item.days.includes(inactiveDay as UnparsedDay);
    } else {
      return item.days === inactiveDay;
    }
  });

  if (index != -1) {
    return "duplicate";
  }

  if (typeof inactiveDay == "object") {
    let newIndex = newSchedule["about"]["inactiveDays"].findIndex((item) => {
      return arraysAreEqual(item["days"] as UnparsedDay[], inactiveDay);
    });

    if (newIndex != -1) {
      return "duplicate";
    }
  }

  newSchedule["about"]["inactiveDays"].push({
    description: description,
    days: inactiveDay,
  });

  newSchedule["about"]["inactiveDays"].sort(
    (a, b) => customDateSort(a["days"]) - customDateSort(b["days"]),
  );

  storage.set("currentSchedule", JSON.stringify(newSchedule));
  setScheduleDB(newSchedule);
}

function formatDate(date: Date | string | number) {
  return new Date(date).toLocaleDateString();
}

function formatDateToYYYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AddInactiveModal(props: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
}) {
  const [updatedDate, setUpdatedDate] = useState(new Date());
  const [updatedName, setUpdatedName] = useState("New Inactive Day");
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date(new Date().getTime() + 86400000));

  const [nameModalVisible, setNameModalVisible] = useState(false);
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
            Add Inactive Day
          </StyledText>

          <StyledView className="flex flex-row items-center justify-center shadow-lg bg-wedgewood-300 rounded p-3 dark:bg-wedgewood-950 dark:border-wedgewood-600 border-2 border-wedgewood-400">
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
            ></StyledSwitch>
          </StyledView>

          <TextModal
            modalName={`Inactive Day Name`}
            modalVisible={nameModalVisible}
            setModalVisible={setNameModalVisible}
            defaultValue={updatedName}
            onSubmit={(newValue) => {
              if (newValue == "") {
                return Alert.alert("Error", "Inactive days must have a name.");
              }
              setUpdatedName(newValue);
            }}
          ></TextModal>

          <StyledPressable
            accessible={true}
            accessibilityLabel="Edit Name"
            className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-4 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => setNameModalVisible(true)}
          >
            <StyledText>
              <StyledText className="text-xl font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                Name:{" "}
              </StyledText>
              <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                {" "}
                {updatedName}{" "}
              </StyledText>
            </StyledText>
            <FontAwesomeIcon
              icon={faPencil}
              size={16}
              color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
            ></FontAwesomeIcon>
          </StyledPressable>

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
          )}
          <StyledPressable
            accessible={true}
            accessibilityLabel="Finish"
            className="mt-3 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => {
              let result;
              if (isEnabled) {
                if (date1.getTime() >= date2.getTime()) {
                  return Alert.alert("Error", "End date must be after start date.");
                }
                result = addEntry(
                  [formatDateToYYYYMMDD(date1), formatDateToYYYYMMDD(date2)],
                  updatedName,
                  props.scheduleDB,
                  props.setScheduleDB,
                );
              } else {
                result = addEntry(
                  formatDateToYYYYMMDD(updatedDate),
                  updatedName,
                  props.scheduleDB,
                  props.setScheduleDB,
                );
              }

              if (result == "duplicate") {
                return Alert.alert("Error", "Can't add duplicate inactive days.");
              } else {
                props.setModalVisible(false);
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
  );
}
