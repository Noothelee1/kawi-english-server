import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  data: [
    {
      id: { type: Number, required: true },
      course_id: { type: Number, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      image: { type: String, required: true },
      learned: { type: Boolean, default: false },
    },
  ],
  course: {
    id: { type: String, required: true },
    title: { type: String, required: true },
  },
});

export default mongoose.model("Lesson", lessonSchema);
