import "./style.css";
import { Game } from "./game/Game";

// Apply global styles via Tailwind classes
document.body.className = "overflow-hidden bg-sky-300 font-sans m-0 p-0";

// Get app element (HTML is now in index.html)
const app = document.querySelector<HTMLDivElement>("#app")!;

// Initialize game
export const game = new Game(app);
