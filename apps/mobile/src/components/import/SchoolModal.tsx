import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { ScheduleList } from "@scheduli/types";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { useColorScheme, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { createAvailablePeriodsDB, createRemovedPeriodsDB } from "@/src/utils/scheduleStorage";
import storage from "@/src/utils/storage";

import LoadingModal from "./LoadingModal";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);

export default function SchoolModal(props: { schedules: ScheduleList }) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  let scheduleList = [];

  for (const scheduleName in props.schedules) {
    scheduleList.push(
      <StyledPressable
        accessible={true}
        accessibilityLabel={`Import ${scheduleName}`}
        key={scheduleName}
        className="rounded shadow-lg bg-wedgewood-300 p-4 border-2 border-wedgewood-400 mt-4 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 mx-8"
        onPress={async () => {
          // setLoadingModalVisible(true);

          const schedule = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/api/schedule/${props.schedules[scheduleName]}`,
          ).then((res) => res.json());
          storage.set("currentSchedule", JSON.stringify(schedule));

          createRemovedPeriodsDB();
          createAvailablePeriodsDB(schedule);

          // setLoadingModalVisible(false);
          // Alert.alert("Success", `Applied ${scheduleName}. Tap the info button in the bottom bar for more instructions.`);

          setModalVisible(false);
          router.push("/");
        }}
      >
        <StyledText className="mr-2 text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          Import {scheduleName}
        </StyledText>
        <FontAwesomeIcon
          icon={faPlus}
          color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
        ></FontAwesomeIcon>
      </StyledPressable>,
    );
  }
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
        <StyledView className="fixed inset-0 flex w-full h-full items-center justify-center p-4 bg-black/60">
          <StyledView className="bg-wedgewood-100 dark:bg-gray-950 dark:border-wedgewood-600 border-2 border-wedgewood-600 w-full p-5 rounded-xl">
            <StyledText className="font-poppinsBold text-xl text-center mb-4 text-wedgewood-950 dark:text-wedgewood-300">
              Import School Schedule
            </StyledText>
            <LoadingModal
              modalVisible={loadingModalVisible}
              setModalVisible={setLoadingModalVisible}
            ></LoadingModal>

            <StyledScrollView className="max-h-80">{scheduleList}</StyledScrollView>

            <StyledPressable
              accessible={true}
              accessibilityLabel="Cancel Download"
              className="mt-4 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <StyledText className="mr-2 font-poppinsBold text-center text-wedgewood-950 dark:text-wedgewood-300">
                Cancel
              </StyledText>
            </StyledPressable>
          </StyledView>
        </StyledView>
      </Modal>

      <StyledPressable
        accessible={true}
        accessibilityLabel="Import SRVUSD Schedule"
        className="rounded shadow-lg bg-wedgewood-300 p-4 border-2 border-wedgewood-400 mt-4 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
        onPress={() => setModalVisible(true)}
      >
        <StyledText className="mr-2 text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          Import SRVUSD Schedule
        </StyledText>
        <FontAwesomeIcon
          icon={faPlus}
          color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
        ></FontAwesomeIcon>
      </StyledPressable>
    </>
  );
}
