import express from "express";
import { monthlyMemberCount } from "./monthlyMemberCount";
import { loginUser } from "./auth";
import { Db } from "mongodb";

export default async(db: Db) => {
  const app = express();

  const Reports = db.collection("reports");

  app.get("/health", (req, res) => {
    res.send("all good");
  });

  let sessionId: string;
  try {
    sessionId = await loginUser();
  } catch(error) {
    console.log("failed to login user for some reason", error);
    throw error;
  }

  await monthlyMemberCount(sessionId);

  return app;
}

// Get all active members of a group (organization in Odoo)
// Count all members 24 and under (Disregard all leader-types for members under 25)
// Find all members without leadership functions and count them

