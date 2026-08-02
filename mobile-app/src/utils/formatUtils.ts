export const formatMinutesToHours = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
export const formatMinutesToHoursShort = (mins: number) => `${Math.floor(mins / 60)}h`;

export const formatAchievementName = (name: string): string => name.replace(/_/g, ' ').trim();

export const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString();
