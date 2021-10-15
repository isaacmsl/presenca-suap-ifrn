import mongoose, { ConnectOptions } from "mongoose";

const MONGO_DB_URI = String(process.env.MONGO_DB_URI);

export async function connect(): Promise<typeof mongoose> {
    return await mongoose.connect(MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions);
}
