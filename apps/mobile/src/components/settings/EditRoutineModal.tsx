import { faPencil, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { UnparsedDay, UnparsedSchedule, UnparsedEvent } from "@scheduli/types";
import { useRouter } from "expo-router";
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

import AddActiveModal from "./AddActiveModal";
import ActiveDayModal from "./EditActiveModal";
import TextModal from "./TextModal";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledTouchableOpacity = styled(TouchableOpacity);

function editRoutine(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  currentRoutine: string,
  property: string,
  value: string | UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[] | UnparsedEvent[],
) {
  if (property == "officialName" && !value) return Alert.alert("Error", "You must provide a name.");

  const newSchedule = { ...schedule };

  if (
    property == "officialName" &&
    typeof value === "string" &&
    newSchedule["routines"][value] &&
    currentRoutine != value
  ) {
    return Alert.alert("Error", "Routine with same name already exists.");
  }

  newSchedule["routines"][currentRoutine][property] = value;

  setSchedule(newSchedule);
  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

function deleteRoutine(
  schedule: UnparsedSchedule,
  setSchedule: React.Dispatch<React.SetStateAction<UnparsedSchedule>>,
  currentRoutine: string,
) {
  const newSchedule = { ...schedule };
  delete newSchedule["routines"][currentRoutine];

  storage.set("currentSchedule", JSON.stringify(newSchedule));
}

export default function EditRoutineModal(props: {
  weekdays: (UnparsedDay | UnparsedDay[] | [UnparsedDay, UnparsedDay])[];
  setWeekdays: React.Dispatch<
    React.SetStateAction<(UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[]>
  >;
  currentRoutine: string;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleDB: UnparsedSchedule;
  setScheduleDB: React.Dispatch<React.SetStateAction<UnparsedSchedule>>;
}) {
  const [name, setName] = useState(
    props.scheduleDB["routines"][props.currentRoutine]["officialName"],
  );
  const [nameModalVisible, setNameModalVisible] = useState(false);

  const [createDayModalVisible, setCreateDayModalVisible] = useState(false);

  const router = useRouter();
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
          <StyledView className="flex flex-row items-center justify-between">
            <StyledText className="font-poppinsBold text-xl text-center mb-4 text-wedgewood-950 dark:text-wedgewood-300">
              Edit Routine
            </StyledText>

            <StyledPressable
              accessible={true}
              accessibilityLabel="Delete Routine"
              className="bg-red-400 rounded-md p-3 mb-4"
              onPress={() => {
                Alert.alert("Warning", "Are you sure you want to delete this routine?", [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      deleteRoutine(props.scheduleDB, props.setScheduleDB, props.currentRoutine);
                      props.setModalVisible(false);
                      router.replace("/settings");
                    },
                  },
                ]);
              }}
            >
              <FontAwesomeIcon icon={faTrashCan} size={18}></FontAwesomeIcon>
            </StyledPressable>
          </StyledView>

          <AddActiveModal
            modalVisible={createDayModalVisible}
            setModalVisible={setCreateDayModalVisible}
            scheduleDB={props.scheduleDB}
            setScheduleDB={props.setScheduleDB}
            weekdays={props.weekdays}
            setWeekdays={props.setWeekdays}
            currentRoutine={props.currentRoutine}
          ></AddActiveModal>

          <TextModal
            modalName="Routine Name"
            modalVisible={nameModalVisible}
            setModalVisible={setNameModalVisible}
            defaultValue={name}
            onSubmit={(text) => {
              if (!text) {
                return Alert.alert("Error", "You must provide a name.");
              }

              if (props.scheduleDB["routines"][text]) {
                return Alert.alert("Error", "Routine with same name already exists.");
              }

              setName(text);
            }}
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

          <StyledView className="border-2 border-wedgewood-400 rounded shadow bg-wedgewood-300 mt-2 py-4 p-3 dark:bg-wedgewood-950 dark:border-wedgewood-600">
            <StyledText className="text-lg font-poppinsBold mb-2 text-wedgewood-950 dark:text-wedgewood-300">
              Special Active Days:
            </StyledText>

            <StyledView className="flex flex-row items-center flex-wrap">
              {props.weekdays
                .filter((item) => typeof item == "string" || typeof item == "object")
                .map((item) => {
                  return (
                    <ActiveDayModal
                      key={String(item)}
                      weekdays={props.weekdays}
                      setWeekdays={props.setWeekdays}
                      scheduleDB={props.scheduleDB}
                      setScheduleDB={props.setScheduleDB}
                      currentRoutine={props.currentRoutine}
                      activeDay={item}
                    ></ActiveDayModal>
                  );
                })}

              <StyledPressable
                className="rounded shadow-lg bg-wedgewood-400 p-3 border-2 border-wedgewood-500 m-1 dark:bg-wedgewood-950 dark:border-wedgewood-600"
                onPress={() => setCreateDayModalVisible(true)}
                accessible={true}
                accessibilityLabel="Create Active Day"
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  size={14}
                  color={colorScheme == "dark" ? "#92cace" : "#1a2c32"}
                ></FontAwesomeIcon>
              </StyledPressable>
            </StyledView>
          </StyledView>

          <StyledPressable
            className="mt-4 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
            accessible={true}
            accessibilityLabel="Finish"
            onPress={() => {
              editRoutine(
                props.scheduleDB,
                props.setScheduleDB,
                props.currentRoutine,
                "officialName",
                name,
              );
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
