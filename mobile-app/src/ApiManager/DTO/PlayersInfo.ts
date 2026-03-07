interface PlayerPublicInfo{
    steamid: string,
    personaname: string,
    profileurl: string,
    avatar: string,
    avatarmedium: string,
    avatarfull: string,
    personastate: number,
    communityvisibilitystate: number,
    profilestate: number,
    lastlogoff: number,
    commentpermission: number,
    realname: string,
    primaryclanid: string,
    timecreated: number,
    gameid: number,
    gameserverip: string,
    gameextrainfo: string,
    cityid: number,
    loccountrycode: string,
    locstatecode: string
    personastateflags: number,
}

export interface PlayersInfo{
    response: {
        players: PlayerPublicInfo[]
    }
}