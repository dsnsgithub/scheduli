import { styled } from "nativewind";
import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

export default function Wrapper(props: { children: React.ReactNode }) {
  return (
    <StyledSafeAreaView
      className={`bg-wedgewood-100 dark:bg-black flex-1${
        Platform.OS == "android" ? " py-6 pb-20" : ""
      }`}
    >
      <StyledScrollView>
        <StyledView className="p-4">{props.children}</StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}
