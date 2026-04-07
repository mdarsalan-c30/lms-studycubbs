"use server";

import { db } from "./db";
import { db as firestore } from "./firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function submitFeePayment(studentId: string, batchId: string, amount: number, period: string) {
  console.log(`[submitFeePayment START] Student: ${studentId}, Batch: ${batchId}, Amt: ${amount}, Period: ${period}`);
  try {
    // We use INSERT ... ON DUPLICATE KEY UPDATE to ensure it works whether the record exists or not
    // We need an id and invoiceNo for the new record
    const newId = `fee_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const invoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substring(5)}`.toUpperCase();

    const sql = `
      INSERT INTO FeePayment (id, studentId, batchId, amount, status, period, dueDate, invoiceNo, paidAt)
      VALUES (?, ?, ?, ?, 'PAID', ?, NOW(), ?, NOW())
      ON DUPLICATE KEY UPDATE 
        status = 'PAID', 
        amount = VALUES(amount), 
        paidAt = NOW()
    `;

    // Note: To use ON DUPLICATE KEY UPDATE effectively with studentId/batchId/period, 
    // there must be a UNIQUE constraint on those three columns.
    // Let's check if the record exists first to be safe if no constraint exists.
    
    const existing = await db.queryOne<any>(
      "SELECT id FROM FeePayment WHERE studentId = ? AND batchId = ? AND period = ?",
      [studentId, batchId, period]
    );

    if (existing) {
      console.log(`[submitFeePayment] Record exists (${existing.id}), performing UPDATE.`);
      await db.execute(
        "UPDATE FeePayment SET status = 'PAID', amount = ?, paidAt = NOW() WHERE id = ?",
        [amount, existing.id]
      );
    } else {
      console.log(`[submitFeePayment] No record found, performing INSERT.`);
      await db.execute(
        "INSERT INTO FeePayment (id, studentId, batchId, amount, status, period, dueDate, invoiceNo, paidAt) VALUES (?, ?, ?, ?, 'PAID', ?, NOW(), ?, NOW())",
        [newId, studentId, batchId, amount, period, invoiceNo]
      );
    }

    console.log(`[submitFeePayment SUCCESS] for ${studentId}`);
    revalidatePath("/admin/fees");
    return { success: true };
  } catch (error: any) {
    console.error(`[submitFeePayment FATAL ERROR]`, error);
    return { success: false, error: error.message };
  }
}

