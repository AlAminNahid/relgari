const visitors = Number(process.argv[2] ?? 300);
const api = process.argv[3] ?? 'http://127.0.0.1:4000';
const secret = process.env.PROXY_SECRET;
const headers = (n) => ({
  'Content-Type': 'application/json',
  ...(secret && {
    'x-relgari-proxy-secret': secret,
    'x-relgari-client-ip': `10.${(n >> 16) & 255}.${(n >> 8) & 255}.${n & 255}`,
  }),
});
const body = (id) =>
  JSON.stringify({
    train: 722,
    from: 'DAC',
    date: '2026-11-29',
    visitorId: id,
  });
const join = async (id, n = Number(id.split('-').pop())) => {
  const res = await fetch(`${api}/queue/join`, {
    method: 'POST',
    headers: headers(n),
    body: body(id),
  });
  return { status: res.status, data: res.ok ? await res.json() : null };
};

const ids = Array.from(
  { length: visitors },
  (_, i) => `sim-${Date.now()}-${i}`,
);
const results = await Promise.all(ids.map((id) => join(id)));

const bad = results.filter((r) => r.status !== 200).length;
const ok = results.filter((r) => r.data);
const inside = ok.filter((r) => r.data.state === 'admitted').length;
const waiting = ok.filter((r) => r.data.state === 'waiting');
const places = waiting.map((r) => r.data.position).sort((a, b) => a - b);
const unique = new Set(places).size === places.length;
const contiguous = places.every((p, i) => p === i + 1);
const capacity = ok[0]?.data.capacity;

console.log({
  visitors,
  capacity,
  inside,
  waiting: waiting.length,
  rejected: bad,
});
console.log(
  'places unique:',
  unique,
  '| places 1..N with no gaps:',
  contiguous,
);
console.log('inside never above capacity:', inside <= capacity);

// Free 20 places, then check the first 20 waiting visitors get in.
const leavers = ids
  .filter((_, i) => results[i].data?.state === 'admitted')
  .slice(0, 20);
await Promise.all(
  leavers.map((id) =>
    fetch(`${api}/queue/leave`, {
      method: 'POST',
      headers: headers(Number(id.split('-').pop())),
      body: body(id),
    }),
  ),
);
const front = ids
  .filter((_, i) => results[i].data?.state === 'waiting')
  .slice(0, 20);
const after = await Promise.all(front.map((id) => join(id)));
console.log(
  'after 20 left, front-of-line admitted:',
  after.filter((r) => r.data?.state === 'admitted').length,
  '/ 20',
);
