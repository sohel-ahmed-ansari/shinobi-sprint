import "./style.css";
import { Game } from "./game/Game";
import { setupInstall } from "./pwa";

// Apply global styles via Tailwind classes
document.body.className = "overflow-hidden bg-sky-300 font-sans m-0 p-0";

// Get app element (HTML is now in index.html)
const app = document.querySelector<HTMLDivElement>("#app")!;

// Initialize game
export const game = new Game(app);

// Wire up the "Install app" button (PWA)
setupInstall();
