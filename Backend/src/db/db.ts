import mongoose from "mongoose";
import dns from "node:dns";

// Configure DNS for MongoDB Atlas SRV resolution fallback
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (dnsErr) {
  // Use system default DNS if setServers fails
}

/**
 * Safely removes legacy / conflicting unique indexes that no longer match the schema.
 */
async function cleanupObsoleteIndexes() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map((c) => c.name);

    // 1. Clean legacy indexes on 'users' collection
    if (collectionNames.includes("users")) {
      const usersCollection = db.collection("users");
      const userIndexes = await usersCollection.indexes();
      const obsoleteUserIndexes = ["username_1", "name_1", "fullname_1", "phone_1"];

      for (const idx of userIndexes) {
        if (idx.name && obsoleteUserIndexes.includes(idx.name)) {
          console.log(`[Database] Dropping legacy index '${idx.name}' from 'users' collection...`);
          await usersCollection.dropIndex(idx.name);
        }
      }
    }

    // 2. Clean legacy indexes on 'patients' collection
    if (collectionNames.includes("patients")) {
      const patientsCollection = db.collection("patients");
      const patientIndexes = await patientsCollection.indexes();
      const obsoletePatientIndexes = [
        "Contact_1",
        "contact_1",
        "Patient_1",
        "Glucose_1",
        "eye_1",
        "Gender_1",
        "gender_1",
        "fullname_1",
        "Age_1",
      ];

      for (const idx of patientIndexes) {
        if (idx.name && obsoletePatientIndexes.includes(idx.name)) {
          console.log(`[Database] Dropping legacy index '${idx.name}' from 'patients' collection...`);
          await patientsCollection.dropIndex(idx.name);
        }
      }
    }
  } catch (error: any) {
    console.warn("[Database] Notice during index cleanup:", error?.message || error);
  }
}

/**
 * Connect to MongoDB and initialize connection listeners.
 */
async function connectDB(): Promise<typeof mongoose | undefined> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("[Database Error] MONGO_URI is not defined in environment variables (.env).");
    return;
  }

  // Connection Event Listeners
  mongoose.connection.on("connected", () => {
    console.log("MONGODB IS CONNECTED ☑️");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[Database Error] MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[Database Warning] MongoDB disconnected.");
  });

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    // Run safe index cleanup after connection is ready
    await cleanupObsoleteIndexes();

    return conn;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[Database Error] Failed to connect to MongoDB:", error.message);
    } else {
      console.error("[Database Error] Unknown connection error:", error);
    }
    throw error;
  }
}

export default connectDB;