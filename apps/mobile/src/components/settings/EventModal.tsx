import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedEvent, UnparsedSchedule } from "@scheduli/types";
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

function formatDate(timestamp: number) {
  const date = new Date(timestamp); // Convert Unix timestamp to milliseconds
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return timeString;
}

function sortByStartTime(array: UnparsedEvent[]) {
  return array.sort((a, b) => {
    const startTimeA = a.startTime.split(":").map(Number);
    const startTimeB = b.startTime.split(":").map(Number);

    if (startTimeA[0] !== startTimeB[0]) {
      return startTimeA[0] - startTimeB[0]; // Sort by hour
    } else {
      return startTimeA[1] - startTimeB[1]; // If hours are the same, sort by minute
    }
  });
}

function createCustomDateString(timestamp: number) {
  const date = new Date(timestamp); // Convert Unix timestamp to milliseconds
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
  return timeString;
}

function createCustomTime(inputTime: string) {
  const currentDate = new Date();

  const [inputHourRaw, inputMinuteRaw] = inputTime.split(":");
  const inputMinute = inputMinuteRaw.replace(/[A-Za-z]/g, ""); // Remove any non-numeric characters

  currentDate.setHours(parseInt(inputHourRaw), parseInt(inputMinute), 0, 0);
  return currentDate.getTime();
}

function areEventsValid(events: UnparsedEvent[]) {
  if (events.length <= 1) {
    return true; // Single event is always valid
  }

  for (let i = 0; i < events.length; i++) {
    const currentEvent = events[i];

    const startTime = createCustomTime(currentEvent.startTime);
    const endTime = createCustomTime(currentEvent.endTime);

    if (startTime >= endTime) {
      return false; // End time is not after start time
    }

    if (i < events.length - 1) {
      // Check for event overlap
      const nextEvent = events[i + 1];
      const nextStartTime = createCustomTime(nextEvent.startTime);

      if (endTime > nextStartTime) {
        return false; // Events overlap
      }
    }
  }

  return true; // All events are valid
}

