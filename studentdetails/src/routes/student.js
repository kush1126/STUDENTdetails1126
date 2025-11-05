import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.post('/submit', (req, res) => {
  const {
    name,
    rollNumber,
    aadhaarNumber,
    class: className,
    section,
    motherName,
    fatherName,
    bloodGroup,
    state,
    district,
    bankAccountName,
    bankAccountNumber,
    ifsc,
    bankName,
  } = req.body;

  if (!name || !rollNumber || !aadhaarNumber || !className || !section || !motherName || !fatherName || !bloodGroup || !state || !district || !bankAccountName || !bankAccountNumber || !ifsc || !bankName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const stmt = db.prepare(
    `INSERT INTO students 
    (name, rollNumber, aadhaarNumber, class, section, motherName, fatherName, bloodGroup, state, district, bankAccountName, bankAccountNumber, ifsc, bankName, createdAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, datetime('now'))`
  );
  stmt.run(
    [
      name,
      rollNumber,
      aadhaarNumber,
      className,
      section,
      motherName,
      fatherName,
      bloodGroup,
      state,
      district,
      bankAccountName,
      bankAccountNumber,
      ifsc,
      bankName,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to save' });
      return res.json({ success: true, id: this.lastID });
    }
  );
});

export default router;



