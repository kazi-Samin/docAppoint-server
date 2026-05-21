import dotenv from "dotenv";
dotenv.config();

import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

const db = client.db("docappoint");

export const auth = betterAuth({
  trustedOrigins: [
  "https://assignment-09-kappa.vercel.app",
  "http://localhost:3000",
],

  emailAndPassword: {
    enabled: true,
  },

  database: mongodbAdapter(db, {
    client,
  }),
});