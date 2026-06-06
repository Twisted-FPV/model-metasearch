export type SourceId =
  | "makerworld"
  | "thangs"
  | "myminifactory"
  | "printables"
  | "stlfinder"
  | "cults3d";

export type SearchFilters = {
  sources?: SourceId[];
  limit?: number;
};

export type ModelSearchResult = {
  id: string;
  source: SourceId;
  title: string;
  url: string;
  thumbnailUrl?: string;
  creator?: string;
  price?: number;
  currency?: string;
  isFree?: boolean;
  license?: string;
  likes?: number;
  downloads?: number;
  publishedAt?: string;
  score?: number;
};

export type SourceAdapter = {
  id: SourceId;
  label: string;
  search(query: string, filters: SearchFilters, signal: AbortSignal): Promise<ModelSearchResult[]>;
};
