import type { NextApiRequest, NextApiResponse } from "next";

export default function ping(req: NextApiRequest, res: NextApiResponse): void {
    res.status(200).send("Pong!");
}