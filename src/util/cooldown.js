const buckets = new Map(); // key: userId:command -> timestamp

export function onCooldown(userId, command, seconds) {
  const key = `${userId}:${command}`;
  const now = Date.now();
  const until = buckets.get(key) || 0;
  if (until > now) return Math.ceil((until - now) / 1000);
  buckets.set(key, now + seconds * 1000);
  return 0;
}
