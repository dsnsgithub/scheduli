export function formatDate(date: Date) {
  return date.toLocaleDateString();
}

export function parseUserDate(dateString: string | number | Date): Date {
  const userDate = new Date(dateString);
  const offsetMs = userDate.getTimezoneOffset() * 60000;
  return new Date(userDate.getTime() + offsetMs);
}

export function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
