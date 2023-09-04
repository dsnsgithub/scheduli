// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from "fs";
import path from "path";

function createCustomDate(inputTime: string) {
	const currentDate = new Date();

	const [inputHourRaw, inputMinuteRaw] = inputTime.split(":");
	const inputMinute = inputMinuteRaw.replace(/[A-Za-z]/g, ""); // Remove any non-numeric characters
	const isPM = inputTime.includes("PM");

	let hour = parseInt(inputHourRaw);
	if (isPM && hour !== 12) {
		hour += 12;
	} else if (hour == 12 && !isPM) {
		hour -= 12;
	}

	currentDate.setHours(hour, parseInt(inputMinute), 0, 0);
	return currentDate.getTime();
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const school = req.query.school

  if (typeof school !== "string") {
    res.status(400).json({ error: "Invalid request!!" });
  }

  try {
    const schoolFolder = path.join(__dirname, `../../../../../src/database/${school}`);
    const scheduleDB = JSON.parse(fs.readFileSync(path.join(schoolFolder, "/schedule.json"), "utf-8"));

    for (const scheduleName in scheduleDB) {
      if (scheduleName == "about") continue;
      const scheduleArray = fs.readFileSync(path.join(schoolFolder, `${scheduleName}.txt`), "utf-8").split("\n");

      scheduleDB[scheduleName]["times"] = [];
      for (const line of scheduleArray) {
        let [rawPeriodName, startTime, endTime] = line.split(" ");
        scheduleDB[scheduleName]["times"].push({
          rawPeriodName: rawPeriodName,
          startTime: createCustomDate(startTime),
          endTime: createCustomDate(endTime)
        });
      }
    }

    res.status(200).json(scheduleDB);

  } catch (error) {
      console.error(error);
      console.log();
      res.status(400).json({ error: "Invalid request!!" });
  }

}
