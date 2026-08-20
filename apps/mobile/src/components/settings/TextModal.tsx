import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { styled } from "nativewind";
import { useRef, useState } from "react";
import {
  useColorScheme,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledPressable = styled(Pressable);

export default function TextModal(props: {
  modalName: string;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (text: string) => void;
  defaultValue: string;
}) {
  const [textValue, setTextValue] = useState(props.defaultValue);
  const inputRef = useRef<TextInput>(null);

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
            {props.modalName}:{" "}
          </StyledText>

          <StyledTextInput
            ref={inputRef}
            className="rounded shadow outline-none border-2 border-wedgewood-400 focus:border-wedgewood-600 p-2 bg-wedgewood-300 mb-5 dark:bg-wedgewood-950 dark:border-wedgewood-600 text-wedgewood-950 dark:text-wedgewood-300 font-poppins"
            defaultValue={props.defaultValue}
            onChangeText={(newText) => setTextValue(newText)}
            maxLength={32}
            onLayout={() => {
              setTimeout(() => inputRef.current.focus(), 150);
            }}
          ></StyledTextInput>

          <StyledPressable
            accessible={true}
            accessibilityLabel="Finish"
            className="mt-4 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => {
              props.onSubmit(textValue);
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
