import React from "react";
import Image from "next/image";

import googlePlayBadge from "../../public/mobile/google-play-badge.png";
import appleBadge from "../../public/mobile/apple.svg";

import mainImg from "../../public/mobile/home.png";
import secondaryImg from "../../public/mobile/schedule.png";
import liquidGlass from "../../public/mobile/scheduli-liquid-glass.png";

export default function About() {
  return (
    <div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
      <div className="flex items-center justify-center flex-col shadow-xl rounded-lg p-10 lg:p-24 bg-wedgewood-200 border-wedgewood-300 border-2">
        <div className="lg:flex lg:flex-row items-center">
          <div className="lg:w-2/4 lg:mr-10">
            <div className="my-8">
              <Image
                src={liquidGlass}
                alt="Scheduli liquid glass image"
                width={200}
              ></Image>
            </div>
            <h2 className="text-4xl mt-4 font-bold">What is Scheduli? </h2>

            <h2 className="text-2xl mt-4">
              Scheduli is an app to track complicated school schedules, even
              during the most chaotic days.
            </h2>

            <div className="flex items-center">
              <a href="https://apps.apple.com/us/app/scheduli/id6470429917?platform=iphone">
                <Image
                  src={appleBadge}
                  alt="Download on the App Store"
                  width={160}
                ></Image>
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.scheduli.schedulimobile&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
                <Image
                  alt="Get it on Google Play"
                  width={200}
                  src={googlePlayBadge}
                />
              </a>
            </div>
          </div>
          <div className="md:flex flex-row items-center md:visible hidden">
            <Image src={mainImg} alt="Scheduli main image" height={600}></Image>
            <Image
              className="hidden xl:block"
              src={secondaryImg}
              alt="Scheduli secondary image"
              height={600}
            ></Image>
          </div>
        </div>

        <hr className="border-2 w-full my-12 border-wedgewood-300"></hr>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-wedgewood-50 rounded-2xl shadow-lg p-6 border-2 border-wedgewood-400 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mt-1">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Fully Customizable Routines
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Doesn{"'"}t lock you in to one schedule, completely
                  customizable and can be used for home, work, and school.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-wedgewood-50 rounded-2xl shadow-lg p-6 border-2 border-wedgewood-400 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-wedgewood-100 rounded-lg flex items-center justify-center mt-1">
                <svg
                  className="w-6 h-6 text-wedgewood-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Cross-Platform Support
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Cross-platform, available for download on iOS and Android, and
                  on web.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-wedgewood-50 rounded-2xl shadow-lg p-6 border-2 border-wedgewood-400 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Real-Time Widgets
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Real-time widgets on both iOS and Android to always stay on
                  top of your schedule.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-wedgewood-50 rounded-2xl shadow-lg p-6 border-2 border-wedgewood-400 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Live Notifications
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Notifications that display current event/progress to next
                  event (Android exclusive).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-wedgewood-50 rounded-2xl shadow-lg p-6 border-2 border-wedgewood-400 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mt-1">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  School Presets
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Schedule presets are avaliable for schools and colleges, which
                  are typically more accurate than competing apps.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-wedgewood-50 rounded-2xl shadow-lg p-6 border-2 border-wedgewood-400 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mt-1">
                <svg
                  className="w-6 h-6 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Offline-First Design
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Does not require internet access to use core functionality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
