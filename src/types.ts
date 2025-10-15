export type UnparsedDay = string | number;
export type ParsedDay = number | Date;

export interface Schedule {
  about: {
    sync: boolean;
    lastUpdated: string;
    compatibleVersion: string;
    link: string;
    name: string;
    startDate: string;
    endDate: string;
    inactive: (ParsedDay | [ParsedDay, ParsedDay])[];
    inactiveDays: { description: string; days: ParsedDay | ParsedDay[] }[];
    allEvents: string[];
  };
  routines: {
    [key: string]: {
      officialName: string;
      days: ParsedDay[];
      events: ParsedEvent[];
    };
  };
}

export interface UnparsedEvent {
  rawPeriodName: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface ParsedEvent {
  rawPeriodName: string;
  name: string;
  startTime: number;
  endTime: number;
  periodName: string;
  userCreated?: boolean;
}

export interface UnparsedSchedule {
  about: {
    sync: boolean;
    lastUpdated: string;
    compatibleVersion: string;
    link: string;
    name: string;
    startDate: string;
    endDate: string;
    inactive: (UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[];
    inactiveDays: {
      description: string;
      days: UnparsedDay | UnparsedDay[];
    }[];
    allEvents: string[];
  };
  routines: {
    [key: string]: {
      officialName: string;
      days: (UnparsedDay | [UnparsedDay, UnparsedDay] | UnparsedDay[])[];
      events: UnparsedEvent[];
      userCreated?: boolean;
    };
  };
}

export interface ScheduleList {
  [key: string]:
    | {
        [key: string]: string;
      }
    | string;
}

export interface PeriodNames {
  [key: string]: string | null;
}
