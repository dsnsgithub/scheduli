//
//  StatusWidget.swift
//  StatusWidget
//
//  Created by Dominic Seung on 11/15/23.
//

import Foundation
import SwiftUI
import WidgetKit

struct Provider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> SimpleEntry {
    return SimpleEntry(
      date: Date(),
      configuration: ConfigurationAppIntent(),
      currentSchedule: "Regular Schedule",
      endEventDate: Date(),
      timePeriod: "10:40 AM - 11:10 AM",
      currentEvent: "End of 1st Period"
    )

  }

  func snapshot(for configuration: ConfigurationAppIntent, in context: Context)
    async -> SimpleEntry
  {
    let groupDir = FileManager.default.containerURL(
      forSecurityApplicationGroupIdentifier: "group.scheduli"
    )?.path
    MMKV.initialize(
      rootDir: nil,
      groupDir: groupDir ?? "/",
      logLevel: MMKVLogLevel.info
    )

    let scheduleDB = parseScheduleDB(scheduleDB: MMKVWrapper().getScheduleDB())

    // Find the current routine for today’s date
    guard
      let currentRoutine = findCorrectSchedule(
        scheduleDB: scheduleDB,
        currentDate: Date()
      ),
      let routines = scheduleDB["routines"] as? [String: [String: Any]],
      let currentSchedule = routines[currentRoutine],
      let officialName = currentSchedule["officialName"] as? String,
      let events = currentSchedule["events"] as? [[String: Any]]
    else {

      // If no schedule or routine is found, return a "No Schedule" entry
      return SimpleEntry(
        date: Date(),
        configuration: configuration,
        currentSchedule: "",
        endEventDate: nil,
        timePeriod: nil,
        currentEvent: "No Events Today!"
      )
    }

    for event in events {
      if let startTime = event["startTime"] as? TimeInterval,
        let endTime = event["endTime"] as? TimeInterval,
        let eventName = event["periodName"] as? String
      {
        if Date().timeIntervalSince1970 < startTime {
          return SimpleEntry(
            date: Date(),
            configuration: configuration,
            currentSchedule: "\(officialName) Schedule",
            endEventDate: Date(timeIntervalSince1970: startTime),
            timePeriod: formatTimeInterval(
              startInterval: startTime,
              endInterval: endTime
            ),
            currentEvent: "Until \(eventName)"
          )
        }
      }
    }

    if let lastEvent = events.last,
      let lastStartTime = lastEvent["startTime"] as? TimeInterval,
      let lastEndTime = lastEvent["endTime"] as? TimeInterval,
      let lastEventName = lastEvent["periodName"] as? String
    {
      if Date().timeIntervalSince1970 < lastEndTime {
        return SimpleEntry(
          date: Date(),
          configuration: configuration,
          currentSchedule: "\(officialName) Schedule",
          endEventDate: Date(timeIntervalSince1970: lastEndTime),
          timePeriod: formatTimeInterval(
            startInterval: lastStartTime,
            endInterval: lastEndTime
          ),
          currentEvent: "End of \(lastEventName)"
        )
      }
    }

    // If no events are ongoing and none are upcoming
    return SimpleEntry(
      date: Date(),
      configuration: configuration,
      currentSchedule: "\(officialName) Schedule",
      endEventDate: nil,
      timePeriod: nil,
      currentEvent: "All events are over!"
    )
  }

  func timeline(for configuration: ConfigurationAppIntent, in context: Context)
    async -> Timeline<
      SimpleEntry
    >
  {
    let groupDir = FileManager.default.containerURL(
      forSecurityApplicationGroupIdentifier: "group.scheduli"
    )?.path
    MMKV.initialize(
      rootDir: nil,
      groupDir: groupDir ?? "/",
      logLevel: MMKVLogLevel.info
    )

    var entries: [SimpleEntry] = []

    let scheduleDB = parseScheduleDB(scheduleDB: MMKVWrapper().getScheduleDB())

    // Find the current routine for today’s date
    guard
      let currentRoutine = findCorrectSchedule(
        scheduleDB: scheduleDB,
        currentDate: Date()
      ),
      let routines = scheduleDB["routines"] as? [String: [String: Any]],
      let currentSchedule = routines[currentRoutine],
      let officialName = currentSchedule["officialName"] as? String,
      let events = currentSchedule["events"] as? [[String: Any]]
    else {

      // If no schedule or routine is found, return a "No Schedule" entry
      entries.append(
        SimpleEntry(
          date: Date(),
          configuration: configuration,
          currentSchedule: nil,
          endEventDate: nil,
          timePeriod: nil,
          currentEvent: "No Events Today!"
        )
      )
      return Timeline(
        entries: entries,
        policy: .after(
          Calendar.current.startOfDay(
            for: Calendar.current.date(byAdding: .day, value: 1, to: Date())!
          )
        )
      )
    }

    var widgetStart = Calendar.current.startOfDay(for: Date())

    for event in events {
      if let startTime = event["startTime"] as? TimeInterval,
        let endTime = event["endTime"] as? TimeInterval,
        let eventName = event["periodName"] as? String
      {

        entries.append(
          SimpleEntry(
            date: widgetStart,
            configuration: configuration,
            currentSchedule: "\(officialName) Schedule",
            endEventDate: Date(timeIntervalSince1970: startTime),
            timePeriod: formatTimeInterval(
              startInterval: startTime,
              endInterval: endTime
            ),
            currentEvent: "Start of \(eventName)"
          )
        )

        entries.append(
          SimpleEntry(
            date: Date(timeIntervalSince1970: startTime),
            configuration: configuration,
            currentSchedule: "\(officialName) Schedule",
            endEventDate: Date(timeIntervalSince1970: endTime),
            timePeriod: formatTimeInterval(
              startInterval: startTime,
              endInterval: endTime
            ),
            currentEvent: "End of \(eventName)"
          )
        )

        widgetStart = Date(timeIntervalSince1970: endTime)
      }
    }

    if let lastEvent = events.last,
      let lastEndTime = lastEvent["endTime"] as? TimeInterval
    {

      // Add an entry for the end of all events
      entries.append(
        SimpleEntry(
          date: Date(timeIntervalSince1970: lastEndTime),
          configuration: configuration,
          currentSchedule: "\(officialName) Schedule",
          endEventDate: nil,
          timePeriod: nil,
          currentEvent: "All events are over!"
        )
      )

    }

    return Timeline(
      entries: entries,
      policy: .after(
        Calendar.current.startOfDay(
          for: Calendar.current.date(byAdding: .day, value: 1, to: Date())!
        )
      )
    )
  }
}

