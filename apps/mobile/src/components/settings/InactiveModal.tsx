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

import TextModal from "./TextModal";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledTouchableOpacity = styled(TouchableOpacity);

function arraysAreEqual<T, U>(arr1: Array<T> | T, arr2: Array<U> | U): boolean {
  if (!Array.isArray(arr1)) arr1 = [arr1];
  if (!Array.isArray(arr2)) arr2 = [arr2];

  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

function formatDateToYYYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function editSingleDate(
  oldDate: Date,
  newDate: Date,
  scheduleDB: UnparsedSchedule,
  description: string,
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  setDate: React.Dispatch<React.SetStateAction<Date>>,
) {
  const newSchedule = { ...scheduleDB };
  const index = newSchedule["about"]["inactiveDays"].findIndex((item) => {
    if (Array.isArray(item.days)) {
      return item.days.includes(formatDateToYYYYMMDD(oldDate));
    } else {
      return item.days === formatDateToYYYYMMDD(oldDate);
    }
  });

  let duplicateIndex = newSchedule["about"]["inactiveDays"].findIndex((item) => {
    if (Array.isArray(item.days)) {
      return item.days.includes(formatDateToYYYYMMDD(newDate));
    } else {
      return item.days === formatDateToYYYYMMDD(newDate);
    }
  });

  if (duplicateIndex != -1 && duplicateIndex != index) {
    return Alert.alert("Error", "Can't add duplicate inactive days.");
  }

  newSchedule["about"]["inactiveDays"][index] = {
    description: description,
    days: formatDateToYYYYMMDD(newDate),
  };

  setScheduleDB(newSchedule);
  setDate(newDate);

  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

function editDateRange(
  oldInactiveDay: UnparsedDay | UnparsedDay[],
  newInactiveDay: UnparsedDay | UnparsedDay[],
  scheduleDB: UnparsedSchedule,
  description: string,
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
) {
  const newSchedule = { ...scheduleDB };
  const newDayIndex = newSchedule["about"]["inactiveDays"].findIndex((item) =>
    arraysAreEqual(item["days"], newInactiveDay),
  );
  const oldDayIndex = newSchedule["about"]["inactiveDays"].findIndex((item) =>
    arraysAreEqual(item["days"], oldInactiveDay),
  );

  if (newDayIndex != -1 && newDayIndex != oldDayIndex) {
    return Alert.alert("Error", "Can't add duplicate inactive days.");
  }

  newSchedule["about"]["inactiveDays"][oldDayIndex] = {
    description: description,
    days: newInactiveDay,
  };

  setScheduleDB(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

function deleteEntry(
  inactiveDay: { description: string; days: UnparsedDay | UnparsedDay[] },
  scheduleDB: UnparsedSchedule,
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
) {
  const newSchedule = { ...scheduleDB };

  const index = newSchedule["about"]["inactiveDays"].indexOf(inactiveDay);

  newSchedule["about"]["inactiveDays"].splice(index, 1);

  setScheduleDB(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

function formatDate(date: Date | string | number) {
  return new Date(date).toLocaleDateString();
}

export default function InactiveModal(props: {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  date1: Date;
  setDate1: React.Dispatch<React.SetStateAction<Date>>;
  date2: Date;
  setDate2: React.Dispatch<React.SetStateAction<Date>>;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
  inactiveDay: { description: string; days: UnparsedDay | UnparsedDay[] };
}) {
  const [updatedName, setUpdatedName] = useState(props.inactiveDay["description"]);

  const [updatedDate, setUpdatedDate] = useState(props.date);
  const [updatedDate1, setUpdatedDate1] = useState(props.date1);
  const [updatedDate2, setUpdatedDate2] = useState(props.date2);

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);

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
          <StyledView className="flex flex-row items-center justify-between">
            {typeof props.inactiveDay["days"] == "string" ? (
              <StyledText className="font-poppinsBold text-xl text-center mb-4 text-wedgewood-950 dark:text-wedgewood-300">
                Edit Inactive Day
              </StyledText>
            ) : (
              <StyledText className="font-poppinsBold text-xl text-center mb-4 text-wedgewood-950 dark:text-wedgewood-300">
                Edit Inactive Date Range
              </StyledText>
            )}
            <StyledPressable
              accessible={true}
              accessibilityLabel="Delete Inactive Day"
              className="bg-red-400 rounded-md p-3 mb-4"
              onPress={() => {
                Alert.alert("Warning", "Are you sure you want to delete this inactive day?", [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      deleteEntry(props.inactiveDay, props.scheduleDB, props.setScheduleDB);
                    },
                  },
                ]);
              }}
            >
              <FontAwesomeIcon icon={faTrashCan} size={12}></FontAwesomeIcon>
            </StyledPressable>
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

          {typeof props.inactiveDay["days"] == "string" ? (
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
                date={props.date1}
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
                date={props.date2}
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
                className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-4 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600"
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
            className="mt-4 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => {
              if (typeof props.inactiveDay["days"] == "string") {
                if (props.date != updatedDate || props.inactiveDay["description"] != updatedName) {
                  editSingleDate(
                    props.date,
                    updatedDate,
                    props.scheduleDB,
                    updatedName,
                    props.setScheduleDB,
                    props.setDate,
                  );
                }
              } else {
                if (updatedDate1.getTime() >= updatedDate2.getTime()) {
                  setUpdatedDate1(props.date1);
                  setUpdatedDate2(props.date2);
                  return Alert.alert("Error", "End date must be after start date.");
                }

                if (
                  props.date1 != updatedDate1 ||
                  props.date2 != updatedDate2 ||
                  props.inactiveDay["description"] != updatedName
                ) {
                  editDateRange(
                    [formatDateToYYYYMMDD(props.date1), formatDateToYYYYMMDD(props.date2)],
                    [formatDateToYYYYMMDD(updatedDate1), formatDateToYYYYMMDD(updatedDate2)],
                    props.scheduleDB,
                    updatedName,
                    props.setScheduleDB,
                  );

                  setUpdatedDate1(updatedDate1);
                  setUpdatedDate2(updatedDate2);
                }
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
