import { styled } from "nativewind";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export default function LoadingModal(props: {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
      <StyledView className="fixed inset-0 flex w-full h-full items-center justify-center p-4 bg-black/60">
        <StyledView className="bg-wedgewood-100 dark:bg-wedgewood-950 dark:border-wedgewood-600 border-2 border-wedgewood-600 p-5 rounded-xl">
          <ActivityIndicator></ActivityIndicator>
          <StyledPressable
            accessible={true}
            accessibilityLabel="Cancel Download"
            className="mt-4 bg-wedgewood-300 rounded shadow-xl p-4 border-2 border-wedgewood-400 active:bg-wedgewood-500 dark:active:bg-wedgewood-800 flex flex-row items-center justify-center dark:bg-wedgewood-950 dark:border-wedgewood-600"
            onPress={() => {
              props.setModalVisible(false);
            }}
          >
            <StyledText className="font-poppinsBold text-center text-wedgewood-950 dark:text-wedgewood-300">
              Cancel
            </StyledText>
          </StyledPressable>
        </StyledView>
      </StyledView>
    </Modal>
  );
}
