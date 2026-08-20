import { faAngleLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedSchedule } from "@scheduli/types";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { useColorScheme, Pressable, Text, View } from "react-native";

import AddInactiveModal from "@/src/components/settings/AddInactiveModal";
import InactiveDayElem from "@/src/components/settings/InactiveDay";
import Wrapper from "@/src/components/Wrapper";
import storage from "@/src/utils/storage";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export default function InactiveDays() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  if (
    !storage.getString("currentSchedule") ||
    storage.getString("currentSchedule") == "undefined"
  ) {
    return (
      <StyledView className="bg-wedgewood-100 dark:bg-black flex-1 py-14">
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
              Inactive Days
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledText className="m-6 text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          It looks like you haven't set up a schedule yet.
        </StyledText>
      </StyledView>
    );
  }

  let [scheduleDB, setScheduleDB] = useState(
    JSON.parse(storage.getString("currentSchedule")) as UnparsedSchedule,
  );

  const [addModalVisible, setAddModalVisible] = useState(false);
  let inactiveDayList = [];
  for (let inactiveDay of scheduleDB["about"]["inactiveDays"]) {
    inactiveDayList.push(
      <InactiveDayElem
        key={inactiveDay["days"].toString()}
        inactiveDay={inactiveDay}
        scheduleDB={scheduleDB}
        setScheduleDB={setScheduleDB}
      ></InactiveDayElem>,
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
            Inactive Days
          </StyledText>
        </StyledView>
        <StyledPressable
          className="mb-4 bg-wedgewood-400 rounded-md p-3 border-2 border-wedgewood-500 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
          accessible={true}
          accessibilityLabel="Add Inactive Day"
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

      <AddInactiveModal
        modalVisible={addModalVisible}
        setModalVisible={setAddModalVisible}
        scheduleDB={scheduleDB}
        setScheduleDB={setScheduleDB}
      ></AddInactiveModal>

      {inactiveDayList}

      <StyledView className="bg-wedgewood-300 p-5 mb-2 rounded border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 flex flex-col mt-12">
        <StyledText className="text-base text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          Inactive days are useful to mark exceptions to a routine, such as holidays and days off.
        </StyledText>
      </StyledView>
    </Wrapper>
  );
}
