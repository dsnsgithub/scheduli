import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedSchedule } from "@scheduli/types";
import { styled } from "nativewind";
import { useState } from "react";
import {
  Alert,
  useColorScheme,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import storage from "@/src/utils/storage";

import DayPicker from "./DayPicker";
import TextModal from "./TextModal";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledTouchableOpacity = styled(TouchableOpacity);

function createNewRoutine(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  name: string,
  weekdays: number[],
) {
  if (!name) return Alert.alert("Error", "You must provide a name.");

  const newSchedule = { ...schedule };

  if (newSchedule["routines"][name]) {
    return Alert.alert("Error", "Routine with same name already exists.");
  }

  newSchedule["routines"][name] = {
    officialName: name,
    days: weekdays,
    events: [
      {
        name: "New Event!!",
        rawPeriodName: "New Event!!",
        startTime: "08:40",
        endTime: "08:45",
      },
    ],
    userCreated: true,
  };

  setSchedule(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));

  Alert.alert("Success", "Successfully created a new routine.");
}

export default function AddRoutineModal(props: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
}) {
  const [name, setName] = useState("New Routine!");
  const [nameModalVisible, setNameModalVisible] = useState(false);

  const [weekdays, setWeekdays] = useState([]);

  const colorScheme = useColorScheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
      onDismiss={() => {
        props.setModalVisible(false);
      }}
      onRequestClose={() => {
        props.setModalVisible(false);
      }}
    >
      <StyledTouchableOpacity
        accessible={false}
        className="fixed inset-0 flex w-full h-full items-center justify-center p-4 bg-black/60"
        onPress={() => {
          props.setModalVisible(false);
        }}
      >
        <StyledView className="bg-wedgewood-100 dark:bg-gray-950 dark:border-wedgewood-600 border-2 border-wedgewood-600 w-full p-5 rounded-xl">
          <StyledText className="font-poppinsBold text-xl text-center mb-4 text-wedgewood-950 dark:text-wedgewood-300">
            Add Routine
          </StyledText>

          <TextModal
            modalName="Routine Name"
            modalVisible={nameModalVisible}
            setModalVisible={setNameModalVisible}
            defaultValue={name}
            onSubmit={(text) => setName(text)}
          ></TextModal>

          <StyledPressable
            accessible={true}
            accessibilityLabel="Edit Name"
            className="border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 p-3 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => setNameModalVisible(true)}
          >
            <StyledText>
              <StyledText className="text-lg font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
                Name:
              </StyledText>
              <StyledText className="text-lg text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
                {" "}
                {name}{" "}
              </StyledText>
            </StyledText>
            <FontAwesomeIcon
              icon={faPencil}
              size={16}
              color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
            ></FontAwesomeIcon>
          </StyledPressable>

          <DayPicker
            scheduleDB={props.scheduleDB}
            setScheduleDB={props.setScheduleDB}
            weekdays={weekdays}
            setWeekdays={(weekdays) => {
              setWeekdays(weekdays);
            }}
          ></DayPicker>

          <StyledPressable
            accessible={true}
            accessibilityLabel="Finish"
            className="mt-4 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => {
              createNewRoutine(props.scheduleDB, props.setScheduleDB, name, weekdays);
              props.setModalVisible(false);
            }}
          >
            <StyledText className="mr-2 font-poppinsBold text-center text-wedgewood-950 dark:text-wedgewood-300">
              Finish
            </StyledText>
            <FontAwesomeIcon
              icon={faPencil}
              size={12}
              color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
            ></FontAwesomeIcon>
          </StyledPressable>
        </StyledView>
      </StyledTouchableOpacity>
    </Modal>
  );
}
