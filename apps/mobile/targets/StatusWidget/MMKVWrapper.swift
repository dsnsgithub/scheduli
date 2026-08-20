//
//  MMKVWrapper.swift
//  StatusWidget
//
//  Created by Dominic Seung on 9/21/24.
//

import Foundation

class MMKVWrapper: NSObject {
  @objc func getScheduleDB() -> [String: Any] {
    guard let mmkv = MMKV(mmapID: "mmkv.default", mode: MMKVMode.multiProcess)
    else {
      return [:]
    }

    let data = mmkv.data(forKey: "currentSchedule") ?? Data()

    do {
      return try JSONSerialization.jsonObject(with: data, options: [])
        as? [String: Any] ?? [:]
    } catch {
      return [:]
    }
  }

  @objc func getColorScheme() -> String {
    let groupDir = FileManager.default.containerURL(
      forSecurityApplicationGroupIdentifier: "group.scheduli"
    )?.path
    MMKV.initialize(
      rootDir: nil,
      groupDir: groupDir ?? "/",
      logLevel: MMKVLogLevel.info
    )

    guard let mmkv = MMKV(mmapID: "mmkv.default", mode: MMKVMode.multiProcess)
    else {
      return "light"
    }

    let data = mmkv.string(forKey: "colorScheme") ?? "light"
    return data
  }
}
