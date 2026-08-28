const STEAM_CDN_URL = 'https://cdn.akamai.steamstatic.com';

export const steamAssetUrls = {
  getGameHeaderImage: (appId: string) => `${STEAM_CDN_URL}/steam/apps/${appId}/header.jpg`,
  getGameClearLogoImage: (appId: string) => `${STEAM_CDN_URL}/steam/apps/${appId}/logo.png`,
  getGameLogoImage: (appId: string, imgIconUrl: string) =>
    `${STEAM_CDN_URL}/steamcommunity/public/images/apps/${appId}/${imgIconUrl}.jpg`,
  getGameCapsuleImage: (appId: string) => `${STEAM_CDN_URL}/steam/apps/${appId}/capsule_231x87.jpg`,
  getGameLibraryCoverImage: (appId: string) =>
    `${STEAM_CDN_URL}/steam/apps/${appId}/library_600x900.jpg`,
};
