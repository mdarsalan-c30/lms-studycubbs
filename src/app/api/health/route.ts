import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ 
    status: "OK", 
    message: "Server is alive and breathing! 🏃‍♂️",
    timestamp: new Date().toISOString()
  });
}
