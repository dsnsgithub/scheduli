import { FlexWidget, ImageWidget, ListWidget, TextWidget } from "react-native-android-widget";

import ScheduleIcon from "@/assets/dynamic/scheduleicon";
import findCorrectSchedule from "@/src/utils/findCorrectSchedule";
import parseScheduleDB from "@/src/utils/parseScheduleDB";
import storage from "@/src/utils/storage";

function formatDate(timestamp: number) {
  const date = new Date(timestamp); // Convert Unix timestamp to milliseconds
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return timeString;
}

export function ScheduleWidget(props: { currentDate: Date }) {
  if (
    !storage.getString("currentSchedule") ||
    storage.getString("currentSchedule") == "undefined"
  ) {
    return (
      <FlexWidget
        clickAction="MY_ACTION"
        clickActionData={{ id: 0 }}
        style={{
          height: "match_parent",
          width: "match_parent",
          backgroundColor: "#bfe0e2",
          borderStyle: "solid",
          borderColor: "#5faab1",
          borderRadius: 16,
          padding: 10,
          borderWidth: 4,
        }}
      >
        <FlexWidget
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "match_parent",
          }}
        >
          <ImageWidget
            image={ScheduleIcon(new Date().getDate())}
            imageWidth={40}
            imageHeight={40}
          />
          <TextWidget
            text="You have no schedule set up."
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: "#000000",
              marginLeft: 5,
            }}
          />
        </FlexWidget>
      </FlexWidget>
    );
  }

  const scheduleDB = parseScheduleDB(JSON.parse(storage.getString("currentSchedule")));
  const correctScheduleName = findCorrectSchedule(scheduleDB, new Date());

  if (findCorrectSchedule(scheduleDB, new Date()) == null) {
    return (
      <FlexWidget
        clickAction="MY_ACTION"
        clickActionData={{ id: 0 }}
        style={{
          height: "match_parent",
          width: "match_parent",
          backgroundColor: "#bfe0e2",
          borderStyle: "solid",
          borderColor: "#5faab1",
          borderRadius: 16,
          padding: 10,
          borderWidth: 4,
        }}
      >
        <FlexWidget
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "match_parent",
          }}
        >
          <ImageWidget
            image={ScheduleIcon(new Date().getDate())}
            imageWidth={40}
            imageHeight={40}
          />
          <TextWidget
            text="No events today."
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: "#000000",
              marginLeft: 5,
            }}
          />
        </FlexWidget>
      </FlexWidget>
    );
  }

  const scheduleTimes = scheduleDB["routines"][correctScheduleName]?.["events"];

  return (
    <FlexWidget
      clickAction="MY_ACTION"
      clickActionData={{ id: 0 }}
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#bfe0e2",
        borderStyle: "solid",
        borderColor: "#5faab1",
        borderRadius: 16,
        padding: 10,
        borderWidth: 4,
      }}
    >
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "match_parent",
        }}
      >
        <ImageWidget image={ScheduleIcon(new Date().getDate())} imageWidth={40} imageHeight={40} />
        <TextWidget
          text={`${scheduleDB["routines"][correctScheduleName]["officialName"]} Schedule`}
          style={{
            fontWeight: "bold",
            fontSize: 16,
            color: "#000000",
            marginLeft: 5,
          }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
          padding: 10,
          borderRadius: 16,
          height: 130,
          width: "match_parent",
          backgroundColor: "#92cace",
          marginTop: 10,
        }}
      >
        <ListWidget
          style={{
            height: "match_parent",
            width: "match_parent",
          }}
        >
          {scheduleTimes.map(({ startTime, endTime, periodName }) => {
            return (
              <FlexWidget
                key={startTime}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  width: "match_parent",
                  padding: 4,
                }}
              >
                <TextWidget
                  text={`${periodName}:`}
                  style={{
                    fontSize: 16,
                    color: "#000000",
                    fontWeight: "bold",
                    marginRight: 4,
                  }}
                ></TextWidget>
                <TextWidget
                  text={`${formatDate(startTime)} - ${formatDate(endTime)} `}
                  style={{ fontSize: 16, color: "#000000" }}
                ></TextWidget>
              </FlexWidget>
            );
          })}
        </ListWidget>
      </FlexWidget>

      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "match_parent",
          height: 20,
          marginTop: 5,
        }}
      >
        <TextWidget
          text={`${props.currentDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}  - Tap to Refresh`}
          style={{
            fontWeight: "bold",
            fontSize: 16,
            color: "#000000",
            marginLeft: 5,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
