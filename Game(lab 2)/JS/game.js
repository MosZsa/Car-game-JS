class Road {
    constructor(element, y) {
        this.element = element;
        this.y = y;
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.top = `${this.y}px`;
    }

    update(speed) {
        this.y += speed;
        if (this.y >= window.innerHeight) {
            this.y = -window.innerHeight + speed;
        }
        this.updatePosition();
    }
}

class Car {
    constructor(element, x, y, isPlayer) {
        this.element = element;
        this.x = x;
        this.y = y;
        this.isPlayer = isPlayer;
        this.dead = false;
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    update(speed) {
        if (!this.isPlayer) {
            this.y += speed;
            if (this.y > window.innerHeight) {
                this.dead = true;
            }
            this.updatePosition();
        }
    }

    collide(car) {
        return !(
            this.y + this.element.offsetHeight < car.y ||
            this.y > car.y + car.element.offsetHeight ||
            this.x + this.element.offsetWidth < car.x ||
            this.x > car.x + car.element.offsetWidth
        );
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        if (this.x < 0) this.x = 0;
        if (this.x + this.element.offsetWidth > window.innerWidth) this.x = window.innerWidth - this.element.offsetWidth;
        if (this.y < 0) this.y = 0;
        if (this.y + this.element.offsetHeight > window.innerHeight) this.y = window.innerHeight - this.element.offsetHeight;
        this.updatePosition();
    }
}

const UPDATE_TIME = 1000 / 60;
let speed = 8;
let score = 0;
let roads = [];
let objects = [];
let player;
let timer = null;
let music;
let isPaused = false;

document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('gameContainer');
    const road1 = document.getElementById('road1');
    const road2 = document.getElementById('road2');
    const playerCar = document.getElementById('playerCar');
    const scoreElement = document.getElementById('score');
    const instructionsElement = document.getElementById('instructions');
    const playMusicElement = document.getElementById('playMusic');
    const restartButton = document.getElementById('restartButton');
    music = new Audio('Music/background_music.mp3');

    console.log('Elements loaded:', { road1, road2, playerCar });

    roads = [
        new Road(road1, 0),
        new Road(road2, -window.innerHeight)
    ];

    playerCar.style.backgroundImage = "url('images/car.png')";
    player = new Car(playerCar, window.innerWidth / 2 - 30, window.innerHeight / 2, true);

    restartButton.addEventListener('click', () => location.reload());

    gameContainer.addEventListener('click', () => {
        if (!player.dead && !isPaused) {  // Только если игра активна и не на паузе
            if (music.paused) {
                music.play();
            } else {
                music.pause();
            }
        }
    });

    music.loop = true;
    music.volume = 0.2;

    window.addEventListener('keydown', (e) => {
        if (player.dead) return;
        switch (e.keyCode) {
            case 37:
                if (!isPaused) player.move(-speed, 0);
                break;
            case 39:
                if (!isPaused) player.move(speed, 0);
                break;
            case 38:
                if (!isPaused) player.move(0, -speed);
                break;
            case 40:
                if (!isPaused) player.move(0, speed);
                break;
            case 27:
                togglePause();
                break;
        }
    });

    function togglePause() {
        if (isPaused) {
            timer = setInterval(update, UPDATE_TIME);
            isPaused = false;
        } else {
            clearInterval(timer);
            timer = null;
            isPaused = true;
        }
        music.pause(); // Останавливаем музыку при каждом нажатии Esc
    }

    function startGame() {
        if (player.dead) return;
        timer = setInterval(update, UPDATE_TIME);
        isPaused = false;
    }

    function update() {
        roads.forEach(road => road.update(speed));

        if (Math.random() > 0.97) {
            const newCarElement = document.createElement('div');
            newCarElement.className = 'car';
            newCarElement.style.backgroundImage = "url('images/car_reverse.png')";
            newCarElement.style.left = `${Math.random() * (window.innerWidth - 60)}px`;
            newCarElement.style.top = '-120px';
            gameContainer.appendChild(newCarElement);
            objects.push(new Car(newCarElement, parseFloat(newCarElement.style.left), parseFloat(newCarElement.style.top), false));
            console.log(`New car created at: x=${newCarElement.style.left}, y=${newCarElement.style.top}`);
        }

        player.update();

        objects.forEach((obj, index) => {
            obj.update(speed);
            if (obj.dead) {
                obj.element.remove();
                objects.splice(index, 1);
                score++;
                scoreElement.innerText = `Score: ${score}`;
            }
        });

        objects.some(obj => {
            if (player.collide(obj)) {
                player.dead = true;
                clearInterval(timer);
                music.pause();
                restartButton.style.display = 'block';
                return true;
            }
        });
    }

    startGame();
});
