//
//  Utility.swift
//  StatusWidget
//
//  Created by Dominic Seung on 9/21/24.
//

import Foundation

func getOrdinalNumber(_ number: String) -> String {
  // Try to convert the string to an integer
  if let numericValue = Int(number) {
    if numericValue == -1 {
      return "\(number)"
    }

    if numericValue % 100 >= 11 && numericValue % 100 <= 13 {
      return "\(numericValue)th"
    }

    switch numericValue % 10 {
    case 1:
      return "\(numericValue)st"
    case 2:
      return "\(numericValue)nd"
    case 3:
      return "\(numericValue)rd"
    default:
      return "\(numericValue)th"
    }
  } else {
    // Handle the case where the conversion to an integer fails
    return "\(number)"
  }

}

func createCustomDate(inputTime: String) -> TimeInterval {
  var currentDate = Date()

  let inputComponents = inputTime.components(separatedBy: ":")
  guard let inputHourRaw = inputComponents.first,
    let inputMinuteRaw = inputComponents.last
  else {
    return 0
  }

  let inputMinute = inputMinuteRaw.trimmingCharacters(in: .letters)

  if let inputHour = Int(inputHourRaw), let inputMinute = Int(inputMinute) {
    currentDate =
      Calendar.current.date(
        bySettingHour: inputHour,
        minute: inputMinute,
        second: 0,
        of: currentDate
      ) ?? Date()
  }

  return currentDate.timeIntervalSince1970
}

func formatTimeInterval(startInterval: TimeInterval, endInterval: TimeInterval)
  -> String
{
  let dateFormatter = DateFormatter()
  dateFormatter.dateFormat = "h:mm a"

  // Convert time intervals to dates
  let date1 = Date(timeIntervalSince1970: startInterval)
  let date2 = Date(timeIntervalSince1970: endInterval)

  // Format the dates as strings
  let timeString1 = dateFormatter.string(from: date1)
  let timeString2 = dateFormatter.string(from: date2)

  return "\(timeString1) to \(timeString2)"
}

func findCorrectPeriodName(periodName: String) -> String {
  guard let mmkv = MMKV(mmapID: "mmkv.default", mode: MMKVMode.multiProcess),
    let periodNamesString = mmkv.string(forKey: "periodNames"),
    let periodNamesData = periodNamesString.data(using: .utf8),
    let periodNames = try? JSONSerialization.jsonObject(
      with: periodNamesData,
      options: []
    )
      as? [String: String]
  else {
    return periodName
  }

  return periodNames[periodName] ?? periodName
}

func checkRemovedPeriods(period: String) -> Bool {
  guard let mmkv = MMKV(mmapID: "mmkv.default", mode: MMKVMode.multiProcess),
    let removedPeriodsString = mmkv.string(forKey: "removedPeriods"),
    let removedPeriodsData = removedPeriodsString.data(using: .utf8),
    let removedPeriodNames = try? JSONSerialization.jsonObject(
      with: removedPeriodsData,
      options: []
    ) as? [String]
  else {
    return false
  }

  return removedPeriodNames.contains(period)
}

func parseScheduleDB(scheduleDB: [String: Any]) -> [String: Any] {
  guard var routines = scheduleDB["routines"] as? [String: Any] else {
    return scheduleDB
  }

  for (scheduleName, schedule) in routines {
    guard scheduleName != "about",
      var events = (schedule as? [String: Any])?["events"] as? [[String: Any]]
    else {
      continue
    }

    for i in stride(from: events.count - 1, through: 0, by: -1) {
      guard let rawPeriodName = events[i]["name"] as? String else {
        continue
      }

      if checkRemovedPeriods(period: rawPeriodName) {
        events.remove(at: i)
        continue
      }

      var periodName = findCorrectPeriodName(periodName: rawPeriodName)
      if periodName.count == 1 {
        periodName = "\(getOrdinalNumber(periodName)) Period"
      }

      if let startTimeString = events[i]["startTime"] as? String,
        let endTimeString = events[i]["endTime"] as? String
      {
        events[i]["startTime"] = createCustomDate(inputTime: startTimeString)
        events[i]["endTime"] = createCustomDate(inputTime: endTimeString)
      }

      events[i]["periodName"] = periodName
    }

    guard let mmkv = MMKV(mmapID: "mmkv.default", mode: MMKVMode.multiProcess)
    else {
      continue
    }

    let passingPeriods = mmkv.bool(forKey: "passingPeriods")

    if passingPeriods {
      for i in stride(from: events.count - 1, through: 0, by: -1) {
        guard let eventName = events[i]["name"] as? String else {
          continue
        }

        if eventName == "Passing" {
          if i == events.count - 1 {
            events.remove(at: i)
            continue
          }
          if i == 0 {
            events.remove(at: i)
            continue
          }

          events[i]["periodName"] =
            "Passing - \(events[i + 1]["periodName"] as? String ?? "")"
        }
      }
    } else {
      for i in stride(from: events.count - 1, through: 0, by: -1) {
        guard let eventName = events[i]["name"] as? String else {
          continue
        }

        if eventName == "Passing" {
          events.remove(at: i)
        }
      }
    }

    if events.count >= 2 {
      let firstPeriod = events[0]["periodName"] as? String
      let lastPeriod = events[events.count - 1]["periodName"] as? String

      if firstPeriod == "Break" {
        events.removeFirst()
      }

      if lastPeriod == "Break" {
        events.removeLast()
      }
    }

    if var scheduleDict = schedule as? [String: Any] {
      scheduleDict["events"] = events
      routines[scheduleName] = scheduleDict
    }
  }

  var newScheduleDB = scheduleDB
  newScheduleDB["routines"] = routines
  return newScheduleDB  // Assuming other parts of the scheduleDB are not modified
}

