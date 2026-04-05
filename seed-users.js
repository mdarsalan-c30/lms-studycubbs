const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database Connection - uses environment variable for production, or local default
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/studycubs_lms';

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log('🚮 Performing ULTIMATE Database Reset & ALL Table Creation...');

  try {
    const adminPass = await bcrypt.hash('admin123', 10);
    const teacherPass = await bcrypt.hash('teacher123', 10);
    const studentPass = await bcrypt.hash('student123', 10);

    // 1. Drop EVERYTHING first
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    const tables = ['Attendance', 'ClassSession', 'Enrollment', 'FeePayment', 'Submission', 'Assignment', 'Batch', 'Student', 'Teacher', 'User'];
    for (const table of tables) {
      await connection.execute(`DROP TABLE IF EXISTS ${table}`);
      console.log(`- Dropped ${table}`);
    }
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

    console.log('🏗️ Recreating ALL Tables...');

    // User
    await connection.execute(`
      CREATE TABLE User (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) UNIQUE NOT NULL,
        password VARCHAR(191) NOT NULL,
        role ENUM('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT') DEFAULT 'STUDENT',
        phone VARCHAR(191),
        avatar VARCHAR(191),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);

    // Teacher
    await connection.execute(`
      CREATE TABLE Teacher (
        id VARCHAR(191) PRIMARY KEY,
        userId VARCHAR(191) UNIQUE NOT NULL,
        specialization VARCHAR(191) NOT NULL,
        availability VARCHAR(191),
        salaryAmount DECIMAL(10, 2),
        salaryStatus ENUM('PAID', 'PENDING') DEFAULT 'PENDING',
        joiningDate DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      )
    `);

    // Student
    await connection.execute(`
      CREATE TABLE Student (
        id VARCHAR(191) PRIMARY KEY,
        userId VARCHAR(191) UNIQUE NOT NULL,
        enrolledAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      )
    `);

    // Batch
    await connection.execute(`
      CREATE TABLE Batch (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        description TEXT,
        teacherId VARCHAR(191) NOT NULL,
        capacity INT DEFAULT 20,
        startDate DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        endDate DATETIME(3),
        schedule VARCHAR(191) NOT NULL,
        liveLink VARCHAR(191),
        fee DECIMAL(10, 2) NOT NULL,
        status ENUM('ACTIVE', 'UPCOMING', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (teacherId) REFERENCES Teacher(id)
      )
    `);

    // Enrollment
    await connection.execute(`
      CREATE TABLE Enrollment (
        id VARCHAR(191) PRIMARY KEY,
        studentId VARCHAR(191) NOT NULL,
        batchId VARCHAR(191) NOT NULL,
        enrolledAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        status ENUM('ACTIVE', 'DROPPED', 'COMPLETED') DEFAULT 'ACTIVE',
        UNIQUE(studentId, batchId),
        FOREIGN KEY (studentId) REFERENCES Student(id) ON DELETE CASCADE,
        FOREIGN KEY (batchId) REFERENCES Batch(id) ON DELETE CASCADE
      )
    `);

    // ClassSession
    await connection.execute(`
      CREATE TABLE ClassSession (
        id VARCHAR(191) PRIMARY KEY,
        batchId VARCHAR(191) NOT NULL,
        topic VARCHAR(191) NOT NULL,
        scheduledAt DATETIME(3) NOT NULL,
        duration INT DEFAULT 90,
        liveLink VARCHAR(191),
        status ENUM('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        FOREIGN KEY (batchId) REFERENCES Batch(id) ON DELETE CASCADE
      )
    `);

    // Attendance
    await connection.execute(`
      CREATE TABLE Attendance (
        id VARCHAR(191) PRIMARY KEY,
        studentId VARCHAR(191) NOT NULL,
        classSessionId VARCHAR(191) NOT NULL,
        status ENUM('PRESENT', 'ABSENT', 'LATE') DEFAULT 'ABSENT',
        markedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        UNIQUE(studentId, classSessionId),
        FOREIGN KEY (studentId) REFERENCES Student(id) ON DELETE CASCADE,
        FOREIGN KEY (classSessionId) REFERENCES ClassSession(id) ON DELETE CASCADE
      )
    `);

    // Assignment
    await connection.execute(`
      CREATE TABLE Assignment (
        id VARCHAR(191) PRIMARY KEY,
        batchId VARCHAR(191) NOT NULL,
        teacherId VARCHAR(191) NOT NULL,
        title VARCHAR(191) NOT NULL,
        instructions TEXT,
        dueDate DATETIME(3) NOT NULL,
        maxScore INT DEFAULT 100,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (batchId) REFERENCES Batch(id) ON DELETE CASCADE,
        FOREIGN KEY (teacherId) REFERENCES Teacher(id)
      )
    `);

    // Submission
    await connection.execute(`
      CREATE TABLE Submission (
        id VARCHAR(191) PRIMARY KEY,
        assignmentId VARCHAR(191) NOT NULL,
        studentId VARCHAR(191) NOT NULL,
        fileUrl VARCHAR(191),
        notes TEXT,
        submittedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        grade VARCHAR(191),
        score INT,
        feedback TEXT,
        gradedAt DATETIME(3),
        UNIQUE(assignmentId, studentId),
        FOREIGN KEY (assignmentId) REFERENCES Assignment(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES Student(id) ON DELETE CASCADE
      )
    `);

    // FeePayment
    await connection.execute(`
      CREATE TABLE FeePayment (
        id VARCHAR(191) PRIMARY KEY,
        studentId VARCHAR(191) NOT NULL,
        batchId VARCHAR(191) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(191) DEFAULT 'INR',
        status ENUM('PAID', 'PENDING', 'OVERDUE', 'WAIVED') DEFAULT 'PENDING',
        period VARCHAR(191) NOT NULL,
        dueDate DATETIME(3) NOT NULL,
        paidAt DATETIME(3),
        method VARCHAR(191),
        notes TEXT,
        invoiceNo VARCHAR(191) UNIQUE NOT NULL,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (studentId) REFERENCES Student(id) ON DELETE CASCADE,
        FOREIGN KEY (batchId) REFERENCES Batch(id)
      )
    `);

    // Seeding Fresh Data
    console.log('🌱 Seeding Fresh Data...');
    
    // Admin
    await connection.execute(
      "INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      ['u_admin', 'System Admin', 'admin@studycubs.com', adminPass, 'SUPER_ADMIN']
    );

    // Teacher
    await connection.execute(
      "INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      ['u_teacher', 'John Doe', 'teacher@studycubs.com', teacherPass, 'TEACHER']
    );
    await connection.execute(
      "INSERT INTO Teacher (id, userId, specialization) VALUES (?, ?, ?)",
      ['t_1', 'u_teacher', 'English Proficiency']
    );

    // Student
    await connection.execute(
      "INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      ['u_student', 'Aditya Sharma', 'student@studycubs.com', studentPass, 'STUDENT']
    );
    await connection.execute(
      "INSERT INTO Student (id, userId) VALUES (?, ?)",
      ['s_1', 'u_student']
    );

    // Batch
    await connection.execute(
      "INSERT INTO Batch (id, name, teacherId, schedule, fee, startDate) VALUES (?, ?, ?, ?, ?, ?)",
      ['b_1', 'English Speaking A1', 't_1', 'Mon, Wed, Fri - 6:00 PM', 8000, '2026-04-01']
    );

    // Enrollment
    await connection.execute(
      "INSERT INTO Enrollment (id, studentId, batchId) VALUES (?, ?, ?)",
      ['e_1', 's_1', 'b_1']
    );

    // Assignment & Submission (to satisfy dashboard queries)
    await connection.execute(
      "INSERT INTO Assignment (id, batchId, teacherId, title, dueDate) VALUES (?, ?, ?, ?, ?)",
      ['a_1', 'b_1', 't_1', 'Basics of Pronunciation', '2026-04-10']
    );

    console.log('✅ COMPLETE RESET & SEEDING FINISHED!');
  } catch (err) {
    console.error('❌ Reset/Seeding failed:', err.message);
  } finally {
    await connection.end();
  }
}

seed();
