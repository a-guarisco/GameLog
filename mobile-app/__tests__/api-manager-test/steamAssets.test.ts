import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';

describe('steamAssetUrls', () => {
  it('builds the game header image URL', () => {
    expect(steamAssetUrls.getGameHeaderImage('620')).toBe(
      'https://cdn.akamai.steamstatic.com/steam/apps/620/header.jpg'
    );
  });

  it('builds the game logo image URL', () => {
    expect(steamAssetUrls.getGameLogoImage('620', 'abc123')).toBe(
      'https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/620/abc123.jpg'
    );
  });

  it('builds the game capsule image URL', () => {
    expect(steamAssetUrls.getGameCapsuleImage('620')).toBe(
      'https://cdn.akamai.steamstatic.com/steam/apps/620/capsule_231x87.jpg'
    );
  });

  it('builds the game library cover image URL', () => {
    expect(steamAssetUrls.getGameLibraryCoverImage('620')).toBe(
      'https://cdn.akamai.steamstatic.com/steam/apps/620/library_600x900.jpg'
    );
  });
});
