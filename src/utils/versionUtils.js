export function compareVersions(currentVersion, serverVersion) {
  const current = String(currentVersion)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const server = String(serverVersion)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const maxLen = Math.max(current.length, server.length, 3);

  for (let i = 0; i < maxLen; i += 1) {
    const c = current[i] ?? 0;
    const s = server[i] ?? 0;
    if (s > c) return -1; // server newer -> update needed
    if (s < c) return 1; // current newer or ahead
  }
  return 0; // equal
}

export function isUpdateRequired(currentVersion, serverVersion) {
  return compareVersions(currentVersion, serverVersion) === -1;
}
