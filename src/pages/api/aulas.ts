import type { NextApiRequest, NextApiResponse } from "next";
import * as mongooseClient from "../../database/mongooseClient";
import httpStatus from "../../lib/httpStatus";
import { Aula } from "../../models/Aula";

export default async function aulas(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { 
        matriculaDocente,
        nomeDocente,
        campus,
        codigo, 
    } = req.body;

    if (matriculaDocente && nomeDocente && campus && codigo) {
        await mongooseClient.connect();
        const aulaExiste = await Aula.findOne({ codigo });

        if (!aulaExiste) {
            try {
                const aula = await Aula.create(req.body);
                if (aula) {    
                    res.status(httpStatus.CREATED);
                    return res.end();
                }
            } catch (error: any) {
                res.status(httpStatus.NO_RESPONSE);
                return res.json({ error });
            }
        }

        res.status(httpStatus.NOT_MODIFIED);
        return res.end();
    }

    res.status(httpStatus.BAD_REQUEST);
    return res.end();
}