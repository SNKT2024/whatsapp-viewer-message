const connectDB = require("./config/db"); // Import your database connection
const mongoose = require("mongoose"); // Import mongoose
const ChatMessage = require("./models/ChatMessage"); // Import your ChatMessage model

// Connect to the database
connectDB();

// Function to convert string date and time into a Date object
const convertToDateObject = (dateStr, timeStr) => {
  try {
    const [day, month, year] = dateStr.split("/").map(Number); // Split DD/MM/YYYY
    return new Date(`${year}-${month}-${day} ${timeStr}`); // Create a valid Date object
  } catch (error) {
    console.error(`Error parsing date: ${dateStr} and time: ${timeStr}`, error);
    return null; // Return null if the date conversion fails
  }
};

// Migration function
const migrateDates = async () => {
  try {
    console.log("Starting migration...");

    // Fetch all messages with string dates
    const messages = await ChatMessage.find();

    for (const msg of messages) {
      if (typeof msg.date === "string") {
        // Check if the `date` field is a string
        try {
          const newDate = convertToDateObject(msg.date, msg.time);

          if (newDate) {
            // Update the document with the new Date object
            await ChatMessage.updateOne(
              { _id: msg._id },
              { $set: { date: newDate } }
            );

            console.log(`Updated message ${msg._id} with new date: ${newDate}`);
          } else {
            console.error(`Skipping message ${msg._id} due to invalid date.`);
          }
        } catch (error) {
          console.error(`Error converting date for message ${msg._id}:`, error);
        }
      }
    }

    console.log("Migration complete!");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    mongoose.connection.close(); // Close the connection after migration
  }
};

// Run the migration
migrateDates();
