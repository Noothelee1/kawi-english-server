import mongoose from "mongoose";

const wordDetailSchema = new mongoose.Schema({
  data: [
    {
      content: { type: String },
      audio: { type: String },
      phonetic: { type: String },
      picture: { type: String },
      position: { type: String },
      sentence1: { type: String },
      trans: { type: String },
      vi_sentence1: { type: String },
    },
  ],
  lesson_id: { type: Number },
});

export default mongoose.model("WordDetail", wordDetailSchema);
