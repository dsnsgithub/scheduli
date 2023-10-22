import React from "react";
import Link from "next/link";

import Image from "next/image";
import homepagedark from "../../public/mobile/homepagedark.png";
import changeperiodname from "../../public/mobile/changeperiodname.png";
import homepagelight from "../../public/mobile/homepagelight.png";
import importschedule from "../../public/mobile/importschedule.png";
import notification from "../../public/mobile/notification.png";
import scheduledark from "../../public/mobile/scheduledark.png";

export default function About() {
	return (
		<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
			<div className="flex items-center justify-center flex-col shadow-xl rounded-lg p-10 lg:p-24 bg-wedgewood-200 border-wedgewood-300 border-2">
				<div className="flex flex-row items-center">
					<div className="w-2/4 mr-10">
						<h2 className="text-4xl mt-4 font-bold">What is Scheduli? </h2>

						<h2 className="text-2xl mt-4">
							Scheduli is a <b>general-purpose</b> schedule app avaliable on iOS and Android that keeps you informed about your daily schedule, even during the most chaotic days.
						</h2>

						<h2 className="text-2xl mt-4">Avaliable on the App Store & Google Play Store soon.</h2>
					</div>
					<div className="flex flex-row items-center">
						<Image src={homepagelight} alt="Scheduli Home page dark" height={600} className="mr-4"></Image>
						<Image src={homepagedark} alt="Scheduli Home page dark" height={600}></Image>
					</div>
				</div>

				<hr className="border-2 w-full mt-8 border-wedgewood-300"></hr>

				<h2 className="text-4xl mt-10 font-bold">Why Scheduli over competing apps? </h2>

				<h2 className="text-2xl mt-4 mb-4">Scheduli offers a number of benefits against competing apps.</h2>
				<ul className="list-disc text-lg">
					<li>Scheduli is a general-purpose schedule app, routines are completely customizable and can be used for home, work, and school.</li>
					<li>
						Cross platform, <b>avaliable on both Android and iOS</b>
					</li>
					<li>Notifications that display current event/progress to next event</li>
					<li>School schedule presets are more updated/accurate</li>
					<li>Does not require internet access to use core functionality</li>
				</ul>
			</div>
		</div>
	);
}
