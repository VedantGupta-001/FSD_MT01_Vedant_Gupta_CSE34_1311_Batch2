const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// ─── In-Memory Data Store ────────────────────────────────────────────────────
let students = [
  { id: 201, rollNumber: 'CSE2401', name: 'Aarav Sharma',  branch: 'CSE', semester: 3, email: 'aarav@example.com'  },
  { id: 202, rollNumber: 'ECE2402', name: 'Diya Verma',    branch: 'ECE', semester: 3, email: 'diya@example.com'   },
  { id: 203, rollNumber: 'CSE2403', name: 'Kabir Singh',   branch: 'CSE', semester: 3, email: 'kabir@example.com'  },
];

// Auto-increment counter — start above the highest seed id
let nextId = 204;

// ─── Helper: validate required fields ────────────────────────────────────────
function validateStudent(body) {
  const required = ['rollNumber', 'name', 'branch', 'semester', 'email'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return `Missing required field: ${field}`;
    }
  }
  if (typeof body.rollNumber !== 'string') return 'rollNumber must be a string';
  if (typeof body.name       !== 'string') return 'name must be a string';
  if (typeof body.branch     !== 'string') return 'branch must be a string';
  if (typeof body.email      !== 'string') return 'email must be a string';
  if (typeof body.semester   !== 'number') return 'semester must be a number';
  return null; // valid
}

// ─── 1. GET /api/students — return all records ───────────────────────────────
app.get('/api/students', (req, res) => {
  res.status(200).json(students);
});

// ─── 2. POST /api/students — create a new record ─────────────────────────────
app.post('/api/students', (req, res) => {
  const error = validateStudent(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const newStudent = {
    id:         nextId++,
    rollNumber: req.body.rollNumber,
    name:       req.body.name,
    branch:     req.body.branch,
    semester:   req.body.semester,
    email:      req.body.email,
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

// ─── 3. GET /api/students/filter — filter by branch (must come before /:id) ──
app.get('/api/students/filter', (req, res) => {
  const branchQuery = req.query.branch;
  if (!branchQuery) {
    return res.status(400).json({ error: 'Query parameter "branch" is required' });
  }

  const result = students.filter(
    s => s.branch.toLowerCase() === branchQuery.toLowerCase()
  );

  res.status(200).json(result); // empty array if no match — still 200
});

// ─── 4. GET /api/students/:id — get one record ───────────────────────────────
app.get('/api/students/:id', (req, res) => {
  const id      = parseInt(req.params.id);
  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ error: `Student with id ${id} not found` });
  }

  res.status(200).json(student);
});

// ─── 5. PUT /api/students/:id — update a record ──────────────────────────────
app.put('/api/students/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Student with id ${id} not found` });
  }

  const error = validateStudent(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  students[index] = {
    id,
    rollNumber: req.body.rollNumber,
    name:       req.body.name,
    branch:     req.body.branch,
    semester:   req.body.semester,
    email:      req.body.email,
  };

  res.status(200).json(students[index]);
});

// ─── 6. DELETE /api/students/:id — delete a record ───────────────────────────
app.delete('/api/students/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Student with id ${id} not found` });
  }

  students.splice(index, 1);
  res.status(200).json({ message: `Student with id ${id} deleted successfully` });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Student Record Management API running at http://localhost:${PORT}`);
});

module.exports = app; // export for testing
