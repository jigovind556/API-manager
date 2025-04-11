require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("./db/index.js");
const AppOption = require("./models/appOptions.models.js");

const seedOptions = async () => {
  await connectDB();

  const options = ["Loyalty", "SOH", "Brands Loyalty", "CPE", "Stationery"];

  try {
    for (let i = 0; i < options.length; i++) {
      const name = options[i];
      await AppOption.create({ name });
      console.log(`Option "${name}" seeded successfully.`);
    }
    console.log("Options seeded successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    mongoose.disconnect();
  }
};

seedOptions();
