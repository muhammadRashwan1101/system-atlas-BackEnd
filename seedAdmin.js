const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("./models/user.model");

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI is not defined in your .env file");
      process.exit(1);
    }

    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@systematlas.io";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123456!";
    const adminFirstName = process.env.SEED_ADMIN_FIRSTNAME || "System";
    const adminLastName = process.env.SEED_ADMIN_LASTNAME || "Administrator";

    const normalizedEmail = adminEmail.toLowerCase().trim();
    let existingAdmin = await User.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists with email: ${normalizedEmail}`);
      console.log(`   User ID: ${existingAdmin._id}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Onboarding Status: ${existingAdmin.onboardingStatus}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const newAdmin = await User.create({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      jobTitle: "Chief Architect / System Administrator",
      department: "Platform Engineering",
      level: "Executive",
      onboardingStatus: "pending",
      mustChangePassword: false,
      accountStatus: "active",
    });

    console.log("==================================================");
    console.log("🎉 Super Admin User Seeded Successfully!");
    console.log("==================================================");
    console.log(`📧 Email:    ${newAdmin.email}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Name:     ${newAdmin.fullName}`);
    console.log(`🛡️  Role:     ${newAdmin.role}`);
    console.log(`🆔 ID:       ${newAdmin._id}`);
    console.log("==================================================");
    console.log("👉 You can now log in at: http://localhost:5173/login");
    console.log("==================================================");

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed admin user:", err);
    process.exit(1);
  }
};

seedAdmin();
