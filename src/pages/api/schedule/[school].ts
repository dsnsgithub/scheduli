// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from "fs";
import path from "path";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const school = req.query.school

  if (typeof school !== "string") {
    res.status(400).json({ error: "Invalid request!!" });
  }

  try {
    const schoolFolder = path.join(process.cwd(), `/database/${school}`);
    const scheduleDB = JSON.parse(fs.readFileSync(path.join(schoolFolder, "/schedule.json"), "utf-8"));

    for (const scheduleName in scheduleDB) {
      if (scheduleName == "about") continue;
      const scheduleArray = fs.readFileSync(path.join(schoolFolder, `${scheduleName}.txt`), "utf-8").split("\n");

      scheduleDB[scheduleName]["times"] = [];
      for (const line of scheduleArray) {
        let [rawPeriodName, startTime, endTime] = line.split(" ");
        scheduleDB[scheduleName]["times"].push({
          rawPeriodName: rawPeriodName,
          startTime: startTime,
          endTime: endTime
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
