import { styled } from "nativewind";
import { Text, View } from "react-native";
import { ProgressBar } from "react-native-paper";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledProgressBar = styled(ProgressBar);

export default function Status(props: {
  time: string;
  eventName: string;
  timeRange: string;
  percentage: number;
}) {
  return (
    <StyledView className="mt-10 bg-wedgewood-300 border-2 border-wedgewood-400 dark:bg-wedgewood-950 dark:border-wedgewood-600 py-10 px-5">
      {props.time ? (
        <StyledText
          className="text-7xl font-poppinsBold text-center text-wedgewood-950 dark:text-wedgewood-300"
          style={{ lineHeight: 80 }}
        >
          {props.time}
        </StyledText>
      ) : (
        ""
      )}
      {props.eventName ? (
        <StyledText className="text-2xl mt-4 mb-4 text-center text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          {props.eventName}
        </StyledText>
      ) : (
        ""
      )}
      {props.timeRange ? (
        <StyledText className="text-center text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          {props.timeRange}
        </StyledText>
      ) : (
        ""
      )}

      {props.percentage ? (
        <StyledProgressBar
          className="rounded-sm mx-5 mt-5 h-3"
          progress={props.percentage}
          color="#438e96"
        ></StyledProgressBar>
      ) : (
        ""
      )}
    </StyledView>
  );
}
