/**
 * One entry of IPublishedFileService/QueryFiles. Steam returns ~50 fields per item;
 * only the ones the app consumes are typed here (see the todo in dto/index.ts).
 */
export interface PublishedFileDetails {
  publishedfileid: string;
  creator: string;
  consumer_appid: number;
  title: string;
  short_description: string;
  image_url: string;
  preview_url: string;
  image_width: number;
  image_height: number;
  time_created: number;
  file_type: number;
  tags?: { tag: string; display_name: string }[];
  views?: number;
  lifetime_favorited?: number;
  num_comments_public?: number;
}

export interface PublishedFiles {
  response: {
    total: number;
    publishedfiledetails?: PublishedFileDetails[];
    /**
     * Opaque token for the next page. Steam repeats the current cursor once the
     * end is reached, so compare it with the one sent to detect exhaustion.
     */
    next_cursor?: string;
  };
}
