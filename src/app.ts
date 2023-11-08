import express from "express";
import { createMemberCountAndCompositionReport } from "./createMemberCountAndCompositionReport";
import { loginUser } from "./auth";
import { Db } from "mongodb";

export default async(db: Db) => {
  const app = express();

  const Reports = db.collection("reports");

  app.get("/health", (req, res) => {
    res.send("all good");
  });

  const start = Date.now();
  let sessionId: string;
  try {
    sessionId = await loginUser();
  } catch(error) {
    console.log("failed to login user for some reason", error);
    throw error;
  }

  await createMemberCountAndCompositionReport(Reports, sessionId);
  const end = Date.now();
  console.log(`run time: ${(end-start)/1000} seconds`);
  return app;
}
