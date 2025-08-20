import mongoose from "mongoose";

const dictionarySchema = new mongoose.Schema({
    data: [
        {
          content: { type: String, required: true },
          audio: { type: String, required: true },
          phonetic: { type: String, required: true },
          picture: { type: String, required: false },
          position: { type: String, required: true },
          review: { type: Number, default: 1 },
          sentence1: { type: String, required: true },
          trans: { type: String, required: true },
          vi_sentence1: { type: String, required: true },
          level: { type: Number, default: 1 },
          isResearch: { type: Boolean, default: false },
          updatedAt: { type: Date, default: Date.now }
        },
    ],
    ownedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    }
},   {
  timestamps: true,
});

export default mongoose.model("Dictionary", dictionarySchema);
