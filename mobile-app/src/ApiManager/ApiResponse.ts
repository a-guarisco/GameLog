//todo The Steam API response contains more fields that what we are going to use, the backend should remove them.
//--------------ISteamNews----------------
interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  feed_type: number;
  appid: number;
}

export interface SteamNews {
  appnews: {
    appid: number;
    newsitems: SteamNewsItem[];
    count: number;
  };
}

//--------------ISteamUserStats----------------
interface GlobalAchievementItem {
  name: string;
  percent: number;
}

export interface GlobalAchievement {
  achievementpercentages: {
    achievements: GlobalAchievementItem[];
  };
}

//--------------ISteamUser----------------
interface PlayerAchievementItem {
  apiname: string;
  achieved: number;
}

interface PlayerStatItem {
  name: string;
  value: number;
}

export interface PlayerAchievement {
  playerstats: {
    steamID: string;
    gameName: string;
    achievements: PlayerAchievementItem[];
    stats: PlayerStatItem[];
  };
}
