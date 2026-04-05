const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database Connection - uses environment variable for production, or local default
const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/studycubs_lms';

async function init() {
  const connection = await mysql.createConnection(DATABASE_URL);
  console.log('🚀 Initializing Local MySQL Tables & Seed Data...');

  try {
    // 0. Drop existing tables for clean schema sync (Development only)
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("DROP TABLE IF EXISTS SalaryPayment, FeePayment, Teacher, Student, User, Batch, Enrollment, ClassSession, Attendance, Assignment, Submission");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log('🗑️ Cleaned up old schema...');

    // 1. Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS User (
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

    // 2. Teacher table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Teacher (
        id VARCHAR(191) PRIMARY KEY,
        userId VARCHAR(191) UNIQUE NOT NULL,
        specialization VARCHAR(191) NOT NULL,
        availability VARCHAR(191),
        monthlySalary DECIMAL(10, 2) DEFAULT 0,
        salaryStatus ENUM('PAID', 'PENDING') DEFAULT 'PENDING',
        joiningDate DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      )
    `);

    // 3. Student table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Student (
        id VARCHAR(191) PRIMARY KEY,
        userId VARCHAR(191) UNIQUE NOT NULL,
        enrolledAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      )
    `);

    // 4. Batch table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Batch (
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

    // 5. Enrollment table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Enrollment (
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

    // 6. ClassSession table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ClassSession (
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

    // 7. Attendance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Attendance (
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

    // 8. Assignment table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Assignment (
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

    // 9. Submission table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Submission (
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

    // 10. FeePayment table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS FeePayment (
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

    // 11. SalaryPayment table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS SalaryPayment (
        id VARCHAR(191) PRIMARY KEY,
        teacherId VARCHAR(191) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(191) DEFAULT 'INR',
        status ENUM('PAID', 'PENDING') DEFAULT 'PENDING',
        period VARCHAR(191) NOT NULL,
        paidAt DATETIME(3),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (teacherId) REFERENCES Teacher(id) ON DELETE CASCADE
      )
    `);

    // SEEDING DATA
    console.log('🌱 Seeding Default Users & Test Data...');
    const hashedPass = await bcrypt.hash('password123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);
    const teacherPass = await bcrypt.hash('teacher123', 10);
    const studentPass = await bcrypt.hash('student123', 10);

    // Default Admin
    await connection.execute(`
      INSERT INTO User (id, name, email, password, role) 
      VALUES ('u_admin', 'System Admin', 'admin@studycubs.com', ?, 'SUPER_ADMIN')
      ON DUPLICATE KEY UPDATE name=name
    `, [adminPass]);

    // Default Teacher
    await connection.execute(`
      INSERT INTO User (id, name, email, password, role) 
      VALUES ('u_teacher', 'John Doe', 'teacher@studycubs.com', ?, 'TEACHER')
      ON DUPLICATE KEY UPDATE name=name
    `, [teacherPass]);
    await connection.execute(`
      INSERT INTO Teacher (id, userId, specialization, availability) 
      VALUES ('t_1', 'u_teacher', 'English Proficiency', 'Mon-Fri 5pm-9pm')
      ON DUPLICATE KEY UPDATE specialization=specialization
    `);

    // Default Student
    await connection.execute(`
      INSERT INTO User (id, name, email, password, role) 
      VALUES ('u_student', 'Aditya Sharma', 'student@studycubs.com', ?, 'STUDENT')
      ON DUPLICATE KEY UPDATE name=name
    `, [studentPass]);
    await connection.execute(`
      INSERT INTO Student (id, userId) 
      VALUES ('s_1', 'u_student')
      ON DUPLICATE KEY UPDATE userId=userId
    `);

    // Default Batch
    await connection.execute(`
      INSERT INTO Batch (id, name, teacherId, schedule, fee, startDate) 
      VALUES ('b_1', 'English Speaking A1', 't_1', 'Mon, Wed, Fri - 6:00 PM', 8000, '2026-04-01')
      ON DUPLICATE KEY UPDATE name=name
    `);

    // Default Enrollment
    await connection.execute(`
      INSERT INTO Enrollment (id, studentId, batchId) 
      VALUES ('e_1', 's_1', 'b_1')
      ON DUPLICATE KEY UPDATE status=status
    `);

    // Default Session
    await connection.execute(`
      INSERT INTO ClassSession (id, batchId, topic, scheduledAt, liveLink) 
      VALUES ('cs_1', 'b_1', 'Pronunciation Basics', '2026-04-04 18:00:00', 'https://meet.google.com/abc-def-ghi')
      ON DUPLICATE KEY UPDATE topic=topic
    `);

    console.log('✅ Local MySQL initialization & seeding completed successfully!');
  } catch (error) {
    console.error('❌ Table initialization failed:', error.message);
  } finally {
    await connection.end();
  }
}

init();
