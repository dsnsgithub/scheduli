import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Picker } from "@react-native-picker/picker";
import { UnparsedSchedule } from "@scheduli/types";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert, useColorScheme, Modal, Pressable, Text, TextInput, View } from "react-native";

import convertStudyListToSchedule from "@/src/utils/convertStudyListToSchedule";
import { createAvailablePeriodsDB, createRemovedPeriodsDB } from "@/src/utils/scheduleStorage";
import storage from "@/src/utils/storage";

import LoadingModal from "./LoadingModal";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledTextInput = styled(TextInput);
const StyledPicker = styled(Picker);
const StyledLink = styled(Link);

export default function SchoolModal() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [textValue, setTextValue] = useState("Paste here.");
  const inputRef = useRef<TextInput>(null);

  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(null);

  const posthog = usePostHog();

  const [possibleQuartersData, setPossibleQuartersData] = useState<
    { [key: string]: string }[] | null
  >(null);

  useEffect(() => {
    const fetchQuarters = async () => {
      const possibleQuartersData = await fetch("https://anteaterapi.com/v2/rest/websoc/terms").then(
        (res) => res.json(),
      );

      setPossibleQuartersData(possibleQuartersData.data);
      setSelectedQuarter(possibleQuartersData ? possibleQuartersData.data[0].shortName : "");
    };

    fetchQuarters();
  }, []);

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
              Import UCI Schedule
            </StyledText>
            <LoadingModal
              modalVisible={loadingModalVisible}
              setModalVisible={setLoadingModalVisible}
            ></LoadingModal>

            <StyledText className="font-poppinsBold text-lg text-wedgewood-950 dark:text-wedgewood-300 mt-4">
              Quarter:
            </StyledText>

            <StyledPicker
              selectedValue={selectedQuarter}
              onValueChange={(itemValue: string) => {
                setSelectedQuarter(itemValue);
              }}
              className="mb-4"
            >
              {possibleQuartersData ? (
                possibleQuartersData.map((quarter: { longName: string; shortName: string }) => (
                  <Picker.Item label={quarter.shortName} value={quarter.shortName} />
                ))
              ) : (
                <></>
              )}
            </StyledPicker>

            <StyledText className="font-poppins text-md mb-4 text-wedgewood-950 dark:text-wedgewood-300">
              Log into{" "}
              <StyledLink
                className="text-blue-500 hover:text-blue-700"
                href="https://www.reg.uci.edu/cgi-bin/webreg-redirect.sh"
              >
                WebReg
              </StyledLink>
              , tap Study List, and copy everything below the headers (Code, Dept, etc.)
            </StyledText>

            <StyledTextInput
              ref={inputRef}
              multiline={true}
              className="rounded shadow outline-none border-2 border-wedgewood-400 focus:border-wedgewood-600 p-2 bg-wedgewood-300 mb-5 dark:bg-wedgewood-950 dark:border-wedgewood-600 text-wedgewood-950 dark:text-wedgewood-300 font-poppins"
              defaultValue={""}
              placeholder="Paste from Study List."
              onChangeText={(newText) => setTextValue(newText)}
              onLayout={() => {
                setTimeout(() => inputRef.current.focus(), 150);
              }}
            ></StyledTextInput>
            <StyledText className="font-poppins text-xs text-wedgewood-950 dark:text-wedgewood-300 mb-2">
              Data from{" "}
              <StyledLink className="text-blue-500" href="https://icssc.link/about-anteaterapi">
                Anteater API.
              </StyledLink>
            </StyledText>

            <StyledPressable
              accessible={true}
              accessibilityLabel="Submit"
              className="mt-4 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
              onPress={async () => {
                if (!selectedQuarter || !textValue || selectedQuarter.split(" ").length !== 2) {
                  Alert.alert("Error", "Please select a quarter and paste a schedule");
                  return;
                }

                const [year, quarterName] = selectedQuarter.split(" ");

                let newSchedule: UnparsedSchedule;

                try {
                  newSchedule = await convertStudyListToSchedule(
                    textValue,
                    quarterName,
                    Number(year),
                  );
                } catch (error) {
                  posthog.captureException(error, {
                    textValue,
                    selectedQuarter,
                  });

                  newSchedule = null;
                }

                if (!newSchedule || Object.keys(newSchedule.routines).length === 0) {
                  Alert.alert("Error", "Invalid schedule");
                  return;
                }

                storage.set("currentSchedule", JSON.stringify(newSchedule));

                createRemovedPeriodsDB();
                createAvailablePeriodsDB(newSchedule);

                // setLoadingModalVisible(false);
                // Alert.alert("Success", `Applied ${scheduleName}. Tap the info button in the bottom bar for more instructions.`);

                setModalVisible(false);
                router.push("/");
              }}
            >
              <StyledText className="mr-2 font-poppinsBold text-center text-wedgewood-950 dark:text-wedgewood-300">
                Submit
              </StyledText>
            </StyledPressable>

            <StyledPressable
              accessible={true}
              accessibilityLabel="Cancel Download"
              className="mt-4 bg-orange-300 rounded shadow-xl p-4 border-2 border-orange-400 active:bg-orange-500 dark:active:bg-orange-800 flex flex-row items-center justify-center dark:bg-orange-950 dark:border-orange-600"
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
        accessibilityLabel="Import UCI Schedule"
        className="rounded shadow-lg bg-wedgewood-300 p-4 border-2 border-wedgewood-400 mt-4 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
        onPress={() => setModalVisible(true)}
      >
        <StyledText className="mr-2 text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          Import UCI Schedule
        </StyledText>
        <FontAwesomeIcon
          icon={faPlus}
          color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
        ></FontAwesomeIcon>
      </StyledPressable>
    </>
  );
}
