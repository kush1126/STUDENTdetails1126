async function login(username, password) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

function showAdmin() {
  document.getElementById('login-panel').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginMsg = document.getElementById('login-message');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginMsg.textContent = 'Logging in...';
    const fd = new FormData(loginForm);
    try {
      await login(fd.get('username'), fd.get('password'));
      showAdmin();
      loginMsg.textContent = '';
    } catch {
      loginMsg.textContent = 'Invalid credentials';
    }
  });

  document.getElementById('export-section').addEventListener('click', () => {
    const c = document.getElementById('admin-class').value;
    const s = document.getElementById('admin-section').value;
    if (!c || !s) { alert('Select class and section'); return; }
    window.location.href = `/api/admin/export/section?class=${encodeURIComponent(c)}&section=${encodeURIComponent(s)}`;
  });

  document.getElementById('export-personal').addEventListener('click', () => {
    const c = document.getElementById('pd-class').value;
    const s = document.getElementById('pd-section').value;
    const q = [];
    if (c) q.push(`class=${encodeURIComponent(c)}`);
    if (s) q.push(`section=${encodeURIComponent(s)}`);
    const qs = q.length ? `?${q.join('&')}` : '';
    window.location.href = `/api/admin/export/personal${qs}`;
  });

  document.getElementById('logout').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  });
});



