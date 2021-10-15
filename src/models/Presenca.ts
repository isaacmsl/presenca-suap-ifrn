import mongoose, { Schema } from "mongoose";
import { IPresenca } from "../types/IPresenca";

const PresencaSchema: Schema<IPresenca> = new mongoose.Schema(
    {
        matriculaDiscente: {
            type: "String",
            trim: true,
            required: true,
        },
        nomeDiscente: {
            type: "String",
            trim: true,
            required: true,
        },
        codigoAula: {
            type: "String",
            trim: true,
            required: true,
        },
        _dataCadastro: {
            type: "Date",
            required: false,
        },
        _dataModificacao: {
            type: "Date",
            required: false,
        },
    },
    {      
        timestamps: {
            createdAt: "_dataCadastro",
            updatedAt: "_dataModificacao",
        },  
        versionKey: false, 
    }
);

export const Presenca =
    mongoose.models.Presenca || mongoose.model("Presenca", PresencaSchema);
