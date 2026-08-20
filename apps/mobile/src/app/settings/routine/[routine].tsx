import { faAngleLeft, faPencil, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedDay, UnparsedSchedule } from "@scheduli/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { useColorScheme, Pressable, Text, View } from "react-native";

import AddEventModal from "@/src/components/settings/AddEventModal";
import DayPicker from "@/src/components/settings/DayPicker";
import EditRoutineModal from "@/src/components/settings/EditRoutineModal";
import Event from "@/src/components/settings/Event";
import Wrapper from "@/src/components/Wrapper";
import { useMMKVState } from "@/src/utils/hooks/useMMKVState";
import storage from "@/src/utils/storage";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export default function Routine() {
  let { routine } = useLocalSearchParams();
  if (typeof routine != "string") return;
  routine = decodeURIComponent(routine);

  const router = useRouter();
  const colorScheme = useColorScheme();

  let [scheduleDB, setScheduleDB] = useMMKVState<UnparsedSchedule>("currentSchedule", JSON.parse);
  let [addModalVisible, setAddModalVisible] = useState(false);
  let [editModalVisible, setEditModalVisible] = useState(false);

  const [weekdays, setWeekdays] = useState(scheduleDB["routines"]?.[routine]?.["days"]);

  if (!scheduleDB["routines"]?.[routine]) return <></>;

  let eventElemList = [];
  for (const index in scheduleDB["routines"][routine]["events"]) {
    const { rawPeriodName, startTime, endTime, name } =
      scheduleDB["routines"][routine]["events"][index];
    eventElemList.push(
      <Event
        key={startTime}
        currentRoutine={routine}
        startTime={startTime}
        rawPeriodName={rawPeriodName}
        endTime={endTime}
        name={name}
        eventIndex={Number(index)}
        scheduleDB={scheduleDB}
        setScheduleDB={setScheduleDB}
      ></Event>,
    );
  }

  return (
    <Wrapper>
      <StyledView className="flex flex-row flex-wrap items-center justify-between">
        <StyledView className="flex flex-row items-center">
          <StyledPressable
            hitSlop={50}
            onPress={() => router.back()}
            accessible={true}
            accessibilityLabel="Back"
          >
            <FontAwesomeIcon
              icon={faAngleLeft}
              size={30}
              color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
            ></FontAwesomeIcon>
          </StyledPressable>

          <StyledText className="font-poppinsBold text-xl ml-4 text-wedgewood-950 dark:text-wedgewood-300 whitespace-nowrap overflow-hidden text-ellipsis">
            {scheduleDB["routines"][routine]["officialName"]}
          </StyledText>
        </StyledView>

        <StyledPressable
          accessible={true}
          accessibilityLabel="Edit Routine Properties"
          className=" mt-2 bg-wedgewood-400 rounded-md p-3 border-2 border-wedgewood-500 dark:bg-wedgewood-950 dark:border-wedgewood-600"
          onPress={() => {
            setEditModalVisible(true);
          }}
        >
          <FontAwesomeIcon
            icon={faPencil}
            size={18}
            color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
          ></FontAwesomeIcon>
        </StyledPressable>
      </StyledView>

      <EditRoutineModal
        weekdays={weekdays}
        setWeekdays={setWeekdays}
        currentRoutine={routine}
        scheduleDB={scheduleDB}
        setScheduleDB={setScheduleDB}
        modalVisible={editModalVisible}
        setModalVisible={setEditModalVisible}
      ></EditRoutineModal>

      <AddEventModal
        currentRoutine={routine}
        scheduleDB={scheduleDB}
        setScheduleDB={setScheduleDB}
        modalVisible={addModalVisible}
        setModalVisible={setAddModalVisible}
      ></AddEventModal>

      <DayPicker
        scheduleDB={scheduleDB}
        setScheduleDB={setScheduleDB}
        weekdays={weekdays}
        setWeekdays={(weekdays) => {
          setWeekdays(weekdays);

          const newSchedule = { ...scheduleDB } as UnparsedSchedule;

          newSchedule["routines"][routine]["days"] = weekdays as (
            | UnparsedDay
            | [UnparsedDay, UnparsedDay]
            | UnparsedDay[]
          )[];

          setScheduleDB(newSchedule);
          storage.set("currentSchedule", JSON.stringify(newSchedule));
        }}
      ></DayPicker>

      {eventElemList}

      <StyledPressable
        accessible={true}
        accessibilityLabel="Add Event"
        className="mt-4 bg-wedgewood-400 rounded-md p-3 border-2 border-wedgewood-500 dark:bg-wedgewood-950 dark:border-wedgewood-600"
        onPress={() => {
          setAddModalVisible(true);
        }}
      >
        <StyledView className="flex flex-row items-center justify-center">
          <FontAwesomeIcon
            icon={faPlus}
            size={18}
            color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
          ></FontAwesomeIcon>
          <StyledText className="ml-3 text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
            Add Event
          </StyledText>
        </StyledView>
      </StyledPressable>
    </Wrapper>
  );
}
