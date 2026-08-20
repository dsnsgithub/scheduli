import {
  faAngleRight,
  faCalendarDay,
  faFileImport,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import notifee from "@notifee/react-native";
import { UnparsedSchedule } from "@scheduli/types";
import { nativeApplicationVersion } from "expo-application";
import { router } from "expo-router";
import { styled } from "nativewind";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useColorScheme, Platform, Pressable, Text, View } from "react-native";

import Import from "@/src/app/settings/import";
import Upcoming from "@/src/app/upcoming";
import Countdown from "@/src/components/index/countdown";
import Status from "@/src/components/index/status";
import ScheduliWrapper from "@/src/components/ScheduliWrapper";
import findCorrectSchedule from "@/src/utils/findCorrectSchedule";
import { useMMKVState } from "@/src/utils/hooks/useMMKVState";
import parseScheduleDB from "@/src/utils/parseScheduleDB";
import { createAvailablePeriodsDB, createRemovedPeriodsDB } from "@/src/utils/scheduleStorage";
import storage from "@/src/utils/storage";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledBottomSheetScrollView = styled(BottomSheetScrollView);
const StyledBottomSheet = styled(BottomSheet);

if (Platform.OS === "android") {
  notifee.onBackgroundEvent(async ({ detail }) => {
    const { notification } = detail;
    await notifee.cancelNotification(notification.id);
  });
}

function compareVersions(version1: string, version2: string) {
  const v1 = version1.split(".").map(Number);
  const v2 = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const v1Comp = i < v1.length ? v1[i] : 0;
    const v2Comp = i < v2.length ? v2[i] : 0;

    if (v1Comp > v2Comp) return true;
    if (v1Comp < v2Comp) return false;
  }
  return true;
}

function parseUserDate(dateString: string | number | Date) {
  const userDate = new Date(dateString);
  const userTimezoneOffset = userDate.getTimezoneOffset();
  const userTimezoneOffsetMs = userTimezoneOffset * 60000;
  return new Date(userDate.getTime() + userTimezoneOffsetMs);
}

