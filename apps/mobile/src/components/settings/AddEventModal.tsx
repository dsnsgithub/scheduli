import { faPencil } from "@fortawesome/free-solid-svg-icons";
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

function createCustomDate(timestamp: number) {
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

function addEvent(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  currentRoutine: string,
  name: string,
  startTime: string,
  endTime: string,
) {
  const newSchedule: UnparsedSchedule = JSON.parse(JSON.stringify(schedule));

  newSchedule["routines"][currentRoutine]["events"].push({
    rawPeriodName: name,
    name: name,
    startTime: startTime,
    endTime: endTime,
  });

  newSchedule["routines"][currentRoutine]["events"] = sortByStartTime(
    newSchedule["routines"][currentRoutine]["events"],
  );

  if (!areEventsValid(newSchedule["routines"][currentRoutine]["events"])) {
    return Alert.alert(
      "Error",
      "This event overlaps with another event or has an invalid start/end time.",
    );
  } else {
    setSchedule(newSchedule);
    storage.set("currentSchedule", JSON.stringify(newSchedule));
  }
}

export default function AddEventModal(props: {
  currentRoutine: string;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
}) {
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 3600 * 1000));

  const [name, setName] = useState("New Event!!!");

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
            Add Event
          </StyledText>

          <TextModal
            defaultValue={name}
            modalName="Event Name"
            modalVisible={nameModalVisible}
            setModalVisible={setNameModalVisible}
            onSubmit={(updatedText) => {
              setName(updatedText);
            }}
          ></TextModal>

          <DateTimePickerModal
            isVisible={startModalVisible}
            date={startTime}
            onConfirm={(time) => {
              setStartModalVisible(false);

              if (time.getTime() >= endTime.getTime()) {
                setEndTime(new Date(time.getTime() + 60000));
              }

              setStartTime(time);
            }}
            onCancel={() => {
              setStartModalVisible(false);
            }}
            mode="time"
          ></DateTimePickerModal>

          <DateTimePickerModal
            isVisible={endModalVisible}
            date={endTime}
            onConfirm={(time) => {
              setEndModalVisible(false);

              if (startTime.getTime() >= time.getTime()) {
                setStartTime(new Date(time.getTime() - 60000));
              }

              setEndTime(time);
            }}
            onCancel={() => {
              setEndModalVisible(false);
            }}
            mode="time"
          ></DateTimePickerModal>

          <StyledPressable
            accessible={true}
            accessibilityLabel="Edit Name"
            className="border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-3 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => setNameModalVisible(true)}
          >
            <StyledText>
              <StyledText className="text-lg font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                Name:
              </StyledText>
              <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                {" "}
                {name}{" "}
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
            className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-3 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => setStartModalVisible(true)}
          >
            <StyledText>
              <StyledText className="text-lg font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                Start Time:
              </StyledText>
              <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                {" "}
                {formatDate(startTime.getTime())}{" "}
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
            className="mt-2 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-3 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => setEndModalVisible(true)}
          >
            <StyledText>
              <StyledText className="text-lg font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                End Time:
              </StyledText>
              <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                {" "}
                {formatDate(endTime.getTime())}{" "}
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
            className="mt-3 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => {
              addEvent(
                props.scheduleDB,
                props.setScheduleDB,
                props.currentRoutine,
                name,
                createCustomDate(startTime.getTime()),
                createCustomDate(endTime.getTime()),
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
