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