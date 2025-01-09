const express = require("express");
const multer = require("multer");
const ChatMessage = require("../models/ChatMessage");

const router = express.Router();

// Configure Multer with disk storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"), // Store files in "uploads" folder
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
  }),
  limits: {
    fileSize: 25 * 1024 * 1024, // Limit file size to 25MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only .txt files are allowed!"), false);
    }
  },
});

// Helper function to convert date and time strings into a JavaScript Date object
const convertToDateObject = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(`${year}-${month}-${day} ${timeStr}`);
};

// Parse WhatsApp chat file and save to database
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fs = require("fs");
    const fileContent = fs.readFileSync(req.file.path, "utf-8"); // Read file content

    const lines = fileContent.split("\n").map((line) => line.trim());

    const messages = [];
    let currentMessage = null;

    lines.forEach((line) => {
      const match = line.match(
        /^(\d{2}\/\d{2}\/\d{4}), (\d{1,2}:\d{2}\s?[apAP][mM]) - ([^:]+): (.+)$/
      );

      if (match) {
        // New message starts
        const [_, dateStr, timeStr, sender, message] = match;
        const fullDate = convertToDateObject(dateStr, timeStr);

        if (currentMessage) {
          messages.push(currentMessage); // Push previous message
        }

        currentMessage = { date: fullDate, sender, message };
      } else if (currentMessage) {
        // Multiline message continuation
        currentMessage.message += "\n" + line;
      }
    });

    if (currentMessage) {
      messages.push(currentMessage); // Push last message
    }

    await ChatMessage.insertMany(messages);
    res
      .status(200)
      .json({ success: true, message: "Chat uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch all chat messages from the database
router.get("/", async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  try {
    const chats = await ChatMessage.find()
      .sort({ date: -1 }) // Sort by date in descending order
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
