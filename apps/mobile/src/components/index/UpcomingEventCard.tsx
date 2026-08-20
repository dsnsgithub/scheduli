import { styled } from "nativewind";
import { Pressable, Text, View } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = {
  title: string;
  subtitle: string;
  daysUntil: number;
  pressable?: boolean;
  accessibilityLabel?: string;
};

export default function UpcomingEventCard({
  title,
  subtitle,
  daysUntil,
  pressable = true,
  accessibilityLabel,
}: Props) {
  const Wrapper = pressable ? StyledPressable : StyledView;

  return (
    <Wrapper
      accessible
      accessibilityLabel={accessibilityLabel || title}
      className="rounded shadow-lg bg-wedgewood-300 p-4 border-2 border-wedgewood-400 mt-2 flex flex-row items-center justify-between dark:bg-wedgewood-950 dark:border-wedgewood-600 active:bg-wedgewood-500 dark:active:bg-wedgewood-800"
    >
      <StyledView>
        <StyledText className="text-wedgewood-950 dark:text-wedgewood-300 text-lg font-poppinsBold">
          {title}
        </StyledText>
        <StyledText className="text-wedgewood-950 dark:text-wedgewood-300 font-poppins">
          {subtitle}
        </StyledText>
      </StyledView>
      <StyledView>
        <StyledText className="text-xl font-poppinsBold text-wedgewood-950 dark:text-wedgewood-300">
          {daysUntil}d
        </StyledText>
      </StyledView>
    </Wrapper>
  );
}
