const KEY = "relgari_visitor";

export function getVisitorId(): string {
  try {
    const known = localStorage.getItem(KEY);
    if (known) return known;
    const made = crypto.randomUUID();
    localStorage.setItem(KEY, made);
    return made;
  } catch {
    return crypto.randomUUID();
  }
}
