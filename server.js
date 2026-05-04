const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = 3002;

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── In-Memory Database ──
let users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', createdAt: new Date().toLocaleString() },
  { id: 2, name: 'Bob Smith',     email: 'bob@example.com',   role: 'User',  createdAt: new Date().toLocaleString() },
];
let nextId = 3;

// ── CRUD Routes ──

// READ ALL — GET /api/users
app.get('/api/users', (req, res) => {
  res.json({ success: true, count: users.length, data: users });
});

// READ ONE — GET /api/users/:id
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// CREATE — POST /api/users
app.post('/api/users', (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }
  const newUser = {
    id: nextId++,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role || 'User',
    createdAt: new Date().toLocaleString(),
  };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// UPDATE — PUT /api/users/:id
app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });
  const { name, email, role } = req.body;
  users[index] = {
    ...users[index],
    name:  name  || users[index].name,
    email: email || users[index].email,
    role:  role  || users[index].role,
  };
  res.json({ success: true, data: users[index] });
});

// DELETE — DELETE /api/users/:id
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });
  const deleted = users.splice(index, 1)[0];
  res.json({ success: true, message: `User "${deleted.name}" deleted`, data: deleted });
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`\n🚀 API Server running at http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   GET    /api/users`);
  console.log(`   GET    /api/users/:id`);
  console.log(`   POST   /api/users`);
  console.log(`   PUT    /api/users/:id`);
  console.log(`   DELETE /api/users/:id\n`);
});