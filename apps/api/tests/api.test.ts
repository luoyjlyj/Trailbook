import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createApp } from '../src/app.ts';
import { readConfig } from '../src/config.ts';
import { interests, paces, transports } from '../src/schema.ts';
// Runtime-only comparison: the two apps keep independent TypeScript configurations.
const mobile = createRequire(import.meta.url)('../../mobile/src/lib/travel.ts');

const app = createApp();
const input = () => ({ city: '重庆', startDate: '2026-10-01', endDate: '2026-10-03', arrivalTime: '18:30', departureTime: '14:00', arrivalPlace: '重庆北站', departurePlace: '江北机场', hotel: '解放碑附近的住处', guide: '', interests: ['城市夜景'], pace: '刚刚好', transport: '步行＋地铁', needs: '' });
const post = (data: unknown, headers = {}) => app.request('/travel-requests/validate', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(data) });

test('health reports only the validation stage', async () => {
  const response = await app.request('/health');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).stage, 'validation-only');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
test('valid request is trimmed and explicitly not saved or generated', async () => {
  const response = await post({ ...input(), hotel: '  测试住处  ' });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.data.request.hotel, '测试住处');
  assert.equal(body.data.durationDays, 3);
  assert.equal(body.data.timezone, 'Asia/Shanghai');
  assert.equal(body.data.persisted, false);
  assert.equal(body.data.itineraryGenerated, false);
});
test('optional text may be omitted', async () => {
  const { guide: _guide, needs: _needs, ...request } = input();
  const body = await (await post(request)).json();
  assert.equal(body.data.request.guide, '');
  assert.equal(body.data.request.needs, '');
});
test('invalid date, time, range and same-day ordering fail independently of frontend', async () => {
  for (const patch of [{ startDate: '2026-02-29' }, { endDate: '2026-04-31' }, { arrivalTime: '24:00' }, { departureTime: '8:30' }, { endDate: '2026-09-30' }, { endDate: '2026-10-08' }, { endDate: '2026-10-01', departureTime: '18:30' }]) {
    const response = await post({ ...input(), ...patch });
    assert.equal(response.status, 422, JSON.stringify(patch));
    assert.equal((await response.json()).error.code, 'VALIDATION_ERROR');
  }
  assert.equal((await post({ ...input(), endDate: '2026-10-01', departureTime: '19:00' })).status, 200);
  assert.equal((await post({ ...input(), endDate: '2026-10-07' })).status, 200);
});
test('required fields, enum options, duplicate interests and types are validated', async () => {
  for (const patch of [{ city: '北京' }, { hotel: ' ' }, { arrivalPlace: '' }, { departurePlace: null }, { interests: [] }, { interests: ['bad'] }, { interests: ['城市夜景', '城市夜景'] }, { pace: '飞快' }, { transport: 1 }, { hotel: 123 }]) assert.equal((await post({ ...input(), ...patch })).status, 422);
  for (const payload of [null, [], 'text', {}, { ...input(), admin: true }]) assert.equal((await post(payload)).status, 422);
});
test('oversized individual fields produce field errors', async () => {
  const response = await post({ ...input(), guide: 'a'.repeat(2001), needs: 'a'.repeat(501), hotel: 'a'.repeat(121) });
  assert.equal(response.status, 422);
  const fields = (await response.json()).error.fields;
  for (const key of ['guide', 'needs', 'hotel']) assert.ok(fields[key]);
});
test('malformed JSON, media type and body size have stable HTTP errors', async () => {
  assert.equal((await app.request('/travel-requests/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' })).status, 400);
  assert.equal((await app.request('/travel-requests/validate', { method: 'POST', body: 'text' })).status, 415);
  const tooLarge = await post({ ...input(), guide: '中'.repeat(6000) });
  assert.equal(tooLarge.status, 413);
  assert.equal((await tooLarge.json()).error.code, 'PAYLOAD_TOO_LARGE');
});
test('CORS allows only configured browser origins, including preflight', async () => {
  const response = await post(input(), { Origin: 'http://localhost:8081' });
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'http://localhost:8081');
  assert.equal((await post(input(), { Origin: 'https://untrusted.example' })).status, 403);
  const preflight = await app.request('/travel-requests/validate', { method: 'OPTIONS', headers: { Origin: 'http://127.0.0.1:8081', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'http://127.0.0.1:8081');
});
test('missing routes return JSON and configuration rejects invalid port/origins', async () => {
  assert.equal((await (await app.request('/missing')).json()).error.code, 'NOT_FOUND');
  for (const PORT of ['0', '65536', '3000bad', '-1']) assert.throws(() => readConfig({ PORT }));
  for (const WEB_ORIGINS of ['*', 'null', '', 'http://localhost:8081/path']) assert.throws(() => readConfig({ WEB_ORIGINS }));
  assert.equal(readConfig({}).hostname, '127.0.0.1');
});
test('frontend choices stay consistent with the independent server contract', () => {
  assert.deepEqual(interests, mobile.interests);
  assert.deepEqual(paces, mobile.paces);
  assert.deepEqual(transports, mobile.transports);
});
