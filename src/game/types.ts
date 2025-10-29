export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type GameState = "menu" | "playing" | "game_over";

export const GameStateEnum = {
  MENU: "menu" as GameState,
  PLAYING: "playing" as GameState,
  GAME_OVER: "game_over" as GameState,
};
