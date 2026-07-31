import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

// Middle
import { notFound } from "./middleware/index.js";

import auth from "./routes/auth.routes.js";
import words from "./routes/words.routes.js";

import * as http from "http";

const app = express();

const server = http.createServer(app);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "5mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api/auth", auth);

app.use("/api/words", words);

app.use("/", (_req, res) => {
  res.send("Welcome to my api!");
});

const port = process.env.PORT || 8000;

app.use(notFound);

mongoose.set("strictQuery", true);

// const register = async ({name, email, password}) => {
//     await User.create({
//         name,
//         email,
//         password,
//     });
// };

const start = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_DB_URL || "")
      .then(() => console.log("DB connected"));

    // await register({
    //     name: 'Thu Làn',
    //     email: 'thulan0610@gmail.com',
    //     password: 'anh123456'
    // });
  } catch (error) {
    console.log(error);
  }
};

start();

// On Vercel the app is invoked as a function, so binding a port would be wrong.
if (!process.env.VERCEL) {
  server.listen(port, () => {
    console.log("Server is running on port", port);
  });
}

export default app;
