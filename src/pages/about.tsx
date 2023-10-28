import React from "react";
import Link from "next/link";

import Image from "next/image";
import homepageDark from "../../public/mobile/homepageDark.png";
import homepageLight from "../../public/mobile/homepageLight.png";
import googlePlayBadge from "../../public/mobile/google-play-badge.png";
import appleBadge from "../../public/mobile/black.svg";

export default function About() {
	return (
		<div className="container mx-auto mt-10 flex flex-col justify-center lg:p-8">
			<div className="flex items-center justify-center flex-col shadow-xl rounded-lg p-10 lg:p-24 bg-wedgewood-200 border-wedgewood-300 border-2">
				<div className="flex flex-row items-center">
					<div className="w-2/4 mr-10">
						<h2 className="text-4xl mt-4 font-bold">What is Scheduli? </h2>

						<h2 className="text-2xl mt-4">
							Scheduli is a <b>general-purpose</b> schedule app available on iOS and Android that keeps you informed about your daily schedule, even during the most chaotic days.
						</h2>

						<div className="flex items-center">
							<a href="https://apps.apple.com/us/app/scheduli/id6470429917?itsct=apps_box_badge&amp;itscg=30200">
								<Image src={appleBadge} alt="Download on the App Store" width={240}></Image>
							</a>
							<a href="https://play.google.com/store/apps/details?id=com.scheduli.schedulimobile&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
								<Image alt="Get it on Google Play" width={300} src={googlePlayBadge} />
							</a>
						</div>
					</div>
					<div className="flex flex-row items-center">
						<Image src={homepageLight} alt="Scheduli Home page dark" height={600} className="mr-4"></Image>
						<Image src={homepageDark} alt="Scheduli Home page dark" height={600}></Image>
					</div>
				</div>

				<hr className="border-2 w-full mt-8 border-wedgewood-300"></hr>

				<h2 className="text-4xl mt-10 font-bold">Why Scheduli over competing apps? </h2>

				<h2 className="text-2xl mt-4 mb-4">Scheduli offers a number of benefits against competing apps.</h2>
				<ul className="list-disc text-lg">
					<li>Scheduli is a general-purpose schedule app, routines are completely customizable and can be used for home, work, and school.</li>
					<li>
						Cross platform, <b>available on both Android and iOS</b>
					</li>
					<li>Notifications that display current event/progress to next event</li>
					<li>School schedule presets are more updated/accurate</li>
					<li>Does not require internet access to use core functionality</li>
				</ul>
			</div>
		</div>
	);
}
