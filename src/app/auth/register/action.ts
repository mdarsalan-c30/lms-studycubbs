"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function registerAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    throw new Error("All fields are required");
  }

  // 1. Hash the password correctly
  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Create a unique ID
  const id = `u_admin_${Date.now()}`;

  try {
    // 3. Insert the user as SUPER_ADMIN
    await db.execute(
      "INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [id, name, email, hashedPassword, "SUPER_ADMIN"]
    );
    
    console.log(`[Register] Created SUPER_ADMIN: ${email}`);
  } catch (error: any) {
    console.error("[Register Error]", error.message);
    throw new Error(`Failed to create admin: ${error.message}`);
  }

  // 4. Redirect to login
  redirect("/auth/login?registered=true");
}
