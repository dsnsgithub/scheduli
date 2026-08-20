import { faAngleLeft, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedSchedule } from "@scheduli/types";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { useColorScheme, Pressable, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import TextModal from "@/src/components/settings/TextModal";
import Wrapper from "@/src/components/Wrapper";
import storage from "@/src/utils/storage";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString();
}

function parseUserDate(dateString: string | number | Date) {
  // Create a new Date object from the input date string
  const userDate = new Date(dateString);

  // Get the user's timezone offset in minutes
  const userTimezoneOffset = userDate.getTimezoneOffset();

  // Calculate the user's actual timezone offset in milliseconds
  const userTimezoneOffsetMs = userTimezoneOffset * 60000;

  // Adjust the Date object to represent the date in the user's timezone
  const userTimezoneDate = new Date(userDate.getTime() + userTimezoneOffsetMs);

  return userTimezoneDate;
}

function formatDateToYYYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function editProperty(
  value: string | Date,
  scheduleDB: UnparsedSchedule,
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  editedProperty: string,
) {
  const newSchedule = { ...scheduleDB };

  if (typeof value == "object") {
    newSchedule["about"][editedProperty] = formatDateToYYYYMMDD(value);
  } else {
    newSchedule["about"][editedProperty] = value;
  }

  setScheduleDB(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

export default function General() {
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
              General Information
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledText className="m-6 text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          It looks like you haven't set up a schedule yet.
        </StyledText>
      </Wrapper>
    );
  }

  let [scheduleDB, setScheduleDB] = useState(
    JSON.parse(storage.getString("currentSchedule")) as UnparsedSchedule,
  );

  useEffect(() => {
    setScheduleDB(JSON.parse(storage.getString("currentSchedule")) as UnparsedSchedule);
  }, [storage.getString("currentSchedule")]);

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [startModalVisible, setStartModalVisible] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);

  const [startDate, setStartDate] = useState(parseUserDate(scheduleDB["about"]["startDate"]));
  const [endDate, setEndDate] = useState(parseUserDate(scheduleDB["about"]["endDate"]));

  return (
    <Wrapper>
      <TextModal
        defaultValue={scheduleDB["about"]["name"]}
        modalName="Schedule Name"
        modalVisible={nameModalVisible}
        setModalVisible={setNameModalVisible}
        onSubmit={(updatedText) => {
          editProperty(updatedText, scheduleDB, setScheduleDB, "name");
        }}
      ></TextModal>

      <DateTimePickerModal
        key={"start"}
        isVisible={startModalVisible}
        date={startDate}
        onConfirm={(date) => {
          if (date.getTime() >= parseUserDate(scheduleDB["about"]["endDate"]).getTime()) {
            setEndDate(new Date(date.getTime() + 3600000));
          }

          setStartModalVisible(false);
          setStartDate(date);
          editProperty(date, scheduleDB, setScheduleDB, "startDate");
        }}
        onCancel={() => {
          setStartModalVisible(false);
        }}
        mode="date"
        display="inline"
      ></DateTimePickerModal>

      <DateTimePickerModal
        key={"end"}
        isVisible={endModalVisible}
        date={endDate}
        onConfirm={(date) => {
          if (parseUserDate(scheduleDB["about"]["startDate"]).getTime() >= date.getTime()) {
            setStartDate(new Date(date.getTime() - 3600000));
          }

          setEndModalVisible(false);
          setEndDate(date);
          editProperty(date, scheduleDB, setScheduleDB, "endDate");
        }}
        onCancel={() => {
          setEndModalVisible(false);
        }}
        mode="date"
        display="inline"
      ></DateTimePickerModal>

      <StyledView className="flex flex-row items-center mb-6">
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
          General Information
        </StyledText>
      </StyledView>

      <StyledPressable
        className="border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-4 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
        onPress={() => setNameModalVisible(true)}
        accessible={true}
        accessibilityLabel="Edit Name"
      >
        <StyledText>
          <StyledText className="text-xl font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
            Name:{" "}
          </StyledText>
          <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
            {" "}
            {scheduleDB["about"]["name"]}{" "}
          </StyledText>
        </StyledText>
        <FontAwesomeIcon
          icon={faPencil}
          size={16}
          color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
        ></FontAwesomeIcon>
      </StyledPressable>

      <StyledPressable
        className="mt-4 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-4 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
        onPress={() => setStartModalVisible(true)}
        accessible={true}
        accessibilityLabel="Edit Start Date"
      >
        <StyledText>
          <StyledText className="text-xl font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
            Start Date:{" "}
          </StyledText>
          <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
            {" "}
            {formatDate(startDate)}{" "}
          </StyledText>
        </StyledText>
        <FontAwesomeIcon
          icon={faPencil}
          size={16}
          color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
        ></FontAwesomeIcon>
      </StyledPressable>

      <StyledPressable
        className="mt-4 border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-4 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
        onPress={() => setEndModalVisible(true)}
        accessible={true}
        accessibilityLabel="Edit End Date"
      >
        <StyledText>
          <StyledText className="text-xl font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
            End Date:{" "}
          </StyledText>
          <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
            {" "}
            {formatDate(endDate)}{" "}
          </StyledText>
        </StyledText>
        <FontAwesomeIcon
          icon={faPencil}
          size={16}
          color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
        ></FontAwesomeIcon>
      </StyledPressable>

      {/* add information about the app, build number */}

      <StyledPressable
        className="mt-10 border-2 items-center border-wedgewood-400 shadow bg-wedgewood-300 p-4 flex flex-col justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
        onPress={() => {
          // open https://dsns.dev
          router.push("https://dsns.dev");
        }}
      >
        <StyledText>
          <StyledText className="text-xl font-poppins text-wedgewood-950 dark:text-wedgewood-300">
            Scheduli v{nativeApplicationVersion}
          </StyledText>

          <StyledText className="text-lg ml-4 font-poppins text-wedgewood-950 dark:text-wedgewood-300">
            {" "}
            (Build {nativeBuildVersion})
          </StyledText>
        </StyledText>

        <StyledText className="mt-2">
          <StyledText className="text-lg font-poppins text-wedgewood-950 dark:text-wedgewood-300">
            Made with ❤️ by Dominic Seung
          </StyledText>
        </StyledText>
      </StyledPressable>

      {process.env.EXPO_PUBLIC_APP_VARIANT == "development" ? (
        <StyledPressable
          onPress={() => {
            storage.set("currentSchedule", "");
            router.push("/");
          }}
          className="mt-4 border-2 border-red-400 rounded shadow bg-red-300 p-4 flex flex-row items-center justify-center dark:bg-red-950 dark:border-red-600 active:bg-red-500 dark:active:bg-red-800"
        >
          <StyledView className="mr-2">
            <FontAwesomeIcon icon={faTrash} color={colorScheme == "dark" ? "#92cace" : "#1a2c32"} />
          </StyledView>

          <StyledText className="text-lg font-poppins text-wedgewood-950 dark:text-wedgewood-300">
            Purge Schedule Data
          </StyledText>
        </StyledPressable>
      ) : (
        <></>
      )}
    </Wrapper>
  );
}
