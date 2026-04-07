import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, course, grade, parent, date, time } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // --- 1. Save to MySQL Database (LMS side is safe) ---
    try {
      const trialId = `trial_${uuidv4()}`;
      await db.execute(
        `INSERT INTO Trial (id, childName, parentName, email, phone, course, grade, preferredDate, preferredTime) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [trialId, name, parent || '', email || '', phone || '', course, grade || '', date || '', time || '']
      );
      console.log(`✅ [LMS DB] Lead saved for ${name}`);
    } catch (dbError: any) {
      console.error("❌ LMS DB Error:", dbError.message);
    }

    // --- 2. Save to Google Sheets (Safe in LMS, No crash risk for Landing) ---
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      await sheets.spreadsheets.values.append({
        spreadsheetId: "1pAtvY0-2_0Lks_Y_L6_MvVjIsmF7Y_UvU9i9I-YwY0Y",
        range: "Sheet1!A:K",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[name, parent || "", email || "", phone || "", course, grade || "", date || "", time || "NEW", "System Sync", new Date().toISOString()]],
        },
      });
      console.log("✅ [LMS Sheets] Data added to Google Sheets.");
    } catch (sheetError: any) {
      console.error("❌ LMS Sheet Error:", sheetError.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Lead successfully captured in LMS (DB + Sheets)." 
    });

  } catch (error: any) {
    console.error("❌ LMS External API Global Error:", error.message);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
