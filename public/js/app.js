const API = 'http://localhost:3002/api/users';
let allUsers = [];

// ── Load Users ──
async function loadUsers() {
  addLog('GET', 'GET /api/users — Fetching all users...');
  try {
    const res  = await fetch(API);
    const data = await res.json();
    allUsers   = data.data;
    renderUsers(allUsers);
    updateStats(allUsers);
    updateStatus(true);
    addLog('GET', `✅ ${data.count} users loaded successfully`);
  } catch (err) {
    updateStatus(false);
    addLog('DELETE', '❌ Cannot connect to API server!');
    showToast('❌ Cannot connect to server!');
  }
}

// ── Render Users ──
function renderUsers(users) {
  const list = document.getElementById('usersList');
  if (users.length === 0) {
    list.innerHTML = '<div class="empty">No users found.</div>';
    return;
  }
  list.innerHTML = users.map(u => `
    <div class="user-card" id="card-${u.id}">
      <div class="avatar">${u.name.charAt(0).toUpperCase()}</div>
      <div class="user-info">
        <div class="user-name">${u.name}</div>
        <div class="user-email">${u.email}</div>
      </div>
      <span class="user-role">${u.role}</span>
      <div class="user-actions">
        <button class="btn-edit" onclick="editUser(${u.id})">✏️ Edit</button>
        <button class="btn-delete" onclick="deleteUser(${u.id})">🗑 Del</button>
      </div>
    </div>
  `).join('');
}

// ── Update Stats ──
function updateStats(users) {
  document.getElementById('totalUsers').textContent  = users.length;
  document.getElementById('adminCount').textContent  = users.filter(u => u.role === 'Admin').length;
  document.getElementById('userCount').textContent   = users.filter(u => u.role === 'User').length;
}

// ── Search / Filter ──
function filterUsers() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q)
  );
  renderUsers(filtered);
}

// ── Submit Form (Create or Update) ──
async function submitForm() {
  const id    = document.getElementById('editId').value;
  const name  = document.getElementById('inputName').value.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const role  = document.getElementById('inputRole').value;

  // Validate
  let valid = true;
  if (name.length < 3) {
    document.getElementById('nameMsg').textContent = '❌ Name too short!';
    document.getElementById('nameMsg').className = 'msg error';
    valid = false;
  } else {
    document.getElementById('nameMsg').textContent = '✅';
    document.getElementById('nameMsg').className = 'msg success';
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    document.getElementById('emailMsg').textContent = '❌ Invalid email!';
    document.getElementById('emailMsg').className = 'msg error';
    valid = false;
  } else {
    document.getElementById('emailMsg').textContent = '✅';
    document.getElementById('emailMsg').className = 'msg success';
  }
  if (!valid) return;

  if (id) {
    // UPDATE
    addLog('PUT', `PUT /api/users/${id} — Updating user...`);
    try {
      const res  = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      addLog('PUT', `✅ User "${data.data.name}" updated!`);
      showToast(`✅ User updated successfully!`);
      resetForm();
      loadUsers();
    } catch (err) {
      showToast('❌ Update failed!');
    }
  } else {
    // CREATE
    addLog('POST', `POST /api/users — Creating new user...`);
    try {
      const res  = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      addLog('POST', `✅ User "${data.data.name}" created!`);
      showToast(`✅ User "${data.data.name}" added!`);
      resetForm();
      loadUsers();
    } catch (err) {
      showToast('❌ Create failed!');
    }
  }
}

// ── Edit User ──
function editUser(id) {
  const user = allUsers.find(u => u.id === id);
  if (!user) return;
  document.getElementById('editId').value       = user.id;
  document.getElementById('inputName').value    = user.name;
  document.getElementById('inputEmail').value   = user.email;
  document.getElementById('inputRole').value    = user.role;
  document.getElementById('formTitle').textContent    = '✏️ Edit User';
  document.getElementById('formSubtitle').textContent = `Editing: ${user.name}`;
  document.getElementById('submitText').textContent   = '💾 Update User';
  addLog('GET', `GET /api/users/${id} — Loading user for edit...`);
}

// ── Delete User ──
async function deleteUser(id) {
  const user = allUsers.find(u => u.id === id);
  if (!confirm(`Delete "${user.name}"?`)) return;
  addLog('DELETE', `DELETE /api/users/${id} — Deleting user...`);
  try {
    const res  = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    addLog('DELETE', `✅ "${data.data.name}" deleted!`);
    showToast(`🗑 "${data.data.name}" deleted!`);
    loadUsers();
  } catch (err) {
    showToast('❌ Delete failed!');
  }
}

// ── Reset Form ──
function resetForm() {
  document.getElementById('editId').value             = '';
  document.getElementById('inputName').value          = '';
  document.getElementById('inputEmail').value         = '';
  document.getElementById('inputRole').value          = 'User';
  document.getElementById('formTitle').textContent    = '➕ Add New User';
  document.getElementById('formSubtitle').textContent = 'Fill in the details below';
  document.getElementById('submitText').textContent   = '➕ Add User';
  document.getElementById('nameMsg').textContent      = '';
  document.getElementById('emailMsg').textContent     = '';
}

// ── API Status ──
function updateStatus(connected) {
  const el = document.getElementById('apiStatus');
  el.textContent = connected ? '🟢 Connected' : '🔴 Disconnected';
}

// ── API Log ──
function addLog(method, message) {
  const log  = document.getElementById('apiLog');
  const time = new Date().toLocaleTimeString();
  const div  = document.createElement('div');
  div.className = `log-entry log-${method}`;
  div.textContent = `[${time}] ${message}`;
  log.prepend(div);
}

function clearLog() {
  document.getElementById('apiLog').innerHTML = '';
}

// ── Toast ──
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Init ──
loadUsers();