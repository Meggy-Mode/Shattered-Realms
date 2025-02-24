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
            gravity: 0.2,
            jumpForce: -8,
            isGrounded: false,
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
            if (e.key === 'ArrowUp' || e.key === 'w') {
                this.moveState.up = true;
            }
            if (e.key === 'ArrowDown' || e.key === 's') {
                this.moveState.down = true;
            }
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                this.moveState.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd') {
                this.moveState.right = true;
            }
            if (e.key === ' ') {
                if (this.player.isGrounded) {
                    this.player.velocity.y = this.player.jumpForce;
                    this.player.isGrounded = false;
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w') {
                this.moveState.up = false;
            }
            if (e.key === 'ArrowDown' || e.key === 's') {
                this.moveState.down = false;
            }
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                this.moveState.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd') {
                this.moveState.right = false;
            }
        });
    }

    updatePlayerMovement() {
        // Apply gravity
        if (!this.player.isGrounded) {
            this.player.velocity.y += this.player.gravity;
        }

        // Calculate intended acceleration based on input
        let accelX = 0;

        if (this.moveState.left) accelX -= this.player.acceleration;
        if (this.moveState.right) accelX += this.player.acceleration;

        // Apply acceleration to horizontal velocity
        this.player.velocity.x += accelX;

        // Apply friction only when grounded
        if (this.player.isGrounded) {
            this.player.velocity.x *= this.player.friction;
        } else {
            // Less friction in air
            this.player.velocity.x *= 0.95;
        }

        // Limit maximum horizontal speed
        this.player.velocity.x = Math.max(-this.player.maxSpeed,
            Math.min(this.player.maxSpeed, this.player.velocity.x));

        // Update position and check for collisions
        this.updatePosition();
    }

    updatePosition() {
        // Store old position for collision resolution
        const oldX = this.player.x;
        const oldY = this.player.y;

        // Update position
        this.player.x += this.player.velocity.x;
        this.player.y += this.player.velocity.y;

        // Check collisions with islands
        this.player.isGrounded = false;
        for (const island of this.islands) {
            if (this.checkCollisionWithIsland(island)) {
                // Determine which side of the island we hit
                const fromTop = oldY + 20 <= island.y;
                const fromBottom = oldY - 20 >= island.y + island.height;
                const fromLeft = oldX + 20 <= island.x;
                const fromRight = oldX - 20 >= island.x + island.width;

                if (fromTop && this.player.velocity.y > 0) {
                    this.player.y = island.y - 20;
                    this.player.velocity.y = 0;
                    this.player.isGrounded = true;
                } else if (fromBottom && this.player.velocity.y < 0) {
                    this.player.y = island.y + island.height + 20;
                    this.player.velocity.y = 0;
                } else if (fromLeft && this.player.velocity.x > 0) {
                    this.player.x = island.x - 20;
                    this.player.velocity.x = 0;
                } else if (fromRight && this.player.velocity.x < 0) {
                    this.player.x = island.x + island.width + 20;
                    this.player.velocity.x = 0;
                }
            }
        }

        // Keep player within canvas bounds
        this.player.x = Math.max(20, Math.min(this.canvas.width - 20, this.player.x));
        if (this.player.y > this.canvas.height - 20) {
            this.player.y = this.canvas.height - 20;
            this.player.velocity.y = 0;
            this.player.isGrounded = true;
        }
        this.player.y = Math.max(20, Math.min(this.canvas.height - 20, this.player.y));
    }

    checkCollisionWithIsland(island) {
        return this.player.x + 20 > island.x &&
               this.player.x - 20 < island.x + island.width &&
               this.player.y + 20 > island.y &&
               this.player.y - 20 < island.y + island.height;
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

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.updatePlayerMovement();
        this.drawIslands();
        this.drawPlayer();

        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    const game = new Game();
});