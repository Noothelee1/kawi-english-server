import express from "express";
import {
  addNewPersonalWord,
  getDictionary,
  saveDetails,
  getDetails,
  saveDictionary,
  countDictionary,
  addLesson,
  getLesson,
  updateDictionary,
} from "../controllers/index.js";
import { requireSignIn } from "../middleware/index.js";

const router = express.Router();
router.route("/").get((_req, res) => {
  res.send("Word API!");
});

router.route("/add-new").post(requireSignIn, addNewPersonalWord);
router.route("/save-details").post(saveDetails);
router.route("/get-details").get(getDetails);

router.route("/add-lesson").post(addLesson);
router.route("/get-lesson").get(getLesson);

router.route("/get-dictionary").get(requireSignIn, getDictionary); // List word for practicing
router.route("/count-dictionary").get(requireSignIn, countDictionary); // count word for showing chart
router.route("/save-dictionary").post(requireSignIn, saveDictionary); // Save word for practicing
router.route("/update-dictionary").get(requireSignIn, updateDictionary);

export default router;
