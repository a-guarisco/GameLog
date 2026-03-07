interface PlayerFriendItem {
    "steamid": string,
    "relationship": string,
    "friend_since": number
}

export interface PlayerFriends{
    "friendslist": {
        "friends": PlayerFriendItem[]
    }
}