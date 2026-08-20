import { styled } from "nativewind";
import { Image, Text, View } from "react-native";

import scheduleIcon from "@/assets/dynamic/scheduleicon";
import Wrapper from "@/src/components/Wrapper";

const StyledView = styled(View);
const StyledImage = styled(Image);
const StyledText = styled(Text);

export default function ScheduliWrapper(props: { currentDate: Date; children: React.ReactNode }) {
  return (
    <Wrapper>
      <StyledView className="mb-3 ml-4 flex-row items-center">
        <StyledImage source={scheduleIcon(props.currentDate.getDate())} className="w-14 h-14" />
        <StyledText className="ml-4 mt-2 text-3xl text-wedgewood-950 dark:text-wedgewood-300 font-poppinsBold">
          Scheduli
        </StyledText>
      </StyledView>

      {props.children}
    </Wrapper>
  );
}
