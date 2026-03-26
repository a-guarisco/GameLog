export const formatMinutesToHours = (mins: number) => `${Math.floor(mins / 60)}h`;

export const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString();
