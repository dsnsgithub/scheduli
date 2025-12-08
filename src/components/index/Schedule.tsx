export interface ScheduleDB {
  about: About;
  routines: Routines;
}

export interface Routines {
  [key: string]: Schedule;
}

export interface About {
  sync: boolean;
  lastUpdated: string;
  compatibleVersion: string;
  link: string;
  name: string;
  startDate: string;
  endDate: string;
  inactiveDays: any[];
  allEvents: string[];
}

export interface Schedule {
  officialName: string;
  days: any[];
  events: UnparsedEvent[];
  times: Time[];
}

export interface UnparsedEvent {
  rawPeriodName: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface Time {
  rawPeriodName: string;
  startTime: number;
  endTime: number;
}

export interface UpdatedTime {
  periodName: string;
  rawPeriodName: string;
  startTime: number;
  endTime: number;
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp); // Convert Unix timestamp to milliseconds
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return timeString;
}

// @ts-ignore
export default function Schedule(props: {
  scheduleTimes: UpdatedTime[];
  scheduleDB: ScheduleDB;
}) {
  return (
    <>
      <table className="w-full text-sm text-center bg-wedgewood-300 border-2 rounded-lg overflow-hidden shadow-md">
        <thead className="text-lg bg-wedgewood-300">
          <tr>
            <td scope="col" className="px-3 py-3">
              <b>Event</b>
            </td>
            <td scope="col" className="px-3 py-3">
              <b>Start Time</b>
            </td>
            <td scope="col" className="px-3 py-3">
              <b>End Time</b>
            </td>
          </tr>
        </thead>
        <tbody className="bg-wedgewood-200">
          {props.scheduleTimes.map(
            ({ rawPeriodName, startTime, endTime, periodName }) => {
              return (
                <tr key={startTime} className="border-wedgewood-300 border-t">
                  <td scope="row" className="px-3 py-3 font-medium">
                    {periodName}
                  </td>
                  <td className="px-3 py-3 font-medium">
                    {formatDate(startTime)}
                  </td>
                  <td className="px-3 py-3 font-medium">
                    {formatDate(endTime)}
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </>
  );
}
