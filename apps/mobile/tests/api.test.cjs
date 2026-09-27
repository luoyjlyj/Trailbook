const test = require('node:test');
const assert = require('node:assert/strict');
const { submitTravelRequest } = require('../src/lib/api.ts');
const draft = () => ({ city: '重庆', startDate: '2026-10-01', endDate: '2026-10-03', arrivalTime: '18:30', departureTime: '14:00', arrivalPlace: '重庆北站', departurePlace: '机场', hotel: ' 测试住处 ', guide: '', interests: ['城市夜景'], pace: '刚刚好', transport: '步行＋地铁', needs: '' });
const result = () => ({ status: 'validated', request: { ...draft(), hotel: '测试住处' }, timezone: 'Asia/Shanghai', durationDays: 3, persisted: false, itineraryGenerated: false });
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('posts JSON and accepts only a matching normalized validation response', async t => {
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(url, 'http://127.0.0.1:3000/travel-requests/validate');
    assert.equal(init.method, 'POST');
    assert.deepEqual(JSON.parse(init.body), draft());
    return json({ ok: true, data: result() });
  });
  assert.deepEqual(await submitTravelRequest(draft(), { baseUrl: 'http://127.0.0.1:3000/' }), result());
});
test('field errors from server survive as actionable validation errors', async t => {
  t.mock.method(globalThis, 'fetch', async () => json({ ok: false, error: { code: 'VALIDATION_ERROR', message: '字段不正确', fields: { hotel: '请核对住宿', arbitrary: 'ignored' } } }, 422));
  await assert.rejects(submitTravelRequest(draft()), error => error.code === 'VALIDATION_ERROR' && error.fields.hotel === '请核对住宿' && !error.fields.arbitrary);
});
test('offline and HTTP 500 return retryable messages, never successful receipts', async t => {
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(submitTravelRequest(draft()), error => error.code === 'NETWORK_ERROR');
  mock.mock.mockImplementation(async () => new Response('internal details', { status: 500 }));
  await assert.rejects(submitTravelRequest(draft()), error => error.code === 'SERVER_ERROR' && !error.message.includes('internal details'));
});
test('malformed success, different brief and false persistence claims are rejected', async t => {
  const mock = t.mock.method(globalThis, 'fetch', async () => new Response('<html>wrong server</html>'));
  await assert.rejects(submitTravelRequest(draft()), error => error.code === 'INVALID_RESPONSE');
  for (const data of [{}, { ...result(), persisted: true }, { ...result(), durationDays: 2 }, { ...result(), request: { ...draft(), hotel: 'another hotel' } }]) {
    mock.mock.mockImplementation(async () => json({ ok: true, data }));
    await assert.rejects(submitTravelRequest(draft()), error => error.code === 'INVALID_RESPONSE');
  }
});
test('timeout and user cancellation have distinct outcomes', async t => {
  t.mock.method(globalThis, 'fetch', (_url, { signal }) => new Promise((_resolve, reject) => {
    const abort = () => reject(new DOMException('Aborted', 'AbortError'));
    if (signal.aborted) abort(); else signal.addEventListener('abort', abort, { once: true });
  }));
  await assert.rejects(submitTravelRequest(draft(), { timeoutMs: 10 }), error => error.code === 'TIMEOUT');
  const controller = new AbortController();
  const request = submitTravelRequest(draft(), { signal: controller.signal });
  controller.abort();
  await assert.rejects(request, error => error.code === 'CANCELLED');
});
test('invalid URL configuration does not issue a request', async t => {
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not call'); });
  await assert.rejects(submitTravelRequest(draft(), { baseUrl: 'file:///secret' }), error => error.code === 'CONFIG_ERROR');
  assert.equal(mock.mock.callCount(), 0);
});
