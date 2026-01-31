document.addEventListener('DOMContentLoaded', () => {

    const clickSound = new Audio('click.mp3');
    clickSound.preload = 'auto';
    clickSound.volume = 0.6;

    function playClick() {
        clickSound.currentTime = 0;
        clickSound.play().catch(err => console.log("click sound error:", err));
    }
    
    const failSound = new Audio('window.mp3');
    failSound.preload = 'auto';
    failSound.volume = 0.6;
    function playFail() {
        failSound.currentTime = 0;
        failSound.play().catch(err => console.log("fail sound error:", err));
    }

    const marioSound = new Audio('mario-smert.mp3');
    marioSound.preload = 'auto';
    marioSound.volume = 0.6;
    function playMario() {
        marioSound.currentTime = 0;
        marioSound.play().catch(err => console.log("mario sound error:", err));
    }

    const papichSound = new Audio('najs-djemejdzh-najs-balans.mp3');
    papichSound.preload = 'auto';
    papichSound.volume = 0.6;
    function playPapich() {
        papichSound.currentTime = 0;
        papichSound.play().catch(err => console.log("papich sound error:", err));
    }

    const winSound = new Audio('eec95da626eda37.mp3');
    winSound.preload = 'auto';
    winSound.volume = 0.6;
    function playVictory() {
        winSound.currentTime = 0;
        winSound.play().catch(err => console.log("victory sound error:", err));
    }

    let ball = document.getElementById("ball");
    let valorantIcon = document.getElementById("valorant-icon");
    let div1 = document.getElementById("first");
    let div2 = document.getElementById("second");
    let divValorant = document.getElementById("valorant-game");
    let gameBall = document.getElementById("second-ball");
    let backBtn = document.getElementById("back-btn");
    let backBtnValorant = document.getElementById("back-btn-valorant");
    let slider = document.getElementById("slider");
    let gameMessage = document.getElementById("game-message");

    let gameActive = false;
    let sliderInterval = null;
    let sliderDirection = 1;
    let sliderPosition = 0;
    let sliderSpeed = 14;

    let shooterActive = false;
    let shooterInterval = null;
    let kills = 0;
    let canvas = document.getElementById('valorantCanvas');
    let ctx = canvas ? canvas.getContext('2d') : null;
    let playerImg = new Image();
    playerImg.src = 'photos/photo_2026-01-27_13-43-26-no-bg-preview (carve.photos).png';
    let player = { x: 50, y: 0, width: 50, height: 50, row: 2 };
    let bullets = [];
    let enemies = [];
    let rows = 5;
    let rowHeight = canvas ? canvas.height / rows : 120;
    let fireRate = 250;
    let lastFire = 0;
    let enemySpeed = 12;
    let spawnRate = 1500;

    ball.addEventListener("click", () => {
        playClick();
        div1.style.display = "none";
        div2.style.display = "flex";
        startGame();
    });

    backBtn.addEventListener("click", () => {
        div2.style.display = "none";
        div1.style.display = "flex";
        stopGame();
    });

    function startGame() {
        gameActive = true;
        resetGame();
        startSlider();
        window.focus();
    }

    function stopGame() {
        gameActive = false;
        clearInterval(sliderInterval);
    }

    function resetGame() {
        gameBall.style.left = "150px";
        gameBall.style.bottom = "80px";
        gameBall.className = "game-ball";
        gameMessage.className = "message";
        gameMessage.textContent = "";
        sliderPosition = 0;
        slider.style.left = "0px";
    }

    function startSlider() {
        clearInterval(sliderInterval);
        
        const sliderWidth = 60;
        const containerWidth = document.querySelector('.slider-container').offsetWidth;
        const maxPosition = containerWidth - sliderWidth;
        
        sliderPosition = Math.random() * maxPosition;
        sliderDirection = Math.random() > 0.5 ? 1 : -1;
        
        sliderInterval = setInterval(() => {
            if (!gameActive) return;
            
            sliderPosition += sliderSpeed * sliderDirection;
            
            if (sliderPosition <= 0) {
                sliderDirection = 1;
                sliderPosition = 0;
            } else if (sliderPosition >= maxPosition) {
                sliderDirection = -1;
                sliderPosition = maxPosition;
            }
            
            slider.style.left = sliderPosition + "px";
        }, 16);
    }

    function stopSlider() {
        if (!gameActive) return;
        
        clearInterval(sliderInterval);
        gameActive = false;
        
        const sliderCenter = sliderPosition + 30;
        const containerWidth = document.querySelector('.slider-container').offsetWidth;
        const targetZoneStart = containerWidth * 0.45;
        const targetZoneEnd = containerWidth * 0.55;
        
        gameBall.className = "game-ball";
        gameBall.style.left = "150px";
        gameBall.style.bottom = "80px";
        
        setTimeout(() => {
            if (sliderCenter >= targetZoneStart && sliderCenter <= targetZoneEnd) {
                gameBall.classList.add("ball-success");
                playPapich();
                showMessage("Санёк в ударе", "success");
            } else {
                gameBall.classList.add("ball-net");
                playMario();
                showMessage("Не порть репутацию Саньку", "fail");
            }
            
            setTimeout(() => {
                if (div2.style.display === "flex") {
                    resetGame();
                    gameActive = true;
                    startSlider();
                }
            }, 3000);
        }, 100);
    }

    function showMessage(text, type) {
        gameMessage.textContent = text;
        gameMessage.className = `message show ${type}`;
    }

    valorantIcon.addEventListener("click", () => {
        playClick();
        div1.style.display = "none";
        divValorant.style.display = "flex";
        startShooterGame();
    });

    backBtnValorant.addEventListener("click", () => {
        divValorant.style.display = "none";
        div1.style.display = "flex";
        stopShooterGame();
    });

    function startShooterGame() {
        shooterActive = true;
        resetShooterGame();
        startShooterTimer();
        spawnEnemies();
        requestAnimationFrame(gameLoop);
        document.addEventListener('keydown', handleKeys);
    }

    function stopShooterGame() {
        shooterActive = false;
        clearInterval(shooterInterval);
        clearInterval(spawnInterval);
        bullets = [];
        enemies = [];
        document.removeEventListener('keydown', handleKeys);
    }

    function resetShooterGame() {
        kills = 0;
        player.row = 2;
        player.y = player.row * rowHeight + rowHeight / 2 - player.height / 2;
        bullets = [];
        enemies = [];
        
        const message = document.getElementById('shooter-message');
        message.className = 'shooter-message';
        message.textContent = '';
    }

    function startShooterTimer() {
        clearInterval(shooterInterval);
        shooterInterval = setInterval(() => {
            if (!shooterActive) return;
        }, 1000);
    }

    function spawnEnemies() {
        spawnInterval = setInterval(() => {
            if (!shooterActive) return;
            
            let row = Math.floor(Math.random() * rows);
            let enemy = {
                x: canvas.width,
                y: row * rowHeight + rowHeight / 2 - 25,
                width: 50,
                height: 50,
                row: row
            };
            enemies.push(enemy);
        }, spawnRate);
    }

    function gameLoop() {
        if (!shooterActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

        let now = Date.now();
        if (now - lastFire > fireRate) {
            let bullet = {
                x: player.x + player.width,
                y: player.y + player.height / 2,
                width: 10,
                height: 5,
                speed: 5
            };
            bullets.push(bullet);
            lastFire = now;
        }

        for (let i = 0; i < bullets.length; i++) {
            bullets[i].x += bullets[i].speed;
            ctx.fillStyle = 'yellow';
            ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
            
            if (bullets[i].x > canvas.width) {
                bullets.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < enemies.length; i++) {
            enemies[i].x -= enemySpeed;
            ctx.fillStyle = 'red';
            ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
            
            if (enemies[i].x < 0) {
                endShooterGame();
                return;
            }
            if (enemies[i].x < player.x + player.width &&
                enemies[i].x + enemies[i].width > player.x &&
                enemies[i].row === player.row) {
                endShooterGame();
                return;
            }
        }

        for (let b = 0; b < bullets.length; b++) {
            for (let e = 0; e < enemies.length; e++) {
                if (bullets[b].x < enemies[e].x + enemies[e].width &&
                    bullets[b].x + bullets[b].width > enemies[e].x &&
                    Math.abs(bullets[b].y - (enemies[e].y + enemies[e].height / 2)) < 20) {
                    
                    enemies.splice(e, 1);
                    bullets.splice(b, 1);
                    kills++;
                    
                    if (kills >= 10) {
                        endShooterGame(true);
                    }
                    b--;
                    break;
                }
            }
        }
        
        requestAnimationFrame(gameLoop);
    }

    function handleKeys(event) {
        if (!shooterActive) return;
        
        if (event.key === 'w' || event.key === 'W' || event.key === 'ц' || event.key === 'Ц') {
            if (player.row > 0) {
                player.row--;
                player.y = player.row * rowHeight + rowHeight / 2 - player.height / 2;
            }
        } else if (event.key === 's' || event.key === 'S' || event.key === 'ы' || event.key === 'Ы') {
            if (player.row < rows - 1) {
                player.row++;
                player.y = player.row * rowHeight + rowHeight / 2 - player.height / 2;
            }
        }
    }

    function endShooterGame(isWin = false) {
        shooterActive = false;
        clearInterval(shooterInterval);
        clearInterval(spawnInterval);
        
        const message = document.getElementById('shooter-message');
        
        if (isWin) {
            playVictory();
            message.textContent = `Пора в киберспорт`;
            message.className = 'shooter-message show success';
        } else {
            playFail();
            message.textContent = `Ну чёж ты так`;
            message.className = 'shooter-message show fail';
        }
        
        setTimeout(() => {
            if (divValorant.style.display === "flex") {
                backBtnValorant.click();
            }
        }, 5000);
    }

    document.addEventListener("keydown", (event) => {
        if (event.code === "Space" && gameActive && div2.style.display === "flex") {
            event.preventDefault();
            stopSlider();
        }
        if (event.key === "Escape") {
            if (div2.style.display === "flex") {
                backBtn.click();
            } else if (divValorant.style.display === "flex") {
                backBtnValorant.click();
            }
        }
    });

    document.querySelector('.slider-container').addEventListener('click', () => {
        if (gameActive && div2.style.display === "flex") {
            stopSlider();
        }
    });

    div1.style.transition = "opacity 0.3s, transform 0.3s";
    div2.style.transition = "opacity 0.3s, transform 0.3s";
    divValorant.style.transition = "opacity 0.3s, transform 0.3s";
});