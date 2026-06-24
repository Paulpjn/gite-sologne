const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://paulpjn.github.io',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (!env.ICAL_URL) {
      return new Response(JSON.stringify({ dates: [], error: 'ICAL_URL secret non configuré' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    try {
      const res = await fetch(env.ICAL_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!res.ok) throw new Error(`Airbnb HTTP ${res.status}`);

      const ics = await res.text();
      const dates = parseIcal(ics);

      return new Response(JSON.stringify({ dates }), {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ dates: [], error: e.message }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};

function parseIcal(ics) {
  const dates = new Set();
  const events = ics.split('BEGIN:VEVENT').slice(1);

  for (const event of events) {
    const startMatch = event.match(/DTSTART(?:;[^:]*)?:(\d{8})/);
    const endMatch   = event.match(/DTEND(?:;[^:]*)?:(\d{8})/);
    if (!startMatch || !endMatch) continue;

    const start = icalDateToJs(startMatch[1]);
    const end   = icalDateToJs(endMatch[1]);

    // DTEND is exclusive in iCal (checkout day) — mark DTSTART..DTEND-1
    const cur = new Date(start);
    while (cur < end) {
      dates.add(toYMD(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }

  return [...dates].sort();
}

function icalDateToJs(str) {
  return new Date(
    parseInt(str.slice(0, 4), 10),
    parseInt(str.slice(4, 6), 10) - 1,
    parseInt(str.slice(6, 8), 10),
  );
}

function toYMD(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
