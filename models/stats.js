import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema({
  users: {
    type: Number,
    default: 0,
  },

  subscription: {
    type: Number,
    default: 0,
  },

  views: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model("Stats", StatsSchema);
