import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedDay, UnparsedSchedule } from "@scheduli/types";
import { styled } from "nativewind";
import { useState } from "react";
import { Text, Pressable, useColorScheme, View } from "react-native";

import InactiveModal from "./InactiveModal";

const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledView = styled(View);

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString();
}

function parseUserDate(dateString: string | number | Date) {
  const userDate = new Date(dateString);

  const userTimezoneOffset = userDate.getTimezoneOffset();

  const userTimezoneOffsetMs = userTimezoneOffset * 60000;

  const userTimezoneDate = new Date(userDate.getTime() + userTimezoneOffsetMs);

  return userTimezoneDate;
}

export default function InactiveDayElem(props: {
  inactiveDay: { description: string; days: UnparsedDay | UnparsedDay[] };
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const [date, setDate] = useState(parseUserDate(props.inactiveDay["days"] as UnparsedDay));

  const [date1, setDate1] = useState(parseUserDate(props.inactiveDay["days"][0]));
  const [date2, setDate2] = useState(parseUserDate(props.inactiveDay["days"][1]));

  const colorScheme = useColorScheme();

  if (typeof props.inactiveDay["days"] == "object") {
    return (
      <>
        <InactiveModal
          date={date}
          setDate={setDate}
          date1={date1}
          setDate1={setDate1}
          date2={date2}
          setDate2={setDate2}
          inactiveDay={props.inactiveDay}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          scheduleDB={props.scheduleDB}
          setScheduleDB={props.setScheduleDB}
        ></InactiveModal>

        <StyledPressable
          accessible={true}
          accessibilityLabel={`Edit Inactive Date Range - ${props.inactiveDay["description"]}`}
          className="rounded shadow-lg bg-wedgewood-300 p-4 border-2 border-wedgewood-400 mt-2 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
          onPress={() => setModalVisible(true)}
        >
          <StyledView>
            <StyledText className="text-wedgewood-950 dark:text-wedgewood-300 text-lg font-poppinsBold">
              {props.inactiveDay["description"]}
            </StyledText>
            <StyledText className="text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
              {formatDate(date1)} to {formatDate(date2)}
            </StyledText>
          </StyledView>
          <FontAwesomeIcon
            icon={faPencil}
            color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
          ></FontAwesomeIcon>
        </StyledPressable>
      </>
    );
  } else {
    return (
      <>
        <InactiveModal
          date={date}
          setDate={setDate}
          date1={date1}
          setDate1={setDate1}
          date2={date2}
          setDate2={setDate2}
          inactiveDay={props.inactiveDay}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          scheduleDB={props.scheduleDB}
          setScheduleDB={props.setScheduleDB}
        ></InactiveModal>

        <StyledPressable
          accessible={true}
          accessibilityLabel={`Edit Inactive Date - ${props.inactiveDay["description"]}`}
          className="rounded shadow-lg bg-wedgewood-300 p-4 border-2 border-wedgewood-400 mt-2 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
          onPress={() => setModalVisible(true)}
        >
          <StyledView>
            <StyledText className="text-wedgewood-950 dark:text-wedgewood-300 text-lg font-poppinsBold">
              {props.inactiveDay["description"]}
            </StyledText>
            <StyledText className="text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
              {formatDate(date)}
            </StyledText>
          </StyledView>

          <FontAwesomeIcon
            icon={faPencil}
            color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
          ></FontAwesomeIcon>
        </StyledPressable>
      </>
    );
  }
}
