import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"

// Export config for longer API timeout
export const maxDuration = 60

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

// System prompt for the AI to generate games
const SYSTEM_PROMPT = `You are an AI Game Creator assistant that helps users create simple browser games using HTML, CSS, and JavaScript.

When a user describes a game they want to create:
1. Respond with a brief, friendly message acknowledging their request
2. Generate complete, self-contained HTML code that includes all necessary CSS and JavaScript inline
3. The game should be simple but functional and match the user's description
4. The game should work in a sandboxed iframe with no external dependencies
5. Use vanilla JavaScript only (no libraries or frameworks)
6. Make sure the game is playable with keyboard/mouse controls
7. Include clear instructions on how to play the game
8. The code should be complete and ready to run without any modifications

Always wrap your code in a single code block using triple backticks with html as the language:
\`\`\`html
<!DOCTYPE html>
<html>
...your complete game code here...
</html>
\`\`\`

Keep your explanations brief and focus on delivering a working game.`

// Example game code to use as fallback for testing
const EXAMPLE_GAME_CODE = `<!DOCTYPE html>
<html>
<head>
  <title>Simple Jumping Game</title>
  <style>
    body { margin: 0; overflow: hidden; }
    #game { position: relative; width: 100vw; height: 100vh; background-color: #87CEEB; }
    #player { position: absolute; width: 50px; height: 50px; background-color: #FF5733; bottom: 0; left: 50px; }
    #ground { position: absolute; width: 100%; height: 20px; background-color: #8B4513; bottom: 0; }
    .obstacle { position: absolute; width: 30px; height: 50px; background-color: #228B22; bottom: 20px; }
    #score { position: absolute; top: 20px; left: 20px; font-family: Arial; font-size: 24px; color: white; }
    #gameOver { display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0,0,0,0.7); color: white; padding: 20px; border-radius: 10px; text-align: center; }
  </style>
</head>
<body>
  <div id="game">
    <div id="player"></div>
    <div id="ground"></div>
    <div id="score">Score: 0</div>
    <div id="gameOver">
      <h2>Game Over!</h2>
      <p>Your score: <span id="finalScore">0</span></p>
      <button onclick="resetGame()">Play Again</button>
    </div>
  </div>

  <script>
    // Game variables
    let player = document.getElementById('player');
    let game = document.getElementById('game');
    let ground = document.getElementById('ground');
    let scoreDisplay = document.getElementById('score');
    let gameOverScreen = document.getElementById('gameOver');
    let finalScoreDisplay = document.getElementById('finalScore');
    
    let isJumping = false;
    let gravity = 0.9;
    let jumpHeight = 15;
    let playerBottom = 0;
    let playerVelocity = 0;
    let score = 0;
    let gameIsOver = false;
    let obstacleInterval;
    
    // Game controls
    document.addEventListener('keydown', function(event) {
      if ((event.code === 'Space' || event.key === 'ArrowUp') && !isJumping && !gameIsOver) {
        jump();
      }
      if (gameIsOver && event.code === 'Enter') {
        resetGame();
      }
    });
    
    // Jump function
    function jump() {
      isJumping = true;
      playerVelocity = jumpHeight;
    }
    
    // Game physics update
    function update() {
      if (gameIsOver) return;
      
      // Apply gravity to player
      playerVelocity -= gravity;
      playerBottom += playerVelocity;
      
      // Ground collision
      if (playerBottom <= 0) {
        playerBottom = 0;
        isJumping = false;
        playerVelocity = 0;
      }
      
      // Update player position
      player.style.bottom = playerBottom + 'px';
      
      // Update score
      score++;
      scoreDisplay.innerText = 'Score: ' + Math.floor(score/10);
      
      // Check collisions
      let obstacles = document.querySelectorAll('.obstacle');
      obstacles.forEach(obstacle => {
        let obstacleLeft = parseInt(obstacle.style.left);
        
        // Move obstacle
        obstacleLeft -= 5;
        obstacle.style.left = obstacleLeft + 'px';
        
        // Remove off-screen obstacles
        if (obstacleLeft < -30) {
          obstacle.remove();
        }
        
        // Collision detection
        if (obstacleLeft > 50 && obstacleLeft < 100 && playerBottom < 50) {
          gameOver();
        }
      });
      
      // Continue game loop
      if (!gameIsOver) {
        requestAnimationFrame(update);
      }
    }
    
    // Create obstacles
    function createObstacle() {
      if (gameIsOver) return;
      
      let obstacle = document.createElement('div');
      obstacle.className = 'obstacle';
      obstacle.style.left = '100%';
      game.appendChild(obstacle);
    }
    
    // Game over
    function gameOver() {
      gameIsOver = true;
      clearInterval(obstacleInterval);
      finalScoreDisplay.innerText = Math.floor(score/10);
      gameOverScreen.style.display = 'block';
    }
    
    // Reset game
    function resetGame() {
      gameIsOver = false;
      score = 0;
      playerBottom = 0;
      player.style.bottom = '0px';
      scoreDisplay.innerText = 'Score: 0';
      gameOverScreen.style.display = 'none';
      
      // Remove all obstacles
      document.querySelectorAll('.obstacle').forEach(obstacle => obstacle.remove());
      
      // Restart game
      startGame();
    }
    
    // Start game
    function startGame() {
      update();
      obstacleInterval = setInterval(createObstacle, 2000);
    }
    
    // Initialize game
    startGame();
  </script>
</body>
</html>`

export async function POST(req: Request) {
  try {
    // Parse the incoming request
    const { messages } = await req.json()

    // For debugging - log the messages
    console.log("Received chat request with messages:", JSON.stringify(messages))

    // Check if we have an OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
      console.log("No OpenAI API key found, using example game code")

      // Return example game code for testing when no API key is available
      return new Response(
        JSON.stringify({
          id: "example-response",
          object: "chat.completion",
          created: Date.now(),
          model: "gpt-3.5-turbo",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: `I've created a simple jumping game for you! Here's the code:\n\n\`\`\`html\n${EXAMPLE_GAME_CODE}\n\`\`\`\n\nJust press Space or Up Arrow to jump over the obstacles. Try to get the highest score!`,
              },
              finish_reason: "stop",
            },
          ],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Create the chat completion with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Convert the response to a stream
    const stream = OpenAIStream(response)

    // Return the streaming response
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error("Error in chat API:", error)

    // Return a fallback response with the example game
    return new Response(
      JSON.stringify({
        error: "Failed to generate game. Using example game instead.",
        example: true,
        message: {
          role: "assistant",
          content: `I'm having trouble generating a custom game right now, but here's a simple jumping game you can try:\n\n\`\`\`html\n${EXAMPLE_GAME_CODE}\n\`\`\`\n\nJust press Space or Up Arrow to jump over the obstacles. Try to get the highest score!`,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
