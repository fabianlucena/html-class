window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('attendance-form').addEventListener('submit', attendanceSubmit);
  const attendance = JSON.parse(localStorage.getItem('attendance') || '{}');

  for (const [key, value] of Object.entries(attendance)) {
    const input = document.querySelector(`[name="${key}"]`);
    if (input) {
      input.value = value;
    }
  }
});

function attendanceSubmit(e) {
  e.preventDefault();

  const data = new FormData(e.target);
  const json = Object.fromEntries(data.entries());
  delete json.subject;

  localStorage.setItem('attendance', JSON.stringify(json));
}