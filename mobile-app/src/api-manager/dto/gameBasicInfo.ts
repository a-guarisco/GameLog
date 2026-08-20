export interface Requirements {
  minimum?: string;
  recommended?: string;
}

export interface GameBasicData {
  type?: string;
  name?: string;
  steam_appid?: number;
  required_age?: number | string;
  is_free?: boolean;
  dlc?: number[];
  detailed_description?: string;
  about_the_game?: string;
  short_description?: string;
  supported_languages?: string;
  header_image?: string;
  capsule_image?: string;
  capsule_imagev5?: string;
  website?: string | null;
  pc_requirements?: Requirements | Record<string, never> | any[];
  mac_requirements?: Requirements | Record<string, never> | any[];
  linux_requirements?: Requirements | Record<string, never> | any[];
}

export interface BasicAppData {
  success: boolean;
  data?: GameBasicData;
}

export type GameBasicInfo = Record<string, BasicAppData>;
