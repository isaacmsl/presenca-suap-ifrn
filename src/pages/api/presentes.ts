import type { NextApiRequest, NextApiResponse } from "next";
import * as mongooseClient from "../../database/mongooseClient";
import { Presenca } from "../../models/Presenca";
import httpStatus from "../../lib/httpStatus";
import { Aula } from "../../models/Aula";
import { IUser } from "../../types/IUser";
import { IPresenca } from "../../types/IPresenca";
import { IPresente } from "../../types/IPresente";

export default async function presentes(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { matriculaDocente, codigoAula } = req.body;

    if (matriculaDocente && codigoAula) {
        await mongooseClient.connect();
        const aulaExiste = await Aula.findOne({ matriculaDocente, codigo: codigoAula });

        if (aulaExiste) {
            try {
                const presentesDocs: IPresenca[] = await Presenca.find({ codigoAula });
                const presentes: IPresente[] = presentesDocs.map(presente => {
                    return {
                        nome: presente.nomeDiscente,
                        matricula: presente.matriculaDiscente,
                        data: presente._dataCadastro.toLocaleString()
                    };
                });
                
                res.status(httpStatus.OK);
                return res.json({ presentes });
            } catch (error) {
                res.status(httpStatus.NO_RESPONSE);
                return res.end();
            }
        }

        res.status(httpStatus.NO_RESPONSE);
        return res.end();
    }

    res.status(httpStatus.BAD_REQUEST);
    return res.end();
}