interface Genre {
  id: string;
  description: string;
}

interface AppData {
  success: boolean;
  data: {
    genres: Genre[];
  };
}

export type GameGenres = Record<string, AppData>;

export interface BackendGameGenres {
  app_id: string;
  genres: string[];
}
