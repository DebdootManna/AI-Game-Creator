export async function GET() {
  const exampleGameCode = `<!DOCTYPE html>
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

  return new Response(exampleGameCode, {
    headers: {
      "Content-Type": "text/html",
    },
  })
}
