// Deterministic (seeded) mock clock-in/out history for an officer, used by
// the "Officer Attendance History" lookup since there's no real multi-day
// clock data yet — this is illustrative, not persisted.

const SHIFT_PATTERNS = ['12h Day (06:00 - 18:00)', '12h Night (18:00 - 06:00)'];

function hashStringToInt(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatMinutes(mins) {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function computeHoursWorked(clockIn, clockOut) {
  if (!clockIn || !clockOut) return null;
  const [inH, inM] = clockIn.split(':').map(Number);
  const [outH, outM] = clockOut.split(':').map(Number);
  let startMins = inH * 60 + inM;
  let endMins = outH * 60 + outM;
  if (endMins <= startMins) endMins += 1440;
  return ((endMins - startMins) / 60).toFixed(1);
}

export function generateMockAttendanceHistory(emp, days = 14) {
  if (!emp) return [];

  const rand = mulberry32(hashStringToInt(emp.id));
  const today = new Date();
  const records = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const shiftIdx = hashStringToInt(`${emp.id}-${dateStr}`) % 2;
    const shiftPattern = SHIFT_PATTERNS[shiftIdx];
    const scheduledStart = shiftIdx === 0 ? 6 * 60 : 18 * 60;
    const scheduledEnd = scheduledStart + 12 * 60;

    const roll = rand();
    let clockIn = null;
    let clockOut = null;
    let status = 'On Time';

    if (roll < 0.08) {
      status = 'Absent';
    } else {
      const isLate = roll < 0.28;
      const lateMinutes = isLate ? Math.floor(rand() * 35) + 5 : Math.floor(rand() * 4);
      status = lateMinutes > 15 ? 'Late' : 'On Time';
      clockIn = formatMinutes(scheduledStart + lateMinutes);
      clockOut = formatMinutes(scheduledEnd + Math.floor(rand() * 12));
    }

    records.push({ date: dateStr, shiftPattern, clockIn, clockOut, status });
  }

  return records;
}
