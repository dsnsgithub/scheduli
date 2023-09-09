// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const school = req.query.school;

	if (typeof school !== "string") {
		res.status(400).json({ error: "Invalid request!!" });
	}

	try {
		if (school == "default") {
			return res.status(200).json({
				about: {
					name: "New Schedule!",
					inactive: [],
					allEvents: ["Event 1", "Event 2"],
					startDate: "2023-09-06",
					endDate: "2030-09-08"
				},
				routines: {
					"Routine 1": {
						officialName: "Routine 1",
						days: [0, 1, 2, 3, 4, 5, 6],
						events: [
							{
								name: "Event 1",
								startTime: "08:40",
								endTime: "08:45"
							},
							{
								name: "Event 2",
								startTime: "09:40",
								endTime: "10:45"
							}
						]
					}
				}
			});
		}

		const schoolFolder = path.join(process.cwd(), `/database/${school}`);
		const scheduleDB = JSON.parse(fs.readFileSync(path.join(schoolFolder, "/schedule.json"), "utf-8"));

		for (const scheduleName in scheduleDB["routines"]) {
			if (scheduleName == "about") continue;
			const scheduleArray = fs.readFileSync(path.join(schoolFolder, `${scheduleName}.txt`), "utf-8").split("\n");

			scheduleDB["routines"][scheduleName]["events"] = [];
			for (const line of scheduleArray) {
				let [rawPeriodName, startTime, endTime] = line.split(" ");

				rawPeriodName = rawPeriodName.replace(/(\r\n|\n|\r)/gm, "");
				startTime = startTime.replace(/(\r\n|\n|\r)/gm, "");
				endTime = endTime.replace(/(\r\n|\n|\r)/gm, "");

				if (rawPeriodName == "Passing") continue;

				let [startHour, startMinute] = startTime.split(":");

				if (startMinute.includes("PM") && Number(startHour) != 12) {
					startTime = String(Number(startHour) + 12) + ":" + startMinute;
				}
				startTime = startTime.slice(0, -2);

				let [endHour, endMinute] = endTime.split(":");

				if (endMinute.includes("PM") && Number(endHour) != 12) {
					endTime = String(Number(endHour) + 12) + ":" + endMinute;
				}
				endTime = endTime.slice(0, -2);

				if (startTime.split(":")[0].length == 1) {
					startTime = "0" + startTime;
				}

				if (endTime.split(":")[0].length == 1) {
					endTime = "0" + endTime;
				}

				scheduleDB["routines"][scheduleName]["events"].push({
					rawPeriodName: rawPeriodName,
					name: rawPeriodName,
					startTime: startTime,
					endTime: endTime
				});
			}
		}

		return res.status(200).json(scheduleDB);
	} catch (error) {
		// console.error(error)
		return res.status(400).json({ error: "Invalid request!!" });
	}
}
