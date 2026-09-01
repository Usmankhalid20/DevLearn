/**
 * Format total minutes into a human readable string (e.g. "2h 45m", "45m", "1h")
 */
export function formatHoursMins(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Format seconds into HH:MM:SS format
 */
export function formatTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get dynamic greeting based on current hour of the day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Filter sessions that occurred today (UTC/local ISO date match) and calculate total duration
 */
export function calculateTodayMinutes(
  sessions: Array<{ date?: string; createdAt?: string; durationMinutes: number }>
): number {
  const todayStr = new Date().toISOString().split('T')[0];
  return sessions
    .filter((s) => s.date?.startsWith(todayStr) || s.createdAt?.startsWith(todayStr))
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
}
