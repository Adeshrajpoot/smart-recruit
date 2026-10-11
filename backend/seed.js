import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const seedRecruiter = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.SEED_RECRUITER_EMAIL?.trim().toLowerCase();
    const password = process.env.SEED_RECRUITER_PASSWORD;
    if (!email || !password) {
      throw new Error(
        "Set SEED_RECRUITER_EMAIL and SEED_RECRUITER_PASSWORD in backend/.env before running npm run seed."
      );
    }
    if (password.length < 8) {
      throw new Error("SEED_RECRUITER_PASSWORD must be at least 8 characters long.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role !== "recruiter") {
        throw new Error(
          `The account ${email} already exists with role '${existingUser.role}'. No role or password was changed.`
        );
      }
      console.log(`Recruiter account ${email} already exists. No data was changed.`);
      return;
    }

    await User.create({
      name: process.env.SEED_RECRUITER_NAME?.trim() || "SmartRecruit Recruiter",
      email,
      password: await bcrypt.hash(password, 10),
      authProvider: "local",
      emailVerified: true,
      role: "recruiter"
    });
    console.log(`Created verified recruiter account: ${email}`);
  } catch (error) {
    console.error("Recruiter seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

seedRecruiter();
