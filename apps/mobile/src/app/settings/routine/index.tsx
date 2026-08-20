import { faAngleLeft, faAngleRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedSchedule } from "@scheduli/types";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { useColorScheme, Pressable, Text, View } from "react-native";

import AddRoutineModal from "@/src/components/settings/AddRoutineModal";
import Wrapper from "@/src/components/Wrapper";
import { useMMKVState } from "@/src/utils/hooks/useMMKVState";
import storage from "@/src/utils/storage";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export default function Routines() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  if (
    !storage.getString("currentSchedule") ||
    storage.getString("currentSchedule") == "undefined"
  ) {
    return (
      <Wrapper>
        <StyledView className="flex flex-row items-center justify-between">
          <StyledView className="flex flex-row items-center mb-4">
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
            <StyledText className="font-poppinsBold text-2xl ml-4 text-wedgewood-950 dark:text-wedgewood-300">
              Routines
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledText className="m-6 text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          It looks like you haven't set up a schedule yet.
        </StyledText>
      </Wrapper>
    );
  }

  let [scheduleDB, setScheduleDB] = useMMKVState<UnparsedSchedule>("currentSchedule", JSON.parse);
  let [addModalVisible, setAddModalVisible] = useState(false);

  let routineList = [];
  for (const routine in scheduleDB["routines"]) {
    routineList.push(
      <StyledPressable
        key={routine}
        className="p-4 shadow-lg bg-wedgewood-300 rounded mt-4 flex flex-row justify-between items-center border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
        onPress={() =>
          router.push({
            pathname: "/settings/routine/[routine]",
            params: { routine: routine },
          })
        }
        accessible={true}
        accessibilityLabel={`Edit ${scheduleDB["routines"][routine]["officialName"]} Routine`}
      >
        <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          {scheduleDB["routines"][routine]["officialName"]}
        </StyledText>
        <FontAwesomeIcon
          icon={faAngleRight}
          size={20}
          color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
        ></FontAwesomeIcon>
      </StyledPressable>,
    );
  }

  return (
    <Wrapper>
      <StyledView className="flex flex-row items-center justify-between">
        <StyledView className="flex flex-row items-center mb-4">
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
          <StyledText className="font-poppinsBold text-2xl ml-4 text-wedgewood-950 dark:text-wedgewood-300">
            Routines
          </StyledText>
        </StyledView>
        <StyledPressable
          accessible={true}
          accessibilityLabel="Add Routine"
          className="mb-4 bg-wedgewood-400 rounded-md p-3 border-2 border-wedgewood-500 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
          onPress={() => {
            setAddModalVisible(true);
          }}
        >
          <FontAwesomeIcon
            icon={faPlus}
            size={18}
            color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
          ></FontAwesomeIcon>
        </StyledPressable>
      </StyledView>

      <AddRoutineModal
        modalVisible={addModalVisible}
        setModalVisible={setAddModalVisible}
        scheduleDB={scheduleDB}
        setScheduleDB={setScheduleDB}
      ></AddRoutineModal>

      {routineList}

      <StyledView className="bg-wedgewood-300 p-5 mb-2 rounded border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 flex flex-col mt-12">
        <StyledText className="text-xl text-wedgewood-950 dark:text-wedgewood-300 font-poppinsBold">
          Customizing your Schedule
        </StyledText>

        <StyledView className="mt-2 flex flex-row flex-wrap items-center">
          <StyledText className="text-base text-wedgewood-950 dark:text-wedgewood-300 font-poppins mt-2">
            Create a new routine by pressing the
          </StyledText>
          <StyledView className="m-2 bg-wedgewood-400 rounded-md h-6 w-6 border-2 border-wedgewood-500 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex items-center justify-center">
            <FontAwesomeIcon
              icon={faPlus}
              size={12}
              color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
            ></FontAwesomeIcon>
          </StyledView>
          <StyledText className="text-base text-wedgewood-950 dark:text-wedgewood-300 font-poppins mt-2">
            button or edit an existing routine.
          </StyledText>
        </StyledView>
      </StyledView>
    </Wrapper>
  );
}
