import { PublishedFileDetails } from '@gamelog/api-manager/dto';
import { filterValidCaptures, mergeUniqueCaptures } from '@gamelog/api-manager/gameCapturesUtils';

const buildFile = (
  id: string,
  imageUrl: string = `http://example.com/${id}.jpg`
): PublishedFileDetails => ({
  publishedfileid: id,
  creator: '123',
  consumer_appid: 456,
  title: `Title ${id}`,
  short_description: `Desc ${id}`,
  image_url: imageUrl,
  preview_url: `http://example.com/${id}_preview.jpg`,
  image_width: 1920,
  image_height: 1080,
  time_created: 12345678,
  file_type: 5,
});

describe('gameCapturesUtils', () => {
  describe('filterValidCaptures', () => {
    it('returns empty array when details is undefined', () => {
      expect(filterValidCaptures(undefined)).toEqual([]);
    });

    it('filters out files without an image_url', () => {
      const input = [
        buildFile('1', 'http://example.com/1.jpg'),
        buildFile('2', ''),
        buildFile('3', 'http://example.com/3.jpg'),
      ];
      const result = filterValidCaptures(input);
      expect(result.map((f) => f.publishedfileid)).toEqual(['1', '3']);
    });
  });

  describe('mergeUniqueCaptures', () => {
    it('appends non-duplicate incoming items to existing items', () => {
      const existing = [buildFile('1'), buildFile('2')];
      const incoming = [buildFile('2'), buildFile('3')];

      const result = mergeUniqueCaptures(existing, incoming);
      expect(result.map((f) => f.publishedfileid)).toEqual(['1', '2', '3']);
    });
  });
});
