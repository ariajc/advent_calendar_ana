// Unlock logic based on Europe/Madrid date
function getMadridDateParts() {
  const now = new Date();
  const opts = { timeZone: "Europe/Madrid", year: "numeric", month: "numeric", day: "numeric" };
  const [m, d, y] = new Intl.DateTimeFormat("en-GB", opts)
    .formatToParts(now)
    .reduce((acc, p) => {
      if (p.type === "day") acc[1] = parseInt(p.value, 10);
      if (p.type === "month") acc[0] = parseInt(p.value, 10);
      if (p.type === "year") acc[2] = parseInt(p.value, 10);
      return acc;
    }, [0,0,0]);

  return { y, m, d };
}

// Change this if you want a different month/year window:
const ADVENT_MONTH = 10;     // December
const ADVENT_YEAR  = new Date().getFullYear(); // e.g., 2025

function isUnlockable(day) {
  const { y, m, d } = getMadridDateParts();
  if (y > ADVENT_YEAR) return true;
  if (y < ADVENT_YEAR) return false;
  if (m > ADVENT_MONTH) return true;
  if (m < ADVENT_MONTH) return false;
  return d >= day;
}

const grid = document.getElementById("grid");
for (let day = 1; day <= 24; day++) {
  const a = document.createElement("a");
  a.className = "tile";
  a.setAttribute("role", "button");
  a.innerHTML = `<div>Day ${day}</div>`;

  if (isUnlockable(day)) {
    a.href = `days/day-${String(day).padStart(2, "0")}.html`;
    a.classList.add("unlocked");
  } else {
    a.classList.add("locked");
    a.innerHTML += `<div>🔒 Locked</div>`;
  }

  grid.appendChild(a);
}
