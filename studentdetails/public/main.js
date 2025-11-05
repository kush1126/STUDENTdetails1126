async function loadStates() {
  const stateSel = document.getElementById('state');
  stateSel.innerHTML = '<option value="">Loading...</option>';
  try {
    const res = await fetch('/api/states');
    const states = await res.json();
    stateSel.innerHTML = '<option value="">Select</option>' + states.map(s => `<option>${s}</option>`).join('');
  } catch {
    stateSel.innerHTML = '<option value="">Select</option>';
  }
}

async function loadDistricts(state) {
  const districtSel = document.getElementById('district');
  if (!state) { districtSel.innerHTML = '<option value="">Select</option>'; return; }
  districtSel.innerHTML = '<option value="">Loading...</option>';
  try {
    const res = await fetch(`/api/states/${encodeURIComponent(state)}/districts`);
    const districts = await res.json();
    const options = districts.length ? districts : [];
    districtSel.innerHTML = '<option value="">Select</option>' + options.map(d => `<option>${d}</option>`).join('');
  } catch {
    districtSel.innerHTML = '<option value="">Select</option>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadStates();
  document.getElementById('state').addEventListener('change', (e) => loadDistricts(e.target.value));

  const form = document.getElementById('student-form');
  const message = document.getElementById('message');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.textContent = 'Submitting...';
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());
    try {
      const res = await fetch('/api/student/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok && data.success) {
        message.textContent = 'Submitted successfully!';
        form.reset();
        document.getElementById('district').innerHTML = '<option value="">Select</option>';
      } else {
        message.textContent = data.error || 'Submission failed';
      }
    } catch (err) {
      message.textContent = 'Submission failed';
    }
  });
});



