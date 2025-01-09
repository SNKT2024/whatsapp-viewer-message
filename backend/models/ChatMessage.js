const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  date: { type: Date, required: true }, // Store 'date' as a Date object
  sender: { type: String, required: true },
  message: { type: String, required: true },
});

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
