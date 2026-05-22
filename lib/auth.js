// import dotenv from "dotenv";
// dotenv.config();

// import { betterAuth } from "better-auth";

// import { MongoClient } from "mongodb";

// import { mongodbAdapter }
// from "better-auth/adapters/mongodb";

// const client = new MongoClient(
//   process.env.MONGODB_URI
// );

// const db =
//   client.db("docappoint");

// export const auth =
//   betterAuth({

//     database:
//       mongodbAdapter(db, {
//         client,
//       }),

//     trustedOrigins: [
//       "http://localhost:3000",
      

//       process.env.CLIENT_URL,
//     ],

//     emailAndPassword: {
//       enabled: true,
//     },
//     session: {
//   expiresIn: 60 * 60 * 24 * 7,
// },
//     advanced: {
//   crossSubDomainCookies: {
//     enabled: true,
//   },
//    defaultCookieAttributes: {
//     secure: true,
//     sameSite: "none",
//   },
// },

//     socialProviders: {
//       google: {
//         clientId:
//           process.env
//             .GOOGLE_CLIENT_ID,

//         clientSecret:
//           process.env
//             .GOOGLE_CLIENT_SECRET,
//       },
//     },

//     secret:
//       process.env
//         .BETTER_AUTH_SECRET,

//     baseURL:
//       process.env
//         .BETTER_AUTH_URL,
        
//   });
// ;
  import dotenv from "dotenv";
dotenv.config();

import { betterAuth } from "better-auth";

import { MongoClient } from "mongodb";

import { mongodbAdapter }
from "better-auth/adapters/mongodb";

const client = new MongoClient(
  process.env.MONGODB_URI
);

const db =
  client.db("docappoint");

export const auth =
  betterAuth({

    database:
      mongodbAdapter(db, {
        client,
      }),

    trustedOrigins: [

      "http://localhost:3000",

      "https://assignment-09-kappa.vercel.app",

      process.env.CLIENT_URL,
    ],

    baseURL:
      "https://doc-appoint-server-seven.vercel.app",

    secret:
      process.env
        .BETTER_AUTH_SECRET,

    emailAndPassword: {
      enabled: true,
    },

    session: {

      expiresIn:
        60 * 60 * 24 * 7,
    },

    advanced: {

      crossSubDomainCookies: {
        enabled: true,
      },

      defaultCookieAttributes: {

        secure: true,

        sameSite: "none",
      },
    },

    socialProviders: {

      google: {

        clientId:
          process.env
            .GOOGLE_CLIENT_ID,

        clientSecret:
          process.env
            .GOOGLE_CLIENT_SECRET,
      },
    },
  });