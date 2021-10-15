import mongoose, { Schema } from "mongoose";
import { IAula } from "../types/IAula";

const AulaSchema: Schema<IAula> = new mongoose.Schema(
    {
        matriculaDocente: {
            type: "String",
            trim: true,
            required: true,
        },
        nomeDocente: {
            type: "String",
            trim: true,
            required: true,
        },
        campus: {
            type: "String",
            trim: true,
            required: true,
        },
        codigo: {
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

export const Aula =
    mongoose.models.Aula || mongoose.model("Aula", AulaSchema);
