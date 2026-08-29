import Role from "../models/Role.js";
import logger from "../Utils/logger.js";

const defaultRoles = [
  {
    name: "admin",
    displayName: "Admin",
    description: "System administrator with full access to all features",
    isSystem: true,
    permissions: {
      users: { create: true, read: true, update: true, delete: true },
      roles: { create: true, read: true, update: true, delete: true },
      bookings: { create: true, read: true, update: true, delete: true },
      tests: { create: true, read: true, update: true, delete: true },
      packages: { create: true, read: true, update: true, delete: true },
      categories: { create: true, read: true, update: true, delete: true },
      subcategories: { create: true, read: true, update: true, delete: true },
      payments: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true },
      commissions: { create: true, read: true, update: true, delete: true },
      settlements: { create: true, read: true, update: true, delete: true },
      paymentSettings: { create: true, read: true, update: true, delete: true },
      lab_owners: { create: true, read: true, update: true, delete: true },
      lab_assistants: { create: true, read: true, update: true, delete: true },
    },
  },
  {
    name: "lab_owner",
    displayName: "Lab Owner",
    description: "Lab owner who manages lab operations and assistants",
    isSystem: true,
    permissions: {
      users: { create: true, read: true, update: false, delete: false },
      bookings: { create: false, read: true, update: true, delete: false },
      tests: { create: false, read: true, update: false, delete: false },
      packages: { create: false, read: true, update: false, delete: false },
      categories: { create: false, read: true, update: false, delete: false },
      subcategories: { create: false, read: true, update: false, delete: false },
      payments: { create: false, read: true, update: false, delete: false },
      reports: { create: true, read: true, update: false, delete: false },
      lab_assistants: { create: true, read: true, update: true, delete: true },
      settlements: { create: false, read: true, update: false, delete: false },
    },
  },
  {
    name: "lab_assistant",
    displayName: "Lab Assistant",
    description: "Lab assistant who collects samples and handles field work",
    isSystem: true,
    permissions: {
      bookings: { create: false, read: true, update: true, delete: false },
      payments: { create: true, read: false, update: false, delete: false },
      reports: { create: false, read: false, update: false, delete: false },
    },
  },
  {
    name: "patient",
    displayName: "Patient",
    description: "Regular patient who books tests and views reports",
    isSystem: true,
    permissions: {
      bookings: { create: true, read: true, update: true, delete: false },
      tests: { create: false, read: true, update: false, delete: false },
      packages: { create: false, read: true, update: false, delete: false },
      payments: { create: true, read: true, update: false, delete: false },
    },
  },
];

export const seedRoles = async () => {
  try {
    for (const roleData of defaultRoles) {
      const exists = await Role.findOne({ name: roleData.name });
      if (!exists) {
        await Role.create(roleData);
        logger.info(`Role "${roleData.name}" seeded`);
      } else {
        exists.permissions = roleData.permissions;
        await exists.save();
        logger.info(`Role "${roleData.name}" permissions updated`);
      }
    }
  } catch (error) {
    logger.error("Error seeding roles", { message: error.message });
  }
};
