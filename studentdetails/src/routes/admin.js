import { Router } from 'express';
import { db } from '../db.js';
import ExcelJS from 'exceljs';
import bcrypt from 'bcryptjs';

const router = Router();

// Seed a default admin in DB on first use (username: admin, password: admin123)
export function ensureDefaultAdmin() {
  db.get('SELECT id FROM admins WHERE username = ?', ['admin'], (err, row) => {
    if (err) return; // table might not exist yet; caller should ensure DB initialized
    if (!row) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.run('INSERT INTO admins (username, passwordHash) VALUES (?, ?)', ['admin', hash]);
    }
  });
}

function requireAuth(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, row) => {
    if (err || !row) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, row.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.admin = { id: row.id, username: row.username };
    return res.json({ success: true });
  });
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Export 1: Section summary (rollNumber, aadhaarNumber, name) for a class+section
router.get('/export/section', requireAuth, async (req, res) => {
  const { class: className, section } = req.query;
  if (!className || !section) return res.status(400).json({ error: 'class and section are required' });

  db.all(
    'SELECT rollNumber, aadhaarNumber, name FROM students WHERE class = ? AND section = ? ORDER BY rollNumber',
    [className, section],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to query' });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Section Summary');
      sheet.columns = [
        { header: 'Roll Number', key: 'rollNumber', width: 15 },
        { header: 'Aadhaar Number', key: 'aadhaarNumber', width: 20 },
        { header: 'Name', key: 'name', width: 30 },
      ];
      rows.forEach((r) => sheet.addRow(r));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=section_${className}_${section}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    }
  );
});

// Export 2: Personal data (all fields) for all students or optional filters
router.get('/export/personal', requireAuth, async (req, res) => {
  const { class: className, section } = req.query;
  const params = [];
  let sql = 'SELECT * FROM students';
  if (className && section) {
    sql += ' WHERE class = ? AND section = ?';
    params.push(className, section);
  }
  db.all(sql, params, async (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to query' });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Personal Data');
    sheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Aadhaar Number', key: 'aadhaarNumber', width: 20 },
      { header: 'Class', key: 'class', width: 10 },
      { header: 'Section', key: 'section', width: 10 },
      { header: 'Mother\'s Name', key: 'motherName', width: 25 },
      { header: 'Father\'s Name', key: 'fatherName', width: 25 },
      { header: 'Blood Group', key: 'bloodGroup', width: 12 },
      { header: 'State', key: 'state', width: 20 },
      { header: 'District', key: 'district', width: 20 },
      { header: 'Bank Account Name', key: 'bankAccountName', width: 25 },
      { header: 'Bank Account Number', key: 'bankAccountNumber', width: 22 },
      { header: 'IFSC', key: 'ifsc', width: 15 },
      { header: 'Bank Name', key: 'bankName', width: 25 },
      { header: 'Created At', key: 'createdAt', width: 22 },
    ];
    rows.forEach((r) => sheet.addRow(r));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=personal_data.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  });
});

export default router;


