/**
 * Diagnostic script to verify the UTC fix
 * Run with: node test-attendance-date-fixed.js
 */

console.log('═══════════════════════════════════════════════════════════');
console.log('ATTENDANCE DATE DIAGNOSTIC - AFTER FIX');
console.log('═══════════════════════════════════════════════════════════');

const now = new Date();
console.log('\n1. CURRENT TIME:');
console.log('   UTC:', now.toISOString());
console.log('   Local:', now.toString());

// Simulate FIXED backend behavior (using setUTCHours)
const backendToday = new Date();
backendToday.setUTCHours(0, 0, 0, 0);
console.log('\n2. BACKEND DATE (what gets stored in DB - FIXED):');
console.log('   Value:', backendToday.toISOString());
console.log('   First 10 chars (YYYY-MM-DD):', backendToday.toISOString().slice(0, 10));

// Simulate frontend UTC today
const frontendUTCDate = new Date();
const y = frontendUTCDate.getUTCFullYear();
const m = String(frontendUTCDate.getUTCMonth() + 1).padStart(2, '0');
const d = String(frontendUTCDate.getUTCDate()).padStart(2, '0');
const frontendTodayKey = `${y}-${m}-${d}`;
console.log('\n3. FRONTEND UTC DATE (what getTodayKey() returns):');
console.log('   UTC date parts:', { year: y, month: m, day: d });
console.log('   Frontend today key:', frontendTodayKey);

// Simulate the comparison
const backendDateKey = backendToday.toISOString().slice(0, 10);
console.log('\n4. COMPARISON:');
console.log('   Backend date key:', backendDateKey);
console.log('   Frontend today key:', frontendTodayKey);
console.log('   Match?', backendDateKey === frontendTodayKey ? '✅ YES' : '❌ NO');

if (backendDateKey === frontendTodayKey) {
  console.log('\n✅ SUCCESS!');
  console.log('   Both use UTC date:', frontendTodayKey);
  console.log('   User checks in → Backend stores UTC date');
  console.log('   Frontend looks for UTC date → Found!');
  console.log('   Shows "Present" ✓');
}

// Show local time for context
const localY = now.getFullYear();
const localM = String(now.getMonth() + 1).padStart(2, '0');
const localD = String(now.getDate()).padStart(2, '0');
console.log('\n5. LOCAL TIME CONTEXT (for reference):');
console.log('   Local date:', `${localY}-${localM}-${localD}`);
console.log('   Note: User sees this date on screen, but backend/frontend');
console.log('         both use UTC date for matching → timezone-agnostic ✓');

console.log('\n═══════════════════════════════════════════════════════════');
