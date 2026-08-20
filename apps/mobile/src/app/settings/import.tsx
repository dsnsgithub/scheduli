import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { ScheduleList, UnparsedSchedule } from "@scheduli/types";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, Pressable, Text, View } from "react-native";

import SchoolModal from "@/src/components/import/SchoolModal";
import UCIModal from "@/src/components/import/UCIModal";
import { createAvailablePeriodsDB, createRemovedPeriodsDB } from "@/src/utils/scheduleStorage";
import storage from "@/src/utils/storage";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledActivityIndicator = styled(ActivityIndicator);

function ScheduleButton({
  schedule,
  entry,
  handleImport,
  colorScheme,
}: {
  schedule: string;
  entry: string;
  handleImport: (scheduleId: string) => void;
  colorScheme: "light" | "dark" | null;
}) {
  return (
    <StyledPressable
      accessible
      accessibilityLabel={`Import ${schedule}`}
      className="rounded shadow-lg bg-wedgewood-300 p-4 border-2 border-wedgewood-400 mt-4 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
      onPress={() => handleImport(entry)}
    >
      <StyledText className="mr-2 text-wedgewood-950 dark:text-wedgewood-300 font-poppins">{`Import ${schedule}`}</StyledText>
      <FontAwesomeIcon icon={faPlus} color={colorScheme === "dark" ? "#92cace" : "#1a2c32"} />
    </StyledPressable>
  );
}

export default function Import() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [updatedSchedules, setUpdatedSchedules] = useState<ScheduleList>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/schedules`)
      .then((res) => res.json())
      .then((data) => {
        setUpdatedSchedules(data);
        setIsLoading(false);
      })
      .catch(() => {});
  }, []);

  if (isLoading) {
    return <StyledActivityIndicator className="mt-10" />;
  }

  const handleImport = async (scheduleId: string) => {
    const newSchedule: UnparsedSchedule = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/schedule/${scheduleId}`,
    ).then((res) => res.json());

    storage.set("currentSchedule", JSON.stringify(newSchedule));
    createRemovedPeriodsDB();
    createAvailablePeriodsDB(newSchedule);

    if (scheduleId == "default") {
      router.push("/settings/routine");
    } else {
      router.push("/");
    }
  };

  const scheduleList = Object.keys(updatedSchedules!).map((schedule) => {
    const entry = updatedSchedules![schedule];
    return typeof entry === "string" ? (
      <ScheduleButton
        key={schedule}
        schedule={schedule}
        entry={entry}
        handleImport={handleImport}
        colorScheme={colorScheme}
      />
    ) : (
      <SchoolModal key={schedule} schedules={entry} />
    );
  });

  return (
    <StyledView className="p-4 pb-32">
      <StyledView className="bg-wedgewood-300 p-5 rounded border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 flex flex-col mb-4">
        <StyledText className="text-base text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          Choose a schedule to import or create a custom schedule by editing the default schedule.
        </StyledText>
      </StyledView>
      {scheduleList}
      <UCIModal />
    </StyledView>
  );
}
