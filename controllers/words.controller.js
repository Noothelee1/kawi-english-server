import { Dictionary, Lesson, User, WordDetail } from "../models/index.js";

export const addNewPersonalWord = async (req, res) => {
  try {
    const { userId } = req.user;
    const { words, lesson_id, detail_id } = req.body || {};
    let dictionary = await Dictionary.findOne({ ownedBy: userId });

    const user = await User.findById(userId);
    let isAlready = false;
    if (dictionary) {
      const { data } = dictionary;
      words.forEach((word) => {
        let arrayExist = data.filter((item) => item.content === word.content);

        const isExist = arrayExist.find((i) => i.trans === word.trans);
        if (isExist) {
          if (!lesson_id) {
            // Save new word for searching
            isAlready = true;
            return;
          }
        } else data.push(word);
      });
      if (isAlready)
        return res.status(200).json({ status: "Bạn đã lưu từ này rồi!" });
      await dictionary.save();
    } else {
      dictionary = await Dictionary.create({
        data: words,
        ownedBy: userId,
      });
      // add new dictionary to corresponding user
      user.dictionary = dictionary._id;
    }

    if (lesson_id && detail_id) {
      const lesson = await Lesson.findOne({ "course.id": lesson_id });
      if (lesson) {
        lesson.data.forEach((item) => {
          if (item.id === detail_id) {
            item.learned = true;
          }
        });
        await lesson.save();
      }
    }

    const { newWordToday } = user || {};
    const today = getToday();
    const existToday = newWordToday.find((item) => item.date === today);
    const wo = words.map((item) => item?.content || "");
    if (!existToday) {
      const today = getToday();
      newWordToday.push({
        date: today,
        words: wo,
      });
    } else {
      words.forEach((w) => {
        const { content } = w || {};
        if (!existToday.words.includes(content)) existToday.words.push(content);
      });
    }
    await user.save();

    return res.status(200).json({ data: dictionary });
    // return res.status(200).json({ data: dictionary, lesson, user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

// lv 1: Ôn ngay sau 10 phút.
// lv 2: Nếu nhớ đúng, ôn lại sau 1 ngày.
// lv 3: Sau 2 ngày.
// lv 4: Sau 3 ngày.
// lv 5: Sau 5 ngày.

const sortedDataByGoldenTime = (data) => {
  const currentTime = new Date();
  data.forEach((item) => {
    const daysSinceLastReview =
      (currentTime - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24);
    const convertObj = {
      1: 0.006,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
    };
    let lvIndex = convertObj[item.level] || 1;

    item.priority = item.review * daysSinceLastReview * lvIndex;
  });
  return data.sort((a, b) => a.priority - b.priority);
};

const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
};

export const getDictionary = async (req, res) => {
  try {
    const { level } = req?.query || {};
    const { userId } = req.user;
    let dictionary = await Dictionary.findOne({ ownedBy: userId });

    const { data } = dictionary || {};
    let newData = data;

    if (level) newData = data.filter((item) => item.level == level);
    else {
      newData = newData.filter((item) => item.review < 26);
      shuffleArray(newData);
    }

    if (dictionary) return res.status(200).json({ data: newData });
    else return res.status(400).json({ msg: "Error!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

export const countDictionary = async (req, res) => {
  try {
    const { userId } = req.user;
    const dictionary = await Dictionary.findOne({ ownedBy: userId });
    if (dictionary) {
      const obj = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      const { data } = dictionary;
      data.forEach((word) => {
        obj[word.level]++;
      });
      return res.status(200).json({ count: obj, sum: data.length });
    } else return res.status(400).json({ msg: "Error!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

export const getDetails = async (req, res) => {
  try {
    const { lesson_id } = req.query;
    if (lesson_id) {
      const details = await WordDetail.findOne({ lesson_id });
      if (details) return res.status(200).json({ data: details });
      else return res.status(400).json({ msg: "No details!" });
    } else return res.status(400).json({ msg: "Error!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

export const getLesson = async (req, res) => {
  try {
    const { lesson_id } = req.query;
    if (lesson_id) {
      const ls = await Lesson.findOne({ "course.id": lesson_id });
      if (ls) return res.status(200).json({ data: ls });
      else return res.status(400).json({ msg: "No lesson_id!" });
    } else return res.status(400).json({ msg: "Error!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

export const saveDetails = async (req, res) => {
  try {
    const { details } = req.body;
    let errorItem = undefined;
    let error = false;
    details.forEach(async (item) => {
      const { data } = item;
      if (data?.[0]) {
        const { lesson_id } = data[0];
        if (lesson_id) {
          const lesson = await WordDetail.findOne({ lesson_id });
          if (!lesson) {
            await WordDetail.create({ data, lesson_id });
          }
        }
      } else {
        errorItem = item;
        error = true;
        return;
      }
    });
    if (error) return res.status(400).json({ errorItem });
    return res.status(200).json({ msg: "Ok" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const getToday = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();
  return `${year}-${month + 1}-${day}`;
};

export const saveDictionary = async (req, res) => {
  try {
    const { userId } = req.user;
    const { words } = req.body;
    const dictionary = await Dictionary.findOne({ ownedBy: userId });

    if (dictionary && words?.length) {
      const { data } = dictionary;
      data.forEach((item) => {
        if (words.includes(item.content)) {
          item.level = upLevel(item.review + 1);
          item.review++;
        }
      });
      await dictionary.save();

      const today = getToday();
      const user = await User.findById(userId);

      if (words.length) {
        const { practicingToday } = user || {};
        const existToday = practicingToday.find((item) => item.date === today);
        if (!existToday) {
          practicingToday.push({
            date: today,
            words,
          });
        } else {
          words.forEach((w) => {
            if (!existToday.words.includes(w)) existToday.words.push(w);
          });
        }
      }

      if (!user.consistency.includes(today)) {
        user.consistency.push(today);
      }
      await user.save();

      return res.status(200).json({ data: dictionary.data, user });
    } else return res.status(400).json({ msg: "Error!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

const upLevel = (num) => {
  if (num > 13) return 5;
  if (num > 9) return 4;
  if (num > 6) return 3;
  if (num > 3) return 2;
  return 1;
};

export const updateDictionary = async (req, res) => {
  try {
    const { userId } = req.user;
    const dictionary = await Dictionary.findOne({ ownedBy: userId });
    if (dictionary) {
      const { data } = dictionary;
      data.forEach((item) => {
        item.level = upLevel(item.review);
      });
      await dictionary.save();
      return res.status(200).json({ msg: "Updated" });
    } else return res.status(400).json({ msg: "Error!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};

export const addLesson = async (req, res) => {
  try {
    const { lessons } = req.body;
    if (lessons?.length) {
      lessons.forEach(async (item) => {
        await Lesson.create({
          data: item.data,
          course: item.course,
        });
      });
      return res.status(200).json({ msg: "Save successfully" });
    } else return res.status(400).json({ msg: "Error!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: error });
  }
};
