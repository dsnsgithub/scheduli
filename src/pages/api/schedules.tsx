// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";


export default function handler(req: NextApiRequest, res: NextApiResponse) {
	return res.json({
		"Default Schedule": "default",
		"SRVUSD": {
			"DVHS Schedule": "dvhs"
		}
	});
 }