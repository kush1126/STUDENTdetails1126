import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data.sqlite');

export const db = new sqlite3.Database(dbPath);

export function initDb() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rollNumber TEXT NOT NULL,
        aadhaarNumber TEXT NOT NULL,
        class TEXT NOT NULL,
        section TEXT NOT NULL,
        motherName TEXT NOT NULL,
        fatherName TEXT NOT NULL,
        bloodGroup TEXT NOT NULL,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        bankAccountName TEXT NOT NULL,
        bankAccountNumber TEXT NOT NULL,
        ifsc TEXT NOT NULL,
        bankName TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL
      )`
    );
  });
}



