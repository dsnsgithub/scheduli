// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";


export default function handler(req: NextApiRequest, res: NextApiResponse) {
	return res.json({
		"Default Schedule": "default",
		"SRVUSD": {
			"DVHS Schedule": "dvhs",
			"GRMS 6th Grade Schedule": "grms6",
			"GRMS 7th-8th Grade Schedule": "grms78",
			"Cal High Schedule": "dvhs",
			"SRVHS Schedule": "srvhs",
			"Del Amigo Schedule": "delamigo",
			"MVHS Schedule": "mvhs",
			"SR Transition Schedule": "srtransition"
		}
	});
 }