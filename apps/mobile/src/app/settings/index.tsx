import {
  faAngleRight,
  faBell,
  faCalendarMinus,
  faCalendarPlus,
  faCircleHalfStroke,
  faFileImport,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import notifee, { AuthorizationStatus } from "@notifee/react-native";
import { impactAsync } from "expo-haptics";
import { router, usePathname } from "expo-router";
import { styled, useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Appearance, Platform, Pressable, Switch, Text, View } from "react-native";

import WidgetUpdaterModule from "@/modules/widget-updater/src/WidgetUpdaterModule";
import Import from "@/src/app/settings/import";
import Wrapper from "@/src/components/Wrapper";
import notificationService from "@/src/utils/notificationService";
import storage from "@/src/utils/storage";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledBottomSheet = styled(BottomSheet);
const StyledBottomSheetScrollView = styled(BottomSheetScrollView);

export default function Settings() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const [notificationEnabled, setNotificationEnabled] = useState(
    storage.getString("notificationEnabled") == "true",
  );

  const bottomSheetRef = useRef<BottomSheet>(null);

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  useEffect(() => {
    bottomSheetRef.current?.close();
  }, []);

  // Close bottom sheet on navigation (pathname change)
  const pathname = usePathname();
  useEffect(() => {
    bottomSheetRef.current?.close();
  }, [pathname]);

  // snap points (height of bottom sheet)
  const snapPoints = useMemo(() => ["40%"], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
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

  return (
    <>
      <Wrapper>
        {storage.getString("currentSchedule") ? (
          <StyledPressable
            accessible={true}
            accessibilityLabel="Import Schedule"
            className="p-4 shadow-lg bg-wedgewood-300 rounded mt-4 flex flex-row justify-between items-center border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
            onPress={openBottomSheet}
          >
            <StyledView className="flex flex-row items-center">
              <FontAwesomeIcon
                icon={faFileImport}
                size={20}
                color={colorScheme === "dark" ? "#92cace" : "#c026d3"}
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
        ) : (
          <StyledPressable
            className="p-4 shadow-lg bg-purple-300 rounded mt-4 flex flex-row justify-between items-center border-2 border-purple-500"
            onPress={openBottomSheet}
            accessible={true}
            accessibilityLabel="Import Schedule"
          >
            <StyledView className="flex flex-row items-center">
              <FontAwesomeIcon icon={faFileImport} size={20}></FontAwesomeIcon>
              <StyledText className="text-xl ml-3 pb-[1.5] font-poppins">
                Import Schedule
              </StyledText>
            </StyledView>
            <FontAwesomeIcon icon={faAngleRight} size={20}></FontAwesomeIcon>
          </StyledPressable>
        )}

        <StyledPressable
          className="p-4 shadow-lg bg-wedgewood-300 rounded mt-4 flex flex-row justify-between items-center border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
          onPress={() => router.push("/settings/general")}
          accessible={true}
          accessibilityLabel="General Settings"
        >
          <StyledView className="flex flex-row items-center">
            <StyledView className="pt-[1.4]">
              <FontAwesomeIcon
                icon={faGear}
                size={20}
                color={colorScheme === "dark" ? "#92cace" : "#2563eb"}
              ></FontAwesomeIcon>
            </StyledView>
            <StyledText className="text-xl text-wedgewood-950 dark:text-wedgewood-300 font-poppins ml-3 pb-[1.5]">
              General
            </StyledText>
          </StyledView>
          <FontAwesomeIcon
            icon={faAngleRight}
            size={20}
            color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
          ></FontAwesomeIcon>
        </StyledPressable>

        <StyledPressable
          className="p-4 shadow-lg bg-wedgewood-300 rounded mt-4 flex flex-row justify-between items-center border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
          onPress={() => router.push("/settings/routine")}
          accessible={true}
          accessibilityLabel="Routine Settings"
        >
          <StyledView className="flex flex-row items-center">
            <FontAwesomeIcon
              icon={faCalendarPlus}
              size={20}
              color={colorScheme === "dark" ? "#92cace" : "#65a30d"}
            ></FontAwesomeIcon>
            <StyledText className="text-xl text-wedgewood-950 dark:text-wedgewood-300 font-poppins ml-3 pb-[1.5]">
              Routines
            </StyledText>
          </StyledView>
          <FontAwesomeIcon
            icon={faAngleRight}
            size={20}
            color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
          ></FontAwesomeIcon>
        </StyledPressable>

        <StyledPressable
          className="p-4 shadow-lg bg-wedgewood-300 rounded mt-4 flex flex-row justify-between items-center border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
          onPress={() => router.push("/settings/inactive")}
          accessible={true}
          accessibilityLabel="Inactive Day Settings"
        >
          <StyledView className="flex flex-row items-center">
            <FontAwesomeIcon
              icon={faCalendarMinus}
              size={20}
              color={colorScheme === "dark" ? "#92cace" : "#dc2626"}
            ></FontAwesomeIcon>
            <StyledText className="text-xl text-wedgewood-950 dark:text-wedgewood-300 font-poppins ml-3 pb-[1.5]">
              Inactive Days
            </StyledText>
          </StyledView>
          <FontAwesomeIcon
            icon={faAngleRight}
            size={20}
            color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
          ></FontAwesomeIcon>
        </StyledPressable>

        <StyledView className="p-4 shadow-lg bg-wedgewood-300 rounded mt-4 flex flex-row justify-between items-center border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800">
          <StyledView className="flex flex-row items-center">
            <FontAwesomeIcon
              icon={faCircleHalfStroke}
              size={20}
              color={colorScheme == "dark" ? "#92cace" : "#000000"}
            ></FontAwesomeIcon>
            <StyledText className="text-xl text-wedgewood-950 dark:text-wedgewood-300 font-poppins ml-3 pb-[1.5]">
              Dark Mode
            </StyledText>
          </StyledView>
          <Switch
            accessible={true}
            accessibilityLabel="Toggle Dark Mode"
            thumbColor="#ddeff0"
            trackColor={{ false: "#bfe0e2", true: "#3b757f" }}
            onValueChange={() => {
              const nextScheme = colorScheme == "dark" ? "light" : "dark";

              storage.set("colorScheme", nextScheme);
              Appearance.setColorScheme(nextScheme);
              setColorScheme(nextScheme);

              WidgetUpdaterModule.update();
              impactAsync();
            }}
            value={colorScheme == "dark"}
          ></Switch>
        </StyledView>

        {Platform.OS == "android" ? (
          <StyledView className="p-4 shadow-lg bg-wedgewood-300 rounded mt-4 flex flex-row justify-between items-center border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800">
            <StyledView className="flex flex-row items-center">
              <FontAwesomeIcon
                icon={faBell}
                size={20}
                color={colorScheme === "dark" ? "#92cace" : "#7c3aed"}
              ></FontAwesomeIcon>
              <StyledText className="text-xl text-wedgewood-950 dark:text-wedgewood-300 font-poppins ml-3 w-8/12 overflow-ellipsis pb-[1.5]">
                Persistent Notification
              </StyledText>
            </StyledView>
            <Switch
              accessible={true}
              accessibilityLabel="Toggle Persistent Notification"
              thumbColor="#ddeff0"
              trackColor={{ false: "#bfe0e2", true: "#3b757f" }}
              onValueChange={async () => {
                if (storage.getString("notificationEnabled") == "true") {
                  storage.set("notificationEnabled", "false");

                  notifee.stopForegroundService();
                  setNotificationEnabled(false);
                } else {
                  const settings = await notifee.requestPermission();

                  if (settings.authorizationStatus == AuthorizationStatus.AUTHORIZED) {
                    notificationService();

                    setNotificationEnabled(true);
                    storage.set("notificationEnabled", "true");

                    Alert.alert(
                      "Warning",
                      "It might take a bit of time for the notification to show. The notification won't appear if there are no more events left or no schedule.",
                    );
                  }
                }

                impactAsync();
              }}
              value={notificationEnabled}
            ></Switch>
          </StyledView>
        ) : (
          <></>
        )}
      </Wrapper>
      <StyledBottomSheet
        accessible={false}
        enablePanDownToClose={true}
        ref={bottomSheetRef}
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
