import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedSchedule } from "@scheduli/types";
import { styled } from "nativewind";
import { useState } from "react";
import { useColorScheme, Pressable, Text, View } from "react-native";

import EventModal from "./EventModal";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

function formatDate(timestamp: number) {
  const date = new Date(timestamp); // Convert Unix timestamp to milliseconds
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return timeString;
}

function createCustomDate(inputTime: string) {
  const currentDate = new Date();

  const [inputHourRaw, inputMinuteRaw] = inputTime.split(":");
  const inputMinute = inputMinuteRaw.replace(/[A-Za-z]/g, ""); // Remove any non-numeric characters

  currentDate.setHours(parseInt(inputHourRaw), parseInt(inputMinute), 0, 0);
  return currentDate;
}

export default function Event(props: {
  rawPeriodName: string;
  name: string;
  startTime: string;
  endTime: string;
  currentRoutine: string;
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
  eventIndex: number;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const [startTime, setStartTime] = useState(createCustomDate(props.startTime));
  const [endTime, setEndTime] = useState(createCustomDate(props.endTime));
  const [name, setName] = useState(props.name);

  const colorScheme = useColorScheme();

  return (
    <>
      <EventModal
        currentRoutine={props.currentRoutine}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        scheduleDB={props.scheduleDB}
        setScheduleDB={props.setScheduleDB}
        eventIndex={props.eventIndex}
        name={name}
        setName={setName}
      ></EventModal>
      <StyledPressable
        className="rounded shadow-lg bg-wedgewood-300 p-4 border-2 border-wedgewood-400 mt-2 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
        onPress={() => {
          setModalVisible(true);
        }}
        accessible={true}
        accessibilityLabel={`Edit Event ${name}`}
      >
        <StyledView>
          <StyledText className="font-poppinsBold text-lg text-wedgewood-950 dark:text-wedgewood-300">
            {name}
          </StyledText>
          <StyledText className="text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
            {formatDate(startTime.getTime())} to {formatDate(endTime.getTime())}
          </StyledText>
        </StyledView>

        <FontAwesomeIcon
          icon={faPencil}
          size={16}
          color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
        ></FontAwesomeIcon>
      </StyledPressable>
    </>
  );
}