export default function Home() {
  const colorScheme = useColorScheme();

  const [rawSchedule] = useMMKVState("currentSchedule", JSON.parse);

  const inactiveSheetRef = useRef<BottomSheet>(null);
  const openInactiveSheet = useCallback(() => {
    inactiveSheetRef.current?.expand();
  }, []);

  const importRef = useRef<BottomSheet>(null);
  const openImportSheet = useCallback(() => {
    importRef.current?.expand();
  }, []);

  const snapPoints = useMemo(() => ["40%"], []);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Re-parse schedule when the calendar day changes so timestamps stay current
  const currentDay = currentDate.toDateString();
  const scheduleDB = useMemo(
    () => (rawSchedule ? parseScheduleDB(rawSchedule) : null),
    [rawSchedule, currentDay],
  );

  useEffect(() => {
    if (!scheduleDB) return;

    fetch(`${process.env.EXPO_PUBLIC_API_URL}${scheduleDB["about"]["link"]}`)
      .then((res) => res.json())
      .then((updatedSchedule) => {
        if (
          parseUserDate(updatedSchedule["about"]["lastUpdated"]).getTime() >
            parseUserDate(scheduleDB["about"]["lastUpdated"]).getTime() &&
          compareVersions(nativeApplicationVersion, updatedSchedule["about"]["compatibleVersion"])
        ) {
          const newSchedule = JSON.parse(JSON.stringify(updatedSchedule)) as UnparsedSchedule;
          const rawSchedule = JSON.parse(storage.getString("currentSchedule")!) as UnparsedSchedule;

          if (!newSchedule["about"]["startDate"]) {
            newSchedule["about"]["startDate"] = rawSchedule["about"]["startDate"];
          }

          if (!newSchedule["about"]["endDate"]) {
            newSchedule["about"]["endDate"] = rawSchedule["about"]["endDate"];
          }

          if (!newSchedule["about"]["name"]) {
            newSchedule["about"]["name"] = rawSchedule["about"]["name"];
          }

          const noRoutines = Object.keys(newSchedule.routines).length === 0;
          Object.keys(rawSchedule.routines).forEach((routineName) => {
            if (rawSchedule.routines[routineName]["userCreated"] || noRoutines) {
              newSchedule["routines"][routineName] = rawSchedule.routines[routineName];
            }
          });

          storage.set("currentSchedule", JSON.stringify(newSchedule));
        }
      })
      .catch(() => {});
  }, [scheduleDB]);

  if (!scheduleDB) {
    return (
      <>
        <ScheduliWrapper currentDate={currentDate}>
          <StyledView className="bg-wedgewood-300 p-5 mt-4 mb-2 rounded border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 flex flex-col items-center">
            <StyledText className="text-2xl text-wedgewood-950 dark:text-wedgewood-300 font-poppinsBold">
              Welcome to Scheduli!
            </StyledText>

            <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins mt-4">
              Get started by creating your first routine or importing an existing one.
            </StyledText>

            <StyledPressable
              accessible={true}
              accessibilityLabel="Import Schedule"
              className="p-4 shadow-lg bg-purple-300 rounded mt-4 flex flex-row justify-between items-center border-2 border-purple-400 dark:bg-purple-950 dark:border-purple-600 active:bg-purple-500 dark:active:bg-purple-800 w-full"
              onPress={openImportSheet}
            >
              <StyledView className="flex flex-row items-center">
                <FontAwesomeIcon
                  icon={faFileImport}
                  size={20}
                  color={colorScheme === "dark" ? "#92cace" : "#1a2c32"}
                ></FontAwesomeIcon>
                <StyledText className="text-xl text-wedgewood-950 dark:text-wedgewood-300 font-poppins ml-3 pb-[1.5]">
                  Import Schedule
                </StyledText>
              </StyledView>
              <FontAwesomeIcon
                icon={faAngleRight}
                size={20}
                color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
              ></FontAwesomeIcon>
            </StyledPressable>

            {/* create new schedule */}
            <StyledPressable
              className="p-4 shadow-lg bg-blue-300 rounded mt-4 flex flex-row justify-between items-center border-2 border-blue-400 dark:bg-blue-950 dark:border-blue-600 active:bg-blue-500 dark:active:bg-blue-800 w-full"
              onPress={async () => {
                const newSchedule: UnparsedSchedule = await fetch(
                  `${process.env.EXPO_PUBLIC_API_URL}/api/schedule/default`,
                ).then((res) => res.json());

                storage.set("currentSchedule", JSON.stringify(newSchedule));
                createRemovedPeriodsDB();
                createAvailablePeriodsDB(newSchedule);

                router.push("/settings/routine");
              }}
            >
              <StyledView className="flex flex-row items-center">
                <FontAwesomeIcon
                  icon={faPlus}
                  size={20}
                  color={colorScheme === "dark" ? "#92cace" : "#1a2c32"}
                ></FontAwesomeIcon>
                <StyledText className="text-xl text-wedgewood-950 dark:text-wedgewood-300 font-poppins ml-3 pb-[1.5]">
                  Create New Schedule
                </StyledText>
              </StyledView>
              <FontAwesomeIcon
                icon={faAngleRight}
                size={20}
                color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
              ></FontAwesomeIcon>
            </StyledPressable>
          </StyledView>
        </ScheduliWrapper>
        <StyledBottomSheet
          key="import-schedule-sheet"
          accessible={false}
          enablePanDownToClose={true}
          ref={importRef}
          index={
            -1 // initially closed
          }
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            backgroundColor: colorScheme == "dark" ? "#000000" : "#bfe0e2",
          }}
        >
          <StyledBottomSheetScrollView>
            <Import></Import>
          </StyledBottomSheetScrollView>
        </StyledBottomSheet>
      </>
    );
  }

  const correctScheduleName = findCorrectSchedule(scheduleDB, currentDate);
  if (correctScheduleName == null) {
    return (
      <>
        <ScheduliWrapper currentDate={currentDate}>
          <Status time="" percentage={0} timeRange="" eventName="No events for today." />
          <StyledPressable
            className="p-4 shadow-lg bg-wedgewood-300 rounded mt-4 flex flex-row justify-center items-center border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
            onPress={openInactiveSheet}
            accessible={true}
            accessibilityLabel="Important Dates"
          >
            <StyledView className="flex flex-row items-center">
              <FontAwesomeIcon
                icon={faCalendarDay}
                size={20}
                color={colorScheme == "dark" ? "#92cace" : "#2563eb"}
              />
              <StyledText className="text-xl text-wedgewood-950 dark:text-wedgewood-300 font-poppins ml-2 mr-2">
                Important Dates
              </StyledText>
            </StyledView>
            <FontAwesomeIcon
              icon={faAngleRight}
              size={20}
              color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
            />
          </StyledPressable>
        </ScheduliWrapper>
        <StyledBottomSheet
          backdropComponent={renderBackdrop}
          accessible={false}
          maxDynamicContentSize={800}
          enablePanDownToClose={true}
          ref={inactiveSheetRef}
          index={-1}
          snapPoints={snapPoints}
          backgroundStyle={{
            backgroundColor: colorScheme == "dark" ? "#000000" : "#bfe0e2",
          }}
        >
          <StyledBottomSheetScrollView>
            <Upcoming />
          </StyledBottomSheetScrollView>
        </StyledBottomSheet>
      </>
    );
  }

  const scheduleTimes = scheduleDB["routines"][correctScheduleName]["events"];

  return (
    <>
      <ScheduliWrapper currentDate={currentDate}>
        <Countdown scheduleTimes={scheduleTimes} currentDate={currentDate} />
        <StyledPressable
          className="p-4 shadow-lg bg-wedgewood-300 rounded mt-4 flex flex-row justify-center items-center border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
          onPress={openInactiveSheet}
          accessible={true}
          accessibilityLabel="Important Dates"
        >
          <StyledView className="flex flex-row items-center">
            <FontAwesomeIcon
              icon={faCalendarDay}
              size={20}
              color={colorScheme == "dark" ? "#92cace" : "#2563eb"}
            />
            <StyledText className="text-xl text-wedgewood-950 dark:text-wedgewood-300 font-poppins ml-2 mr-2">
              Important Dates
            </StyledText>
          </StyledView>
          <FontAwesomeIcon
            icon={faAngleRight}
            size={20}
            color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
          />
        </StyledPressable>
      </ScheduliWrapper>
      <StyledBottomSheet
        backdropComponent={renderBackdrop}
        accessible={false}
        maxDynamicContentSize={800}
        enablePanDownToClose={true}
        ref={inactiveSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: colorScheme == "dark" ? "#1a2c32" : "#bfe0e2",
        }}
      >
        <StyledBottomSheetScrollView>
          <Upcoming />
        </StyledBottomSheetScrollView>
      </StyledBottomSheet>
    </>
  );
}
