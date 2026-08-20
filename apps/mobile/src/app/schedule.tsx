import { faCalendar, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import {
  ParsedEvent,
  PeriodNames,
  Schedule as ScheduleType,
  UnparsedSchedule,
} from "@scheduli/types";
import { styled } from "nativewind";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, useColorScheme, Pressable, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import ScheduliWrapper from "@/src/components/ScheduliWrapper";
import findCorrectSchedule from "@/src/utils/findCorrectSchedule";
import { useMMKVState } from "@/src/utils/hooks/useMMKVState";
import parseScheduleDB from "@/src/utils/parseScheduleDB";
import specialSchedule from "@/src/utils/specialSchedule";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledBottomSheet = styled(BottomSheet);
const StyledBottomSheetView = styled(BottomSheetView);
const StyledBottomSheetTextInput = styled(BottomSheetTextInput);

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
function sameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
function removePassing(scheduleDB: ScheduleType) {
  for (const scheduleName in scheduleDB["routines"]) {
    scheduleDB["routines"][scheduleName]["events"] = scheduleDB["routines"][scheduleName][
      "events"
    ].filter((e) => !e.periodName.startsWith("Passing"));
  }
  return scheduleDB;
}

export default function Schedule() {
  const colorScheme = useColorScheme();

  const [currentDate, setCurrentDate] = useState(new Date());

  const [dateModalVisible, setDateModalVisible] = useState(false);

  const [rawSchedule] = useMMKVState<UnparsedSchedule>("currentSchedule", JSON.parse);
  const [storedPeriodNames, setStoredPeriodNames] = useMMKVState<PeriodNames>(
    "periodNames",
    JSON.parse,
  );

  const [removedPeriodNames, setRemovedPeriodsNames] = useMMKVState<string[]>(
    "removedPeriods",
    JSON.parse,
  );

  const scheduleDB = useMemo(
    () => (rawSchedule ? removePassing(parseScheduleDB(rawSchedule)) : null),
    [rawSchedule, storedPeriodNames, removedPeriodNames],
  );

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["35%"], []);
  const [selectedEvent, setSelectedEvent] = useState<ParsedEvent | null>(null);
  const [customNameInput, setCustomNameInput] = useState("");

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

  const handleEventPress = useCallback(
    (event: ParsedEvent) => {
      setSelectedEvent(event);
      const currentCustomName = storedPeriodNames?.[event.periodName];
      setCustomNameInput(currentCustomName || "");
      bottomSheetRef.current?.expand();
    },
    [storedPeriodNames],
  );

  const handleSaveName = () => {
    if (!selectedEvent) return;
    const updated: PeriodNames = {
      ...storedPeriodNames,
      [selectedEvent.name]: customNameInput.trim() || null,
    };
    setStoredPeriodNames(updated);
    bottomSheetRef.current?.close();
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (new Date().getDate() !== currentDate.getDate()) {
        setCurrentDate(new Date());
      }
    }, 1000 * 60);
    return () => clearInterval(id);
  }, []);

  const scheduleName = scheduleDB ? findCorrectSchedule(scheduleDB, currentDate) : null;

  if (!rawSchedule) {
    return (
      <ScheduliWrapper currentDate={currentDate}>
        <StyledView className="bg-wedgewood-300 p-5 mt-10 mb-2 border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600">
          <StyledText className="text-2xl text-center text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
            It looks like you haven't set up a schedule yet.
          </StyledText>
        </StyledView>
      </ScheduliWrapper>
    );
  }

  if (scheduleName == null) {
    const isToday = sameDay(new Date(), currentDate);
    return (
      <>
        <DateTimePickerModal
          isVisible={dateModalVisible}
          date={currentDate}
          onConfirm={(date) => {
            setDateModalVisible(false);
            setCurrentDate(date);
          }}
          onCancel={() => setDateModalVisible(false)}
          mode="date"
          display="inline"
        />
        <ScheduliWrapper currentDate={currentDate}>
          <StyledView className="bg-wedgewood-300 p-5 mt-10 mb-2 border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600">
            <StyledText className="text-2xl text-center text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
              {isToday ? "No events today." : `No events on ${currentDate.toLocaleDateString()}.`}
            </StyledText>
            {specialSchedule(scheduleDB, currentDate) && (
              <StyledText className="font-poppins text-center mt-2 text-wedgewood-950 dark:text-wedgewood-300 text-lg">
                {specialSchedule(scheduleDB, currentDate)}
              </StyledText>
            )}

            <StyledPressable
              accessible={true}
              accessibilityLabel="Set Current Date"
              className="border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-3 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600 mt-4 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
              onPress={() => setDateModalVisible(true)}
            >
              <StyledText className="text-wedgewood-950 dark:text-wedgewood-300 font-poppins mr-2">
                <StyledText className="font-poppinsBold">Current Date: </StyledText>
                <StyledText>{currentDate.toLocaleDateString()}</StyledText>
              </StyledText>
              <FontAwesomeIcon
                icon={faCalendar}
                size={16}
                color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
              />
            </StyledPressable>

            {!isToday && (
              <StyledPressable
                accessible={true}
                accessibilityLabel="Back to Today"
                className="border-2 border-orange-400 rounded shadow bg-orange-200 p-3 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600 mt-4 active:bg-orange-500 dark:active:bg-orange-800"
                onPress={() => setCurrentDate(new Date())}
              >
                <StyledText className="dark:text-orange-300 mr-2">
                  <StyledText className="font-poppinsBold">Back to Today</StyledText>
                </StyledText>
              </StyledPressable>
            )}
          </StyledView>
        </ScheduliWrapper>
      </>
    );
  }

  const scheduleTimes = scheduleDB["routines"][scheduleName]["events"];

  return (
    <>
      <DateTimePickerModal
        isVisible={dateModalVisible}
        date={currentDate}
        onConfirm={(date) => {
          setDateModalVisible(false);
          setCurrentDate(date);
        }}
        onCancel={() => setDateModalVisible(false)}
        mode="date"
        display="inline"
      />
      <ScheduliWrapper currentDate={currentDate}>
        <StyledView className="bg-wedgewood-300 p-5 mt-10 mb-2 border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600">
          <StyledText className="font-poppinsBold text-3xl text-center mb-2 text-wedgewood-950 dark:text-wedgewood-300">
            {sameDay(new Date(), currentDate)
              ? "Today's Schedule"
              : `${currentDate.toLocaleDateString()} Schedule`}
          </StyledText>
          <StyledText className="text-xl text-center text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
            {scheduleDB["routines"][scheduleName]["officialName"]}
          </StyledText>

          <StyledPressable
            accessible={true}
            accessibilityLabel="Set Current Date"
            className="border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-3 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600 mt-4 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
            onPress={() => setDateModalVisible(true)}
          >
            <StyledText className="text-wedgewood-950 dark:text-wedgewood-300 font-poppins mr-2">
              <StyledText className="font-poppinsBold">Current Date: </StyledText>
              <StyledText>{currentDate.toLocaleDateString()}</StyledText>
            </StyledText>
            <FontAwesomeIcon
              icon={faCalendar}
              size={16}
              color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
            />
          </StyledPressable>

          {!sameDay(new Date(), currentDate) && (
            <StyledPressable
              accessible={true}
              accessibilityLabel="Back to Today"
              className="border-2 border-orange-400 rounded shadow bg-orange-200 p-3 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600 mt-4 active:bg-orange-500 dark:active:bg-orange-800"
              onPress={() => setCurrentDate(new Date())}
            >
              <StyledText className="dark:text-orange-300 mr-2">
                <StyledText className="font-poppinsBold">Back to Today</StyledText>
              </StyledText>
            </StyledPressable>
          )}
        </StyledView>

        {scheduleTimes.map(({ rawPeriodName, startTime, endTime, periodName, name }) => (
          <StyledPressable
            accessible={false}
            key={startTime}
            className="mx-8 my-2 rounded bg-wedgewood-300 p-6 border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() =>
              handleEventPress({
                rawPeriodName,
                startTime,
                endTime,
                periodName,
                name,
              })
            }
          >
            <StyledText className="text-center font-poppinsBold text-2xl text-wedgewood-950 dark:text-wedgewood-300">
              {periodName}
            </StyledText>
            <StyledText className="text-center text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
              {formatDate(startTime)} - {formatDate(endTime)}
            </StyledText>
          </StyledPressable>
        ))}

        {/* hidden events */}
        {removedPeriodNames.map((periodName) => (
          <StyledPressable
            key={periodName}
            className="ml-10 mr-10 mb-4 rounded bg-gray-400 p-6 border-2 border-gray-400 dark:bg-gray-600 dark:border-gray-600 opacity-20"
            onPress={() => {
              const newRemovedPeriods = [...removedPeriodNames];
              newRemovedPeriods.splice(removedPeriodNames.indexOf(periodName), 1);

              setRemovedPeriodsNames(newRemovedPeriods);
            }}
          >
            <StyledText className="text-center font-poppinsBold text-2xl text-wedgewood-950 dark:text-wedgewood-300">
              {periodName}
            </StyledText>
            <StyledText className="text-center text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
              Tap to Reveal
            </StyledText>
          </StyledPressable>
        ))}
      </ScheduliWrapper>

      <StyledBottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        accessible={false}
        backgroundStyle={{
          backgroundColor: colorScheme == "dark" ? "#1a2c32" : "#bfe0e2",
        }}
      >
        <StyledBottomSheetView className="p-6 pb-32">
          {selectedEvent && (
            <>
              <StyledView className="flex flex-row justify-between items-center">
                <StyledText className="text-2xl font-poppinsBold text-center text-wedgewood-950 dark:text-wedgewood-300 ">
                  Edit Event Name
                </StyledText>

                <StyledPressable
                  className=" bg-orange-500 rounded-lg flex items-center justify-center w-12 h-12"
                  onPress={() => {
                    if (removedPeriodNames.indexOf(selectedEvent.name) != -1) {
                      const newRemovedPeriods = [...removedPeriodNames];
                      newRemovedPeriods.splice(removedPeriodNames.indexOf(selectedEvent.name), 1);

                      setRemovedPeriodsNames(newRemovedPeriods);
                    } else {
                      if (
                        !storedPeriodNames ||
                        Object.keys(storedPeriodNames).length < 2 ||
                        Object.keys(storedPeriodNames).length - 1 <=
                          Object.keys(removedPeriodNames).length
                      ) {
                        return Alert.alert(
                          "Error",
                          "A routine must have at least one visible event.",
                        );
                      }

                      const newRemovedPeriods = [...removedPeriodNames];
                      newRemovedPeriods.push(selectedEvent.name);

                      setRemovedPeriodsNames(newRemovedPeriods);
                    }
                  }}
                >
                  <StyledText className="text-xl font-poppinsBold text-white">
                    {removedPeriodNames.indexOf(selectedEvent.name) != -1 ? (
                      <FontAwesomeIcon icon={faEyeSlash} size={18}></FontAwesomeIcon>
                    ) : (
                      <FontAwesomeIcon icon={faEye} size={18}></FontAwesomeIcon>
                    )}
                  </StyledText>
                </StyledPressable>
              </StyledView>

              <StyledBottomSheetTextInput
                className="mt-4 p-3 border-2 border-wedgewood-400 rounded-lg text-lg font-poppins text-wedgewood-950 dark:text-wedgewood-300 bg-wedgewood-100 dark:bg-wedgewood-900 dark:border-wedgewood-600"
                placeholder={selectedEvent.periodName}
                placeholderTextColor={colorScheme == "dark" ? "#92cace" : "#6b7280"}
                value={customNameInput}
                onChangeText={setCustomNameInput}
              />

              <StyledPressable
                className="mt-4 p-4 bg-wedgewood-500 rounded-lg flex items-center justify-center"
                onPress={handleSaveName}
              >
                <StyledText className="text-xl font-poppinsBold text-white">Save</StyledText>
              </StyledPressable>
            </>
          )}
        </StyledBottomSheetView>
      </StyledBottomSheet>
    </>
  );
}
