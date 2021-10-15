import type { NextApiRequest, NextApiResponse } from "next";
import * as mongooseClient from "../../database/mongooseClient";
import { Presenca } from "../../models/Presenca";
import httpStatus from "../../lib/httpStatus";
import { Aula } from "../../models/Aula";

export default async function presencas(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { matriculaDiscente, nomeDiscente, codigoAula } = req.body;

    if (matriculaDiscente && nomeDiscente && codigoAula ) {
        await mongooseClient.connect();
        const presencaExiste = await Presenca.findOne({ matriculaDiscente, codigoAula });
        const aulaExiste = await Aula.findOne({ codigo: codigoAula });

        if (!presencaExiste && aulaExiste) {
            try {
                const presenca = await Presenca.create(req.body);
                if (presenca) {    
                    res.status(httpStatus.CREATED);
                    return res.end();
                }
            } catch (error) {
                console.log(error)
                res.status(httpStatus.NO_RESPONSE);
                return res.end({ error });
            }
        } else if (presencaExiste) {
            res.status(httpStatus.NOT_MODIFIED);
        } else {
            res.status(httpStatus.NO_RESPONSE);
        }

        return res.end();
    }

    res.status(httpStatus.BAD_REQUEST);
    return res.end();
}