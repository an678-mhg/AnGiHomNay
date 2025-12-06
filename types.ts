export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapSource {
  title: string;
  uri: string;
}

export interface FoodSuggestion {
  text: string;
  mapSources: MapSource[];
}

export enum AppState {
  IDLE = 'IDLE',
  GETTING_LOCATION = 'GETTING_LOCATION',
  THINKING = 'THINKING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