struct SimpleEntry: TimelineEntry {
  let date: Date
  let configuration: ConfigurationAppIntent
  let currentSchedule: String?
  let endEventDate: Date?
  let timePeriod: String?
  let currentEvent: String?
}

struct StatusWidgetEntryView: View {
  var entry: Provider.Entry

  @Environment(\.widgetFamily) var family

  var body: some View {
    switch family {
    case .systemMedium:
      VStack {
        VStack {
          if entry.endEventDate != nil {
            Text(entry.endEventDate ?? Date(), style: .relative).font(
              .system(size: 30, weight: .bold)
            ).foregroundColor(Color("TextColor")).multilineTextAlignment(
              .center
            )
          }

          if entry.currentEvent != nil && entry.endEventDate == nil {
            Text(entry.currentEvent ?? "")
              .font(.system(size: 22, weight: .bold))
              .foregroundColor(Color("TextColor"))
              .multilineTextAlignment(.center)
          }

          if entry.currentEvent != nil && entry.endEventDate != nil {
            Text(entry.currentEvent ?? "")
              .font(.system(size: 18, weight: .bold))
              .foregroundColor(Color("TextColor"))
              .multilineTextAlignment(.center)
          }
        }.padding().background(Color("AccentColor")).cornerRadius(10)

        Text(entry.timePeriod ?? "")
          .font(.system(size: 14))
          .foregroundColor(Color("TextColor"))
          .multilineTextAlignment(.center)

        if entry.currentSchedule != nil {
          Text(entry.currentSchedule ?? "").font(.system(size: 14))
            .multilineTextAlignment(.center).foregroundColor(Color("TextColor"))
        }

      }.padding().containerBackground(
        MMKVWrapper().getColorScheme() == "dark"
          ? Color("DarkBackground") : Color("WidgetBackground"),
        for: .widget
      ).preferredColorScheme(
        MMKVWrapper().getColorScheme() == "dark" ? .dark : .light
      )

    default:
      VStack {
        VStack {
          if entry.endEventDate != nil {
            Text(entry.endEventDate ?? Date(), style: .timer).font(
              .system(size: 24, weight: .bold)
            ).foregroundColor(Color("TextColor")).multilineTextAlignment(
              .center
            )
          }

          if entry.currentEvent != nil && entry.endEventDate == nil {
            Text(entry.currentEvent ?? "")
              .font(.system(size: 20, weight: .bold))
              .foregroundColor(Color("TextColor"))
              .multilineTextAlignment(.center)
          }
        }.padding().background(Color("AccentColor")).cornerRadius(10)

        if entry.currentEvent != nil && entry.endEventDate != nil {
          Text(entry.currentEvent ?? "")
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(Color("TextColor"))
            .multilineTextAlignment(.center)
            .padding(.top, 6)
        }

        if let timePeriod = entry.timePeriod {
          Text(timePeriod)
            .font(.system(size: 12))
            .foregroundColor(Color("TextColor"))
            .multilineTextAlignment(.center)
        }
      }.containerBackground(
        MMKVWrapper().getColorScheme() == "dark"
          ? Color("DarkBackground") : Color("WidgetBackground"),
        for: .widget
      ).preferredColorScheme(
        MMKVWrapper().getColorScheme() == "dark" ? .dark : .light
      )
    }
  }
}

struct StatusWidget: Widget {
  let kind: String = "StatusWidget"

  var body: some WidgetConfiguration {
    AppIntentConfiguration(
      kind: kind,
      intent: ConfigurationAppIntent.self,
      provider: Provider()
    ) {
      entry in
      StatusWidgetEntryView(entry: entry).environment(
        \.colorScheme,
        MMKVWrapper().getColorScheme() == "dark" ? .dark : .light
      )
    }.supportedFamilies([.systemMedium, .systemSmall])
  }
}

struct StatusWidgetView_Previews: PreviewProvider {
  static var previews: some View {
    Group {
      StatusWidgetEntryView(
        entry: SimpleEntry(
          date: Date(),
          configuration: ConfigurationAppIntent(),
          currentSchedule: "Regular Schedule",
          endEventDate: Date(),
          timePeriod: "10:40 AM - 11:10 AM",
          currentEvent: "End of 1st Period"
        )
      )
      .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
  }
}
