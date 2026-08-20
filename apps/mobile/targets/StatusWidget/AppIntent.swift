//
//  AppIntent.swift
//  StatusWidget
//
//  Created by Dominic Seung on 11/12/23.
//

import AppIntents
import WidgetKit

struct ConfigurationAppIntent: WidgetConfigurationIntent {
  static var title: LocalizedStringResource = "Configuration"
  static var description = IntentDescription("This is an Scheduli widget.")

  //  @Parameter(title: "Dark Mode", default: false)
  //  var darkMode: Bool
}
