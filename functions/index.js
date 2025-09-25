import functions from "firebase-functions";
import admin from "firebase-admin";
import { v2 as cloudinary } from "cloudinary";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Cloudinary config from environment (set via `firebase functions:config:set`)
const cfg = functions.config();
const CLOUD_NAME = cfg?.cloudinary?.cloud_name;
const API_KEY = cfg?.cloudinary?.api_key;
const API_SECRET = cfg?.cloudinary?.api_secret;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  // Log a warning on cold start if not configured
  console.warn("Cloudinary config is missing. Set functions config: cloudinary.cloud_name, cloudinary.api_key, cloudinary.api_secret");
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
});

function ensureAdmin(context) {
  if (!context?.auth?.token?.email) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in as admin.");
  }
  const email = context.auth.token.email.toLowerCase();
  if (email !== "admin@gmail.com") {
    throw new functions.https.HttpsError("permission-denied", "Only the admin user can perform this action.");
  }
}

// Callable: upload an image to Cloudinary
export const uploadImage = functions.https.onCall(async (data, context) => {
  ensureAdmin(context);
  const { fileDataUrl, folder = "twinfinity/misc", tags = [], transformation } = data || {};

  if (!fileDataUrl || typeof fileDataUrl !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "fileDataUrl is required (data URL string)");
  }

  try {
    const options = { folder, tags };
    // Optional inline transformation
    if (transformation && typeof transformation === "object") {
      options.transformation = transformation; // e.g., { width: 300, height: 300, crop: "fill", gravity: "face" }
    }

    const res = await cloudinary.uploader.upload(fileDataUrl, options);

    return {
      secureUrl: res.secure_url,
      publicId: res.public_id,
      width: res.width,
      height: res.height,
      format: res.format
    };
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw new functions.https.HttpsError("internal", "Failed to upload image");
  }
});

// Callable: upload a profile photo to a fixed folder with a face-crop transformation
export const uploadProfilePhoto = functions.https.onCall(async (data, context) => {
  ensureAdmin(context);
  const { fileDataUrl } = data || {};
  if (!fileDataUrl) {
    throw new functions.https.HttpsError("invalid-argument", "fileDataUrl is required");
  }

  try {
    const res = await cloudinary.uploader.upload(fileDataUrl, {
      folder: "twinfinity/admin",
      transformation: { width: 300, height: 300, crop: "fill", gravity: "face" }
    });

    return {
      secureUrl: res.secure_url,
      publicId: res.public_id
    };
  } catch (err) {
    console.error("Cloudinary profile upload failed:", err);
    throw new functions.https.HttpsError("internal", "Failed to upload profile photo");
  }
});
