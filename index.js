import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();

const port =
  process.env.PORT || 5000;

app.set("trust proxy", 1);

// 

app.use(
  cors({
    origin: [
      "https://doc-appoint-server-seven.vercel.app/",
      process.env.CLIENT_URL,
    ],

    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use(
  "/api/auth",
  toNodeHandler(auth)
);

const client = new MongoClient(
  process.env.MONGODB_URI
);
// const
const verifyToken = (
  req,
  res,
  next
) => {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader?.startsWith(
      "Bearer "
    )
  ) {
    return res.status(401).send({
      message: "Access denied",
    });
  }

  const token =
    authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    (error, decoded) => {
      if (error) {
        return res.status(403).send({
          message:
            "Invalid token",
        });
      }

      req.decoded = decoded;

      next();
    }
  );
};

async function run() {

  try {

    await client.connect();

  

    const database =
      client.db("docappoint");

    const doctorsCollection =
      database.collection(
        "doctors"
      );

    const bookingsCollection =
      database.collection(
        "bookings"
      );

    const usersCollection =
      database.collection(
        "users"
      );

    app.get("/", (req, res) => {
      res.send(
        
      );
    });

    app.post(
      "/register",
      async (req, res) => {

        try {

          const {
            name,
            email,
            password,
            image,
          } = req.body;

          const existingUser =
            await usersCollection.findOne(
              {
                email,
              }
            );

          if (existingUser) {
            return res
              .status(400)
              .send({
                success: false,
                message:
                  "Email already registered",
              });
          }

          const hashedPassword =
            await bcrypt.hash(
              password,
              10
            );

          const userData = {
            name,
            email,
            image,
            password:
              hashedPassword,
            createdAt:
              new Date(),
          };

          await usersCollection.insertOne(
            userData
          );

          res.send({
            success: true,
            message:
              "Account created successfully",
          });

        } catch (error) {

          res.status(500).send({
            success: false,
            message:
              "Registration failed",
          });

        }
      }
    );

    app.post(
      "/login",
      async (req, res) => {

        try {

          const {
            email,
            password,
          } = req.body;

          const user =
            await usersCollection.findOne(
              {
                email,
              }
            );

          if (!user) {
            return res
              .status(400)
              .send({
                success: false,
                message:
                  "User not found",
              });
          }

          const passwordMatched =
            await bcrypt.compare(
              password,
              user.password
            );

          if (
            !passwordMatched
          ) {
            return res
              .status(400)
              .send({
                success: false,
                message:
                  "Incorrect password",
              });
          }

          const token = jwt.sign(
            {
              email:
                user.email,
            },
            process.env.JWT_SECRET,
            {
              expiresIn:
                "7d",
            }
          );

          res.cookie(
            "token",
            token,
            {
              httpOnly: true,
            secure: false,
sameSite: "lax",
            }
          );

          res.send({
            success: true,
            token,
            user: {
              name:
                user.name,
              email:
                user.email,
              image:
                user.image,
            },
          });

        } catch (error) {

          res.status(500).send({
            success: false,
            message:
              "Login failed",
          });

        }
      }
    );

    app.post(
      "/logout",
      (req, res) => {

        res.clearCookie(
          "token",
          {
            httpOnly: true,
            secure: true,
            sameSite: "none",
          }
        );

        res.send({
          success: true,
          message:
            "Logout successful",
        });
      }
    );

    app.get(
      "/me",
      async (req, res) => {

        try {

          const token =
            req.cookies.token;

          if (!token) {
            return res.send(
              null
            );
          }

          const decoded =
            jwt.verify(
              token,
              process.env.JWT_SECRET
            );

          const user =
            await usersCollection.findOne(
              {
                email:
                  decoded.email,
              }
            );

          if (!user) {
            return res.send(
              null
            );
          }

          res.send({
            name:
              user.name,
            email:
              user.email,
            image:
              user.image,
          });

        } catch (error) {

          res.send(null);

        }
      }
    );

    app.get(
      "/doctors",
      async (req, res) => {

        const doctors =
          await doctorsCollection
            .find()
            .toArray();

        res.send(doctors);

      }
    );

    app.get(
      "/doctors/:id",
      async (req, res) => {

        const doctor =
          await doctorsCollection.findOne(
            {
              _id:
                new ObjectId(
                  req.params.id
                ),
            }
          );

        res.send(doctor);

      }
    );

    app.post(
      "/bookings",
      async (req, res) => {

        try {

          const bookingData =
            req.body;

          const result =
            await bookingsCollection.insertOne(
              bookingData
            );

          res.status(201).send({
            success: true,
            insertedId:
              result.insertedId,
          });

        } catch (error) {

          res.status(500).send({
            success: false,
            message:
              "Booking failed",
          });

        }
      }
    );

    app.get(
      "/bookings",
      async (req, res) => {

        const email =
          req.query.email;

        const query = {
          $or: [
            {
              userEmail:
                email,
            },
            {
              email:
                email,
            },
          ],
        };

        const bookings =
          await bookingsCollection
            .find(query)
            .toArray();

        res.send(bookings);

      }
    );

    app.patch(
      "/bookings/:id",
      async (req, res) => {

        const result =
          await bookingsCollection.updateOne(
            {
              _id:
                new ObjectId(
                  req.params.id
                ),
            },
            {
              $set: {
                status:
                  req.body.status,
              },
            }
          );

        res.send(result);

      }
    );

    app.put(
      "/bookings/:id",
      async (req, res) => {

        const updatedData =
          req.body;

        const result =
          await bookingsCollection.updateOne(
            {
              _id:
                new ObjectId(
                  req.params.id
                ),
            },
            {
              $set: {
                patientName:
                  updatedData.patientName,

                phone:
                  updatedData.phone,

                appointmentDate:
                  updatedData.appointmentDate,

                appointmentTime:
                  updatedData.appointmentTime ||
                  updatedData.timeSlot,

                timeSlot:
                  updatedData.timeSlot ||
                  updatedData.appointmentTime,
              },
            }
          );

        res.send(result);

      }
    );

    app.delete(
      "/bookings/:id",
      async (req, res) => {

        const result =
          await bookingsCollection.deleteOne(
            {
              _id:
                new ObjectId(
                  req.params.id
                ),
            }
          );

        res.send(result);

      }
    );

  } catch (error) {

    console.error(
      "Database Connection Error:",
      error
    );

  }
}

run();
app.listen(port, () => {
  console.log(
    `Server running on port ${port}`
  );
});

export default app;