function modifyEvent(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  currentRoutine: string,
  eventIndex: number,
  property: string,
  newValue: string,
) {
  const newSchedule = { ...schedule };

  newSchedule["routines"][currentRoutine]["events"][eventIndex][property] = newValue;
  setSchedule(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

function modifyEventTimes(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  currentRoutine: string,
  eventIndex: number,
  newStartTime: string,
  newEndTime: string,
) {
  const newSchedule = JSON.parse(JSON.stringify(schedule)) as UnparsedSchedule;

  newSchedule["routines"][currentRoutine]["events"][eventIndex]["startTime"] = newStartTime;
  newSchedule["routines"][currentRoutine]["events"][eventIndex]["endTime"] = newEndTime;

  newSchedule["routines"][currentRoutine]["events"] = sortByStartTime(
    newSchedule["routines"][currentRoutine]["events"],
  );

  if (!areEventsValid(newSchedule["routines"][currentRoutine]["events"])) {
    return Alert.alert(
      "Error",
      "This event overlaps with another event or has an invalid start/end time.",
    );
  }

  setSchedule(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

function removeEvent(
  currentRoutine: string,
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  eventIndex: number,
) {
  if (schedule["routines"][currentRoutine]["events"].length <= 1) {
    return Alert.alert("Error", "A routine must have at least one event.");
  }

  const newSchedule = { ...schedule };
  newSchedule["routines"][currentRoutine]["events"].splice(eventIndex, 1);

  setSchedule(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

function checkRemovedPeriods(period: string) {
  if (!storage.getString("removedPeriods")) return false;

  const removedPeriodNames = JSON.parse(storage.getString("removedPeriods") || "");
  return removedPeriodNames.includes(period);
}

export default function EventModal(props: {
  currentRoutine: string;
  startTime: Date;
  setStartTime: React.Dispatch<React.SetStateAction<Date>>;
  endTime: Date;
  setEndTime: React.Dispatch<React.SetStateAction<Date>>;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
  eventIndex: number;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);

  const colorScheme = useColorScheme();

  const [updatedStartTime, setUpdatedStartTime] = useState(props.startTime);
  const [updatedEndTime, setUpdatedEndTime] = useState(props.endTime);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
      onDismiss={() => {
        setUpdatedStartTime(props.startTime);
        setUpdatedEndTime(props.endTime);

        props.setModalVisible(false);
      }}
      onRequestClose={() => {
        setUpdatedStartTime(props.startTime);
        setUpdatedEndTime(props.endTime);

        props.setModalVisible(false);
      }}
    >
      <StyledTouchableOpacity
        accessible={false}
        className="fixed inset-0 flex w-full h-full items-center justify-center p-4 bg-black/60"
        onPress={() => {
          setUpdatedStartTime(props.startTime);
          setUpdatedEndTime(props.endTime);

          props.setModalVisible(false);
        }}
      >
        <StyledView className="bg-wedgewood-100 dark:bg-gray-950 dark:border-wedgewood-600 border-2 border-wedgewood-600 w-full p-5 rounded-xl">
          <StyledView className="flex flex-row items-center justify-between">
            <StyledText className="font-poppinsBold text-xl text-center mb-4 text-wedgewood-950 dark:text-wedgewood-300">
              Edit Event Times
            </StyledText>

            <StyledPressable
              accessible={true}
              accessibilityLabel="Delete Event"
              className="bg-red-400 rounded-md p-3 mb-4"
              onPress={() => {
                Alert.alert("Warning", "Are you sure you want to delete this event?", [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      if (
                        storage.getString("removedPeriods") &&
                        storage.getString("removedPeriods") != "undefined" &&
                        storage.getString("periodNames") &&
                        storage.getString("periodNames") != "undefined"
                      ) {
                        if (
                          Object.keys(JSON.parse(storage.getString("periodNames"))).length - 1 <=
                          Object.keys(JSON.parse(storage.getString("removedPeriods"))).length
                        ) {
                          if (
                            !checkRemovedPeriods(
                              props.scheduleDB["routines"][props.currentRoutine]["events"][
                                props.eventIndex
                              ]["name"],
                            )
                          ) {
                            return Alert.alert("Error", "You must have one visible event.");
                          }
                        }
                      }

                      if (
                        checkRemovedPeriods(
                          props.scheduleDB["routines"][props.currentRoutine]["events"][
                            props.eventIndex
                          ]["name"],
                        )
                      ) {
                        const newRemovedPeriods = [
                          ...JSON.parse(storage.getString("removedPeriods")),
                        ];
                        newRemovedPeriods.splice(
                          JSON.parse(storage.getString("removedPeriods")).indexOf(
                            props.scheduleDB["routines"][props.currentRoutine]["events"][
                              props.eventIndex
                            ]["name"],
                          ),
                          1,
                        );

                        storage.set("removedPeriods", JSON.stringify(newRemovedPeriods));
                      }

                      removeEvent(
                        props.currentRoutine,
                        props.scheduleDB,
                        props.setScheduleDB,
                        props.eventIndex,
                      );
                    },
                  },
                ]);
              }}
            >
              <FontAwesomeIcon icon={faTrashCan} size={12}></FontAwesomeIcon>
            </StyledPressable>
          </StyledView>

          <TextModal
            defaultValue={props.name}
            modalName="Event Name"
            modalVisible={nameModalVisible}
            setModalVisible={setNameModalVisible}
            onSubmit={(updatedText) => {
              props.setName(updatedText);
              modifyEvent(
                props.scheduleDB,
                props.setScheduleDB,
                props.currentRoutine,
                props.eventIndex,
                "name",
                updatedText,
              );
            }}
          ></TextModal>

          <DateTimePickerModal
            isVisible={startModalVisible}
            date={updatedStartTime}
            onConfirm={(time) => {
              setStartModalVisible(false);

              if (time.getTime() >= updatedEndTime.getTime()) {
                setUpdatedEndTime(new Date(time.getTime() + 60000));
              }

              setUpdatedStartTime(time);
            }}
            onCancel={() => {
              setStartModalVisible(false);
            }}
            mode="time"
          ></DateTimePickerModal>

          <DateTimePickerModal
            isVisible={endModalVisible}
            date={updatedEndTime}
            onConfirm={(time) => {
              setEndModalVisible(false);

              if (updatedStartTime.getTime() >= time.getTime()) {
                setUpdatedStartTime(new Date(time.getTime() - 60000));
              }

              setUpdatedEndTime(time);
            }}
            onCancel={() => {
              setEndModalVisible(false);
            }}
            mode="time"
          ></DateTimePickerModal>

          <StyledPressable
            accessible={true}
            accessibilityLabel="Edit Name"
            className="border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-3 flex flex-row items-center justify-between active:bg-wedgewood-500 dark:active:bg-wedgewood-800 dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => setNameModalVisible(true)}
          >
            <StyledText>
              <StyledText className="text-lg font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                Name:
              </StyledText>
              <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                {" "}
                {props.name}{" "}
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
            accessibilityLabel="Edit Start Time"
            className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-3 flex flex-row items-center justify-between active:bg-wedgewood-500 dark:active:bg-wedgewood-800 dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => setStartModalVisible(true)}
          >
            <StyledText>
              <StyledText className="text-lg font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                Start Time:
              </StyledText>
              <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                {" "}
                {formatDate(updatedStartTime.getTime())}{" "}
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
            accessibilityLabel="Edit End Time"
            className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-3 flex flex-row items-center justify-between active:bg-wedgewood-500 dark:active:bg-wedgewood-800 dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => setEndModalVisible(true)}
          >
            <StyledText>
              <StyledText className="text-lg font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                End Time:
              </StyledText>
              <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                {" "}
                {formatDate(updatedEndTime.getTime())}{" "}
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
            accessibilityLabel="Finish"
            className="mt-4 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => {
              if (updatedStartTime.getTime() >= updatedEndTime.getTime()) {
                return Alert.alert("Error", "End time must be after start time.");
              }

              props.setStartTime(updatedStartTime);
              props.setEndTime(updatedEndTime);

              modifyEventTimes(
                props.scheduleDB,
                props.setScheduleDB,
                props.currentRoutine,
                props.eventIndex,
                createCustomDateString(updatedStartTime.getTime()),
                createCustomDateString(updatedEndTime.getTime()),
              );

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
