import { Poppins_400Regular, Poppins_700Bold, useFonts } from "@expo-google-fonts/poppins";
import notifee from "@notifee/react-native";
import { nativeApplicationVersion } from "expo-application";
import { useGlobalSearchParams, usePathname } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Alert, Appearance, BackHandler, ColorSchemeName, Linking, Platform } from "react-native";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import checkVersion from "react-native-store-version";

import notificationService from "@/src/utils/notificationService";
import { posthog } from "@/src/utils/posthog";
import storage from "@/src/utils/storage";
import { widgetTaskHandler } from "@/src/widget/android/widget-task-handler";

registerWidgetTaskHandler(widgetTaskHandler);

const checkUpdateNeeded = async () => {
  try {
    const check = await checkVersion({
      version: nativeApplicationVersion,
      iosStoreURL:
        "https://apps.apple.com/us/app/scheduli/id6470429917?itsct=apps_box_badge&itscg=30200",
      androidStoreURL: "https://play.google.com/store/apps/details?id=com.scheduli.schedulimobile",
      country: "en",
    });

    if (check.result === "new") {
      if (
        !storage.getString("delayUpdateUntil") ||
        new Date().getTime() > Number(storage.getString("delayUpdateUntil"))
      )
        Alert.alert(
          "Update Available",
          "There is a new update for Scheduli! These updates fix many bugs and add many useful features.",
          [
            {
              text: "Later",
              style: "cancel",
              onPress: () => {
                storage.set(
                  "delayUpdateUntil",
                  String(new Date().setDate(new Date().getDate() + 1)),
                );
              },
            },
            {
              text: "Update",
              onPress: () => {
                BackHandler.exitApp();
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.scheduli.schedulimobile",
                );
              },
            },
          ],
        );
    }
  } catch {}
};

export default function App() {
  useEffect(() => {
    checkUpdateNeeded();

    if (Platform.OS == "android") {
      notifee.registerForegroundService(() => {
        return new Promise(() => {});
      });

      notificationService();
    }
  }, []);

  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    posthog.screen(pathname, params);
  }, [pathname, params]);

  const { colorScheme, setColorScheme } = useColorScheme();

  if (storage.getString("colorScheme")) {
    Appearance.setColorScheme(storage.getString("colorScheme") as ColorSchemeName);
    setColorScheme(storage.getString("colorScheme") as ColorSchemeName);
  } else {
    if (Appearance.getColorScheme()) {
      storage.set("colorScheme", Appearance.getColorScheme());
      setColorScheme(Appearance.getColorScheme());
    } else {
      storage.set("colorScheme", "light");
      setColorScheme("light");
    }
  }

  if (storage.getString("passingPeriods") == "undefined") storage.set("passingPeriods", "true");

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <></>;
  }

  return (
    <>
      <StatusBar style={storage.getString("colorScheme") == "dark" ? "light" : "dark"} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NativeTabs
          backgroundColor={colorScheme == "dark" ? "#000000" : "#ddeff0"}
          badgeBackgroundColor={colorScheme == "dark" ? "#92cace" : "#438e96"}
          indicatorColor={colorScheme == "dark" ? "#92cace" : "#438e96"}
        >
          <NativeTabs.Trigger name="index">
            <Label>Home</Label>
            <Icon sf="house.fill" drawable="ic_menu_home" />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="schedule">
            <Icon sf="calendar" drawable="ic_scheduli_notification" />
            <Label>Schedule</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="settings">
            <Icon sf="gear" drawable="ic_settings" />
            <Label>Settings</Label>
          </NativeTabs.Trigger>
        </NativeTabs>
      </GestureHandlerRootView>
    </>
  );
}
