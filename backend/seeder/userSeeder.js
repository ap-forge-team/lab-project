import bcrypt from "bcryptjs";
import User from "../models/User.js";

const defaultAdmin = {
  name: "Super Admin",
  email: "admin@labbook.com",
  phone: "9999999999",
  password: "Admin@123",
  role: "admin",
};

export const seedAdmin = async () => {
  try {
    const exists = await User.findOne({ role: "admin" });
    if (exists) {
      console.log("Admin user already exists, skipping seed");
      return;
    }

    const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);

    await User.create({
      name: defaultAdmin.name,
      email: defaultAdmin.email,
      phone: defaultAdmin.phone,
      password: hashedPassword,
      role: defaultAdmin.role,
    });

    console.log(`Admin seeded: ${defaultAdmin.email}`);
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  }
};
