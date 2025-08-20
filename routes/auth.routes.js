import express from "express";
import validator from "validator";
import jwt from "jsonwebtoken";

import { User } from "../models/index.js";
import requireSignIn from "../middleware/authentication.middleware.js";

const router = express.Router();

router.route("/").get(async (_req, res) => {
  res.json({ msg: "Auth API" });
});

router.route("/login").post(async (req, res) => {
  try {
    const { email, password, rememberPassword } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ msg: "Please provider all values!" });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be longer than 6 characters!" });
    }

    const isEmail = validator.isEmail(email);
    if (!isEmail) {
      return res.status(400).json({ msg: "Please provider a valid email!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Email or password is not defined!" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Email or password is not defined!" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT, {
      expiresIn: "365d",
    });
    user.password = undefined;
    return res.status(200).json({ token, user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "LOGIN ERROR. Try again!" });
  }
});

router.route("/add-day").post(requireSignIn, async (req, res) => {
  try {
    const { userId } = req.user;
    const { days } = req.body;
    if (days?.length) {
      const user = await User.findById(userId);
      if (!user.consistency) {
        user.consistency = days;
      } else {
        days.forEach((item) => {
          if (!user.consistency.includes(item)) user.consistency.push(item);
        });
      }
      await user.save();
      return res.status(200).json({ user });
    } else return res.status(400).json({ msg: "Error!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
});

const getToday = (text = false) => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();
  if (text) return `${year}-${month + 1}-${day}`;
  return new Date(year, month, day);
};

function countContinuousDays(dates) {
  const sortedDates = dates.sort((a, b) => b - a);

  const today = getToday();
  let continuousDays = 0;
  let previousDate = today;

  for (const currentDate of sortedDates) {
    const diffTime = (previousDate - currentDate) / (1000 * 60 * 60 * 24);
    if (diffTime < 2) {
      continuousDays++;
      previousDate = currentDate;
    } else {
      break;
    }
  }

  return continuousDays;
}

const convertToDateArr = (arr) => {
  return arr.map((item) => new Date(item));
};

router.route("/consistency").get(requireSignIn, async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    const { consistency } = user;
    const newArr = convertToDateArr(consistency);
    const continuousDays = countContinuousDays(newArr);

    const today = getToday(true);
    const practice = user.practicingToday.find((item) => item.date === today);
    const newWord = user.newWordToday.find((item) => item.date === today);

    res.status(200).json({
      consistency: continuousDays,
      practicingToday: practice?.words?.length || 0,
      newWordToday: newWord?.words?.length || 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
});

router.route("/tree").get(requireSignIn, async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    const { tree } = user;

    res.status(200).json({ tree });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
});

router.route("/tree").post(requireSignIn, async (req, res) => {
  try {
    const { userId } = req.user;
    const { treeName } = req.body;
    const user = await User.findById(userId);
    const { tree } = user;

    if (treeName !== tree?.name) tree.name = treeName;
    await user.save();
    
    res.status(200).json({ tree: user.tree });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
});

export default router;
