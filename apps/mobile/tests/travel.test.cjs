const test = require('node:test');
const assert = require('node:assert/strict');
const { emptyDraft, validateDraft, parseDate, parseTime, makeDemoTrip, copyTrip, updateActivity, decodeLibrary, emptyLibrary } = require('../src/lib/travel.ts');
const valid = () => ({ ...emptyDraft, startDate: '2026-10-01', endDate: '2026-10-03', arrivalTime: '18:30', departureTime: '14:00', arrivalPlace: '重庆北站', departurePlace: '机场', hotel: '住处', interests: ['城市夜景'] });

test('valid brief passes; empty fields do not', () => {
  assert.deepEqual(validateDraft(valid()), {});
  assert.ok(Object.keys(validateDraft(emptyDraft)).length >= 7);
});
test('dates reject rollover, malformed input and invalid leap day', () => {
  for (const value of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-1-01', '', '0000-01-01']) assert.equal(parseDate(value), null);
  assert.notEqual(parseDate('2028-02-29'), null);
});
test('time is strict 24-hour input', () => {
  for (const value of ['24:00', '12:60', '9:00', 'aa:bb', '']) assert.equal(parseTime(value), null);
  assert.equal(parseTime('00:00'), 0);
  assert.equal(parseTime('23:59'), 1439);
});
test('end must follow arrival, inclusive trip maximum is seven dates', () => {
  assert.ok(validateDraft({ ...valid(), endDate: '2026-09-30' }).endDate);
  assert.ok(validateDraft({ ...valid(), endDate: '2026-10-01', departureTime: '18:30' }).endDate);
  assert.equal(validateDraft({ ...valid(), endDate: '2026-10-01', departureTime: '18:31' }).endDate, undefined);
  assert.equal(validateDraft({ ...valid(), endDate: '2026-10-07' }).endDate, undefined);
  assert.ok(validateDraft({ ...valid(), endDate: '2026-10-08' }).endDate);
});
test('unknown city, whitespace-only hotel, no interests and overlong text are rejected', () => {
  const errors = validateDraft({ ...valid(), city: '北京', hotel: '   ', interests: [], guide: 'x'.repeat(2001), needs: 'x'.repeat(501) });
  for (const key of ['city', 'hotel', 'interests', 'guide', 'needs']) assert.ok(errors[key]);
});
test('lock blocks removal and replacement without mutating original', () => {
  const original = makeDemoTrip();
  const locked = updateActivity(original, 0, 'd1-dinner', 'lock');
  assert.equal(original.days[0].items[0].locked, false);
  assert.equal(locked.days[0].items[0].locked, true);
  assert.equal(updateActivity(locked, 0, 'd1-dinner', 'remove'), null);
  assert.equal(updateActivity(locked, 0, 'd1-dinner', 'replace', 'museum'), null);
  assert.equal(updateActivity(locked, 0, 'd1-dinner', 'lock').days[0].items[0].locked, false);
});
test('replace preserves slot and other locked items; invalid and duplicate candidates fail', () => {
  const original = updateActivity(makeDemoTrip(), 1, 'd2-lunch', 'lock');
  const next = updateActivity(original, 1, 'd2-culture', 'replace', 'museum');
  assert.equal(next.days[1].items[2].placeId, 'museum');
  assert.equal(next.days[1].items[2].time, '15:30');
  assert.deepEqual(next.days[1].items[1], original.days[1].items[1]);
  assert.equal(original.days[1].items[2].placeId, 'culture');
  assert.equal(updateActivity(original, 1, 'd2-culture', 'replace', 'noodles'), null);
  assert.equal(updateActivity(original, 1, 'd2-culture', 'replace', 'unknown'), null);
  assert.equal(updateActivity(original, 99, 'bad', 'remove'), null);
});
test('removing all items leaves a valid empty day; copies are independent', () => {
  const original = makeDemoTrip();
  const snapshot = copyTrip(original);
  const once = updateActivity(original, 0, 'd1-dinner', 'remove');
  const empty = updateActivity(once, 0, 'd1-night', 'remove');
  assert.equal(empty.days[0].items.length, 0);
  empty.days[1].items[0].locked = true;
  assert.equal(snapshot.days[1].items[0].locked, false);
  assert.equal(original.days[0].items.length, 2);
});
test('saved library round-trips and rejects corrupt or unknown data', () => {
  const library = { version: 1, saved: [{ trip: makeDemoTrip(), savedAt: new Date().toISOString() }], favorites: ['night'] };
  assert.deepEqual(decodeLibrary(JSON.stringify(library)), library);
  for (const raw of ['null', '{}', '{bad', JSON.stringify({ ...library, version: 2 }), JSON.stringify({ ...library, favorites: ['unknown'] })]) assert.throws(() => decodeLibrary(raw));
  const broken = structuredClone(library); broken.saved[0].trip.days[0].items[0].time = '30:00';
  assert.throws(() => decodeLibrary(JSON.stringify(broken)));
  assert.deepEqual(decodeLibrary(JSON.stringify(emptyLibrary())), emptyLibrary());
});
