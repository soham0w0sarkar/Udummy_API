import mongoose from "mongoose";
import validator from "validator";

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Set title for course"],
    minLength: [10, "Title must be at least 10 characters"],
    maxLength: [100, "Title must be at most 100 characters"],
  },

  description: {
    type: String,
    required: [true, "Set description for course"],
    minLength: [20, "Description must be at least 20 characters"],
  },

  lectures: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      video: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],

  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  views: {
    type: Number,
    default: 0,
  },

  numOfVideos: {
    type: Number,
    default: 0,
  },

  category: {
    type: String,
    required: [true, "Set category for course"],
  },

  createdBy: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Course", CourseSchema);
