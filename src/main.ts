import "./style.css";
import { Game } from "./game/Game";

// Create UI elements
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div class="start-screen active">
    <h1>🗡️ Shinobi Runner 🗡️</h1>
    <p>Control your ninja and survive as long as possible!</p>
    <p style="font-size: 16px; margin-top: 10px;">Press SPACE / W / UP to jump<br/>Press Shift/Enter to fire Shurikens</p>
    <button id="start-button">Start Game</button>
  </div>
  
  <div class="game-ui">
    <div class="score-display">Score: 0</div>
  </div>
  
  <div class="game-over-screen">
    <h1>Game Over!</h1>
    <p>Final Score: 0</p>
    <button id="restart-button">Play Again</button>
  </div>
`;

// Initialize game
export const game = new Game(app);
