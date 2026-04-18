// Status-history helpers en week-doelen tellingen.

const DAY_MS = 24 * 60 * 60 * 1000;

export function appendStatusHistory(record, newStatus, nowIso) {
  const iso = nowIso || new Date().toISOString();
  const history = Array.isArray(record?.statusHistory) ? record.statusHistory : [];
  return [...history, { status: newStatus, datum: iso }];
}

function countTransitions(records, fromStatus, toStatus, sinceMs) {
  let count = 0;
  for (const r of records) {
    const history = Array.isArray(r.statusHistory) ? r.statusHistory : [];
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      if (entry.status !== toStatus) continue;
      const ts = new Date(entry.datum).getTime();
      if (Number.isNaN(ts) || ts < sinceMs) continue;
      const prevStatus = i > 0 ? history[i - 1].status : 'Nieuw';
      if (prevStatus === fromStatus) count += 1;
    }
  }
  return count;
}

function countReachingStatus(records, targetStatus, sinceMs) {
  let count = 0;
  for (const r of records) {
    const history = Array.isArray(r.statusHistory) ? r.statusHistory : [];
    const hit = history.find((e) => {
      if (e.status !== targetStatus) return false;
      const ts = new Date(e.datum).getTime();
      return !Number.isNaN(ts) && ts >= sinceMs;
    });
    if (hit) count += 1;
  }
  return count;
}

export function computeWeekStats(contacts, resellers) {
  const since = Date.now() - 7 * DAY_MS;
  const all = [...contacts, ...resellers];
  return {
    connecties: countTransitions(all, 'Nieuw', 'Warm', since),
    dms: countTransitions(all, 'Warm', 'Benaderd', since),
    reacties: countTransitions(all, 'Benaderd', 'Gesprek gevoerd', since),
    gesprekken: countReachingStatus(all, 'Gesprek gevoerd', since),
    partners: countReachingStatus(contacts, 'Klant', since)
      + countReachingStatus(resellers, 'Partner', since),
  };
}
