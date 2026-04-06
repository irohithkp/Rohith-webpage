document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const overlay = document.getElementById('game-overlay');
    const overlayText = document.getElementById('overlay-text');
    const startBtn = document.getElementById('start-btn');

    // Controls
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    // Game Variables
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    let snake = [];
    let velocity = { x: 0, y: 0 };
    let apple = { x: 15, y: 15 };
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.innerText = highScore;
    
    let gameLoopTimeout;
    let isGameRunning = false;

    // Colors
    const snakeColor = '#00e6cb';
    const appleColor = '#FF3366';

    function initGame() {
        // Reset Variables
        snake = [
            { x: 10, y: 10 },
            { x: 10, y: 11 },
            { x: 10, y: 12 }
        ];
        velocity = { x: 0, y: -1 };
        score = 0;
        scoreElement.innerText = score;
        spawnApple();
        
        isGameRunning = true;
        overlay.classList.add('hidden');
        clearTimeout(gameLoopTimeout);
        gameLoop();
    }

    function gameLoop() {
        if (!isGameRunning) return;
        update();
        if (isGameRunning) {
            draw();
            gameLoopTimeout = setTimeout(gameLoop, 150); // Slower speed
        }
    }

    function update() {
        // Move Snake
        const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

        // Wall Collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        // Self Collision
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head); // Add new head

        // Check Apple Match
        if (head.x === apple.x && head.y === apple.y) {
            score += 10;
            scoreElement.innerText = score;
            if (score > highScore) {
                highScore = score;
                highScoreElement.innerText = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            spawnApple();
        } else {
            snake.pop(); // Remove tail if no apple eaten
        }
    }

    function draw() {
        // Clear Canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Apple (Glowing)
        ctx.fillStyle = appleColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = appleColor;
        ctx.fillRect(apple.x * gridSize + 1, apple.y * gridSize + 1, gridSize - 2, gridSize - 2);

        // Draw Snake (Glowing)
        ctx.shadowBlur = 10;
        ctx.shadowColor = snakeColor;
        
        for (let i = 0; i < snake.length; i++) {
            if (i === 0) {
                ctx.fillStyle = '#ffffff'; // Head is white
            } else {
                ctx.fillStyle = snakeColor;
            }
            ctx.fillRect(snake[i].x * gridSize + 1, snake[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
        }
        
        // Reset shadow for performance
        ctx.shadowBlur = 0;
    }

    function spawnApple() {
        apple.x = Math.floor(Math.random() * tileCount);
        apple.y = Math.floor(Math.random() * tileCount);
        
        // Ensure apple doesn't spawn ON the snake
        for (let i = 0; i < snake.length; i++) {
            if (apple.x === snake[i].x && apple.y === snake[i].y) {
                spawnApple();
                break;
            }
        }
    }

    function gameOver() {
        isGameRunning = false;
        overlayText.innerText = `Game Over!\nScore: ${score}`;
        startBtn.innerText = "Play Again";
        overlay.classList.remove('hidden');
    }

    // Input Handling
    function handleInput(direction) {
        if (!isGameRunning) return;
        
        switch(direction) {
            case 'UP':
                if (velocity.y !== 1) velocity = { x: 0, y: -1 };
                break;
            case 'DOWN':
                if (velocity.y !== -1) velocity = { x: 0, y: 1 };
                break;
            case 'LEFT':
                if (velocity.x !== 1) velocity = { x: -1, y: 0 };
                break;
            case 'RIGHT':
                if (velocity.x !== -1) velocity = { x: 1, y: 0 };
                break;
        }
    }

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Prevent default scrolling for arrows
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].indexOf(e.code) > -1) {
            e.preventDefault();
        }
        
        if (e.key === 'ArrowUp') handleInput('UP');
        if (e.key === 'ArrowDown') handleInput('DOWN');
        if (e.key === 'ArrowLeft') handleInput('LEFT');
        if (e.key === 'ArrowRight') handleInput('RIGHT');
    });

    // On-screen D-Pad controls
    upBtn.addEventListener('click', () => handleInput('UP'));
    downBtn.addEventListener('click', () => handleInput('DOWN'));
    leftBtn.addEventListener('click', () => handleInput('LEFT'));
    rightBtn.addEventListener('click', () => handleInput('RIGHT'));

    // Start Button
    startBtn.addEventListener('click', initGame);
});