export async function disburseMonthSalary(teacherId: string, amount: number, period: string) {
  console.log(`[disburseMonthSalary START] Teacher: ${teacherId}, Amt: ${amount}, Period: ${period}`);
  try {
    const existing = await db.queryOne<any>(
      "SELECT id FROM SalaryPayment WHERE teacherId = ? AND period = ?",
      [teacherId, period]
    );

    if (existing) {
      console.log(`[disburseMonthSalary] Record exists (${existing.id}), updating to PAID.`);
      await db.execute(
        "UPDATE SalaryPayment SET status = 'PAID', amount = ?, paidAt = NOW() WHERE id = ?",
        [amount, existing.id]
      );
    } else {
      const id = `sal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log(`[disburseMonthSalary] Creating NEW record: ${id}`);
      await db.execute(
        "INSERT INTO SalaryPayment (id, teacherId, amount, period, status, paidAt) VALUES (?, ?, ?, ?, 'PAID', NOW())",
        [id, teacherId, amount, period]
      );
    }

    revalidatePath("/admin/fees");
    revalidatePath(`/admin/teachers/${teacherId}`);
    console.log(`[disburseMonthSalary SUCCESS] for ${teacherId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[disburseMonthSalary FATAL ERROR]`, error);
    return { success: false, error: error.message };
  }
}

export async function assignTeacherToBatch(batchId: string, teacherId: string) {
  try {
    await db.execute(
      "UPDATE Batch SET teacherId = ? WHERE id = ?",
      [teacherId, batchId]
    );
    revalidatePath("/admin/teachers");
    revalidatePath("/admin/batches");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTeacherSalary(teacherId: string, amount: number) {
  try {
    await db.execute(
      "UPDATE Teacher SET monthlySalary = ? WHERE id = ?",
      [amount, teacherId]
    );
    revalidatePath(`/admin/teachers/${teacherId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createBatch(data: {
  name: string;
  teacherId: string;
  capacity: number;
  schedule: string;
  fee: number;
  startDate: string;
}) {
  try {
    const id = `b_${Date.now()}`;
    await db.execute(
      "INSERT INTO Batch (id, name, teacherId, capacity, schedule, fee, startDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')",
      [id, data.name, data.teacherId, data.capacity, data.schedule, data.fee, data.startDate]
    );
    revalidatePath("/admin/batches");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFeeStatus(paymentId: string, status: string, amount?: number) {
  try {
    if (amount !== undefined) {
      await db.execute(
        "UPDATE FeePayment SET status = ?, paidAt = ?, amount = ? WHERE id = ?",
        [status, status === 'PAID' ? new Date() : null, amount, paymentId]
      );
    } else {
      await db.execute(
        "UPDATE FeePayment SET status = ?, paidAt = ? WHERE id = ?",
        [status, status === 'PAID' ? new Date() : null, paymentId]
      );
    }
    revalidatePath("/admin/fees");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitAssignment(data: {
  assignmentId: string;
  studentId: string;
  notes: string;
  fileUrl?: string;
}) {
  try {
    const id = `sub_${Date.now()}`;
    await db.execute(
      "INSERT INTO Submission (id, assignmentId, studentId, notes, fileUrl, submittedAt) VALUES (?, ?, ?, ?, ?, NOW())",
      [id, data.assignmentId, data.studentId, data.notes, data.fileUrl || null]
    );
    revalidatePath("/student/assignments");
    revalidatePath("/student/batches");
    revalidatePath("/teacher/assignments");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOrCreateLiveSession(batchId: string) {
  try {
    const existing = await db.queryOne<any>(
      "SELECT id FROM ClassSession WHERE batchId = ? AND DATE(scheduledAt) = CURDATE() AND status IN ('SCHEDULED', 'LIVE')",
      [batchId]
    );
    if (existing) return { success: true, sessionId: existing.id };
    const id = `cs_${Date.now()}`;
    await db.execute(
      "INSERT INTO ClassSession (id, batchId, topic, scheduledAt, status) VALUES (?, ?, 'Live Class Session', NOW(), 'LIVE')",
      [id, batchId]
    );
    revalidatePath("/teacher/dashboard");
    revalidatePath("/student/classes");
    return { success: true, sessionId: id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAttendance(sessionId: string, studentId: string) {
  try {
    const id = `att_${Date.now()}`;
    await db.execute(
      "INSERT INTO Attendance (id, studentId, classSessionId, status, markedAt) VALUES (?, ?, ?, 'PRESENT', NOW()) ON DUPLICATE KEY UPDATE status = 'PRESENT', markedAt = NOW()",
      [id, studentId, sessionId]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function gradeSubmission(submissionId: string, grade: string, score: number, feedback: string) {
  try {
    await db.execute(
      "UPDATE Submission SET grade = ?, score = ?, feedback = ?, gradedAt = NOW() WHERE id = ?",
      [grade, score, feedback, submissionId]
    );
    revalidatePath("/teacher/assignments");
    revalidatePath("/student/assignments");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPortalUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER';
  phone?: string;
  specialization?: string;
}) {
  try {
    const userId = `u_${Date.now()}`;
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await db.execute(
      "INSERT INTO User (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, data.name, data.email, hashedPassword, data.role, data.phone || null]
    );
    if (data.role === 'STUDENT') {
      const studentId = `s_${Date.now()}`;
      await db.execute("INSERT INTO Student (id, userId) VALUES (?, ?)", [studentId, userId]);
    } else if (data.role === 'TEACHER') {
      const teacherId = `t_${Date.now()}`;
      await db.execute(
        "INSERT INTO Teacher (id, userId, specialization) VALUES (?, ?, ?)",
        [teacherId, userId, data.specialization || 'General']
      );
    }
    revalidatePath("/admin/students");
    revalidatePath("/admin/teachers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function enrollStudentInBatch(studentId: string, batchId: string) {
  try {
    const id = `e_${Date.now()}`;
    await db.execute(
      "INSERT INTO Enrollment (id, studentId, batchId, status) VALUES (?, ?, ?, 'ACTIVE') ON DUPLICATE KEY UPDATE status = 'ACTIVE', batchId = VALUES(batchId)",
      [id, studentId, batchId]
    );
    revalidatePath("/admin/students");
    revalidatePath("/admin/batches");
    revalidatePath("/student/classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function unenrollStudent(studentId: string, batchId: string) {
  try {
    await db.execute(
      "DELETE FROM Enrollment WHERE studentId = ? AND batchId = ?",
      [studentId, batchId]
    );
    revalidatePath("/admin/students");
    revalidatePath("/admin/batches");
    revalidatePath(`/admin/batches/${batchId}`);
    revalidatePath("/student/classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBatch(batchId: string, data: {
  name: string;
  teacherId: string;
  schedule: string;
  capacity: number;
  status: string;
}) {
  try {
    await db.execute(
      "UPDATE Batch SET name = ?, teacherId = ?, schedule = ?, capacity = ?, status = ? WHERE id = ?",
      [data.name, data.teacherId, data.schedule, data.capacity, data.status, batchId]
    );
    revalidatePath("/admin/batches");
    revalidatePath(`/admin/batches/${batchId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTeacherProfile(teacherId: string, data: {
  name: string;
  phone: string;
  specialization: string;
  availability: string;
  monthlySalary?: number;
}) {
  try {
    const teacherRes = await db.queryOne<any>("SELECT userId FROM Teacher WHERE id = ?", [teacherId]);
    if (!teacherRes) throw new Error("Teacher not found");
    await db.execute(
      "UPDATE User SET name = ?, phone = ? WHERE id = ?",
      [data.name, data.phone, teacherRes.userId]
    );
    
    if (data.monthlySalary !== undefined) {
      await db.execute(
        "UPDATE Teacher SET specialization = ?, availability = ?, monthlySalary = ? WHERE id = ?",
        [data.specialization, data.availability, data.monthlySalary, teacherId]
      );
    } else {
      await db.execute(
        "UPDATE Teacher SET specialization = ?, availability = ? WHERE id = ?",
        [data.specialization, data.availability, teacherId]
      );
    }
    revalidatePath("/admin/teachers");
    revalidatePath(`/admin/teachers/${teacherId}`);
    revalidatePath("/teacher/dashboard");
    revalidatePath("/teacher/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBatchCurriculum(batchId: string, curriculum: any[]) {
  try {
    const curriculumJson = JSON.stringify(curriculum);
    await db.execute(
      "UPDATE Batch SET curriculum = ? WHERE id = ?",
      [curriculumJson, batchId]
    );
    revalidatePath(`/teacher/batches/${batchId}/manage`);
    revalidatePath(`/admin/batches/${batchId}`);
    revalidatePath(`/student/batches/${batchId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSalaryStatus(paymentId: string, status: string, amount?: number) {
  try {
    if (amount !== undefined) {
      await db.execute(
        "UPDATE SalaryPayment SET status = ?, paidAt = ?, amount = ? WHERE id = ?",
        [status, status === 'PAID' ? new Date() : null, amount, paymentId]
      );
    } else {
      await db.execute(
        "UPDATE SalaryPayment SET status = ?, paidAt = ? WHERE id = ?",
        [status, status === 'PAID' ? new Date() : null, paymentId]
      );
    }
    revalidatePath("/admin/fees");
    revalidatePath("/admin/teachers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateMonthlyFees(period: string) {
  try {
    const enrollments = await db.query<any>(`
      SELECT e.studentId, e.batchId, b.fee 
      FROM Enrollment e
      JOIN Batch b ON e.batchId = b.id
      WHERE e.status = 'ACTIVE'
    `);
    for (const en of enrollments) {
      const id = `fp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const invoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substring(7)}`.toUpperCase();
      const existing = await db.queryOne<any>(
        "SELECT id FROM FeePayment WHERE studentId = ? AND batchId = ? AND period = ?",
        [en.studentId, en.batchId, period]
      );
      if (!existing) {
        await db.execute(
          "INSERT INTO FeePayment (id, studentId, batchId, amount, period, dueDate, status, invoiceNo) VALUES (?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'PENDING', ?)",
          [id, en.studentId, en.batchId, en.fee, period, invoiceNo]
        );
      }
    }
    revalidatePath("/admin/fees");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateMonthlySalaries(period: string) {
  try {
    const teachers = await db.query<any>("SELECT id, monthlySalary FROM Teacher WHERE monthlySalary > 0");
    for (const t of teachers) {
      const id = `sal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const existing = await db.queryOne<any>(
        "SELECT id FROM SalaryPayment WHERE teacherId = ? AND period = ?",
        [t.id, period]
      );
      if (!existing) {
        await db.execute(
          "INSERT INTO SalaryPayment (id, teacherId, amount, period, status) VALUES (?, ?, ?, ?, 'PENDING')",
          [id, t.id, t.monthlySalary, period]
        );
      }
    }
    revalidatePath("/admin/fees");
    revalidatePath("/admin/teachers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTrialStatus(trialId: string, status: string, notes?: string) {
  try {
    const trialRef = doc(firestore, "trials", trialId);
    if (notes !== undefined) {
      await updateDoc(trialRef, { status, notes, updatedAt: new Date() });
    } else {
      await updateDoc(trialRef, { status, updatedAt: new Date() });
    }
    revalidatePath("/admin/trials");
    return { success: true };
  } catch (error: any) {
    console.error("Firestore update error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTrial(trialId: string) {
  try {
    const trialRef = doc(firestore, "trials", trialId);
    await deleteDoc(trialRef);
    revalidatePath("/admin/trials");
    return { success: true };
  } catch (error: any) {
    console.error("Firestore delete error:", error);
    return { success: false, error: error.message };
  }
}
