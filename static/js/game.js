class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set proper canvas dimensions
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            velocity: { x: 0, y: 0 },
            maxSpeed: 5,
            acceleration: 0.5,
            friction: 0.85,
            inventory: [],
            health: 100,
            mana: 100,
            level: 1,
            experience: 0,
            maxExperience: 100,
            strength: 15,
            intelligence: 12,
            dexterity: 10,
            class: 'Seeker'
        };

        this.moveState = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.islands = [
            { x: 200, y: 200, width: 300, height: 200 },
            { x: 600, y: 400, width: 250, height: 150 }
        ];

        this.setupControls();
        this.setupAudio();
        this.gameLoop();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        });
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.moveState.up = true;
                    break;
                case 'ArrowDown':
                case 's':
                    this.moveState.down = true;
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.moveState.left = true;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.moveState.right = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.moveState.up = false;
                    break;
                case 'ArrowDown':
                case 's':
                    this.moveState.down = false;
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.moveState.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                    this.moveState.right = false;
                    break;
            }
        });
    }

    updatePlayerMovement() {
        // Calculate intended acceleration based on input
        let accelX = 0;
        let accelY = 0;

        if (this.moveState.up) accelY -= this.player.acceleration;
        if (this.moveState.down) accelY += this.player.acceleration;
        if (this.moveState.left) accelX -= this.player.acceleration;
        if (this.moveState.right) accelX += this.player.acceleration;

        // Normalize diagonal movement
        if (accelX !== 0 && accelY !== 0) {
            const normalizer = 1 / Math.sqrt(2);
            accelX *= normalizer;
            accelY *= normalizer;
        }

        // Apply acceleration to velocity
        this.player.velocity.x += accelX;
        this.player.velocity.y += accelY;

        // Apply friction
        this.player.velocity.x *= this.player.friction;
        this.player.velocity.y *= this.player.friction;

        // Limit maximum speed
        const speed = Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.y ** 2);
        if (speed > this.player.maxSpeed) {
            const scale = this.player.maxSpeed / speed;
            this.player.velocity.x *= scale;
            this.player.velocity.y *= scale;
        }

        // Update position
        this.player.x += this.player.velocity.x;
        this.player.y += this.player.velocity.y;

        // Keep player within canvas bounds
        this.player.x = Math.max(20, Math.min(this.canvas.width - 20, this.player.x));
        this.player.y = Math.max(20, Math.min(this.canvas.height - 20, this.player.y));
    }

    setupAudio() {
        this.synth = new Tone.Synth().toDestination();
    }

    drawIslands() {
        this.islands.forEach(island => {
            this.ctx.fillStyle = '#4a5568';
            this.ctx.fillRect(island.x, island.y, island.width, island.height);

            // Add some detail to islands
            this.ctx.strokeStyle = '#718096';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(island.x, island.y, island.width, island.height);
        });
    }

    drawPlayer() {
        // Draw player circle
        this.ctx.fillStyle = '#48bb78';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, 20, 0, Math.PI * 2);
        this.ctx.fill();

        // Add a border to the player
        this.ctx.strokeStyle = '#2f855a';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    checkCollisions() {
        this.islands.forEach(island => {
            if (this.player.x > island.x && 
                this.player.x < island.x + island.width &&
                this.player.y > island.y && 
                this.player.y < island.y + island.height) {
                return true;
            }
        });
        return false;
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.updatePlayerMovement();
        this.drawIslands();
        this.drawPlayer();
        this.checkCollisions();

        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    const game = new Game();
});