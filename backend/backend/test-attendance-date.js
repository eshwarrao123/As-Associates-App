/**
 * Diagnostic script to test attendance date handling
 * Run with: node test-attendance-date.js
 */

console.log('═══════════════════════════════════════════════════════════');
console.log('ATTENDANCE DATE DIAGNOSTIC');
console.log('═══════════════════════════════════════════════════════════');

const now = new Date();
console.log('\n1. CURRENT TIME:');
console.log('   UTC:', now.toISOString());
console.log('   Local:', now.toString());

// Simulate backend behavior (attendance.service.ts line 41-64)
const backendToday = new Date();
backendToday.setHours(0, 0, 0, 0);
console.log('\n2. BACKEND DATE (what gets stored in DB):');
console.log('   Value:', backendToday.toISOString());
console.log('   First 10 chars (YYYY-MM-DD):', backendToday.toISOString().slice(0, 10));

// Simulate frontend local today
const frontendLocalDate = new Date();
const y = frontendLocalDate.getFullYear();
const m = String(frontendLocalDate.getMonth() + 1).padStart(2, '0');
const d = String(frontendLocalDate.getDate()).padStart(2, '0');
const frontendTodayKey = `${y}-${m}-${d}`;
console.log('\n3. FRONTEND LOCAL DATE (what user sees as "today"):');
console.log('   Local date parts:', { year: y, month: m, day: d });
console.log('   Frontend today key:', frontendTodayKey);

// Simulate the comparison
const backendDateKey = backendToday.toISOString().slice(0, 10);
console.log('\n4. COMPARISON:');
console.log('   Backend date key:', backendDateKey);
console.log('   Frontend today key:', frontendTodayKey);
console.log('   Match?', backendDateKey === frontendTodayKey ? '✅ YES' : '❌ NO');

if (backendDateKey !== frontendTodayKey) {
  console.log('\n⚠️  MISMATCH DETECTED!');
  console.log('   This causes the "Absent" bug when:');
  console.log('   - User checks in for local date:', frontendTodayKey);
  console.log('   - Backend stores UTC date:', backendDateKey);
  console.log('   - Frontend looks for:', frontendTodayKey);
  console.log('   - Not found → Shows "Absent"');
}

console.log('\n5. TIMEZONE INFO:');
console.log('   Offset minutes:', new Date().getTimezoneOffset());
console.log('   Offset hours:', new Date().getTimezoneOffset() / 60);

console.log('\n═══════════════════════════════════════════════════════════');