func sameDay(_ d1: Date, _ d2: Date) -> Bool {
  return Calendar.current.isDate(d1, inSameDayAs: d2)
}

func parseUserDate(_ dateString: String) -> Date? {
  let dateFormatter = DateFormatter()
  dateFormatter.dateFormat = "yyyy-MM-dd"

  return dateFormatter.date(from: dateString)
}

func findCorrectSchedule(scheduleDB: [String: Any], currentDate: Date)
  -> String?
{
  let currentTime = currentDate.timeIntervalSince1970
  let dayOfTheWeek = Calendar.current.component(.weekday, from: currentDate) - 1
  var mostSpecificSchedule: String?
  var mostSpecificDate: Int?

  // Check for summer
  if let about = scheduleDB["about"] as? [String: Any],
    let endDateString = about["endDate"] as? String,
    let endDate = parseUserDate(endDateString),
    let startDateString = about["startDate"] as? String,
    let startDate = parseUserDate(startDateString),
    endDate.timeIntervalSince1970 < currentTime
      || startDate.timeIntervalSince1970 > currentTime
  {
    return nil
  }

  // Check for off days
  if let about = scheduleDB["about"] as? [String: Any],
    let inactiveDays = about["inactiveDays"] as? [[String: Any]]
  {
    for item in inactiveDays {
      if let days = item["days"] as? [Any] {
        if let startDateString = days[0] as? String,
          let endDateString = days[1] as? String,
          let startDate = parseUserDate(startDateString),
          let endDate = parseUserDate(endDateString)
        {
          let endDateAdjusted =
            Calendar.current.date(byAdding: .day, value: 1, to: endDate)
            ?? endDate

          if startDate.timeIntervalSince1970 < currentTime
            && endDateAdjusted.timeIntervalSince1970 > currentTime
          {
            return nil
          }
        }
      } else if let daysString = item["days"] as? String,
        let startDate = parseUserDate(daysString),
        let endDate = parseUserDate(daysString)
      {
        let endDateAdjusted =
          Calendar.current.date(byAdding: .day, value: 1, to: endDate)
          ?? endDate

        if startDate.timeIntervalSince1970 < currentTime
          && endDateAdjusted.timeIntervalSince1970 > currentTime
        {
          return nil
        }
      }
    }
  }

  if let routines = scheduleDB["routines"] as? [String: [String: Any]] {
    for (schedule, routine) in routines where schedule != "about" {
      if let days = routine["days"] as? [Any] {
        for day in days {
          if let dayNumber = day as? Int, dayNumber == dayOfTheWeek {
            if mostSpecificDate == nil {
              mostSpecificSchedule = schedule
              mostSpecificDate = dayNumber
            }
          } else if let dayArray = day as? [String],
            let startDate = parseUserDate(dayArray[0]),
            let endDate = parseUserDate(dayArray[1])
          {
            let endDateAdjusted =
              Calendar.current.date(byAdding: .day, value: 1, to: endDate)
              ?? endDate

            if startDate.timeIntervalSince1970 < currentTime
              && endDateAdjusted.timeIntervalSince1970 > currentTime
            {
              return schedule
            }
          } else if let dayString = day as? String,
            let parsedDay = parseUserDate(dayString),
            sameDay(currentDate, parsedDay)
          {
            return schedule
          }
        }
      }
    }
  }

  return mostSpecificSchedule
}
