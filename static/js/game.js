class CrystalManager {
    constructor(game) {
        this.game = game;
        this.crystals = [];
        this.lastSpawnTime = Date.now();
        this.spawnInterval = 10000; // Spawn new crystals every 10 seconds
        this.elements = ['fire', 'ice', 'nature', 'arcane', 'void'];
    }

    generateCrystal(x, y) {
        return {
            x,
            y,
            element: 'void',
            power: 'void',
            collected: false,
            pulsePhase: 0
        };
    }

    update() {
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnCrystals();
            this.lastSpawnTime = currentTime;
        }

        // Update crystal animations
        this.crystals.forEach(crystal => {
            if (!crystal.collected) {
                crystal.pulsePhase = (crystal.pulsePhase + 0.05) % (Math.PI * 2);
            }
        });

        // Check for crystal collection
        this.checkCollection();
    }

    spawnCrystals() {
        // Clear old crystals
        this.crystals = this.crystals.filter(crystal => !crystal.collected);

        // Spawn new crystals on crystal platforms
        this.game.islands.forEach(island => {
            if (island.type === 'crystal' && this.crystals.length < 10) {
                const crystalX = island.x + Math.random() * (island.width - 20);
                const crystalY = island.y - 30; // Float above the platform
                this.crystals.push(this.generateCrystal(crystalX, crystalY));
            }
        });
    }

    checkCollection() {
        this.crystals.forEach(crystal => {
            if (!crystal.collected) {
                const dx = this.game.player.x - crystal.x;
                const dy = this.game.player.y - crystal.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 40) { // Collection radius
                    crystal.collected = true;
                    this.collectCrystal(crystal);
                }
            }
        });
    }

    collectCrystal(crystal) {
        // Add to inventory
        this.game.player.inventory.addItem({
            type: 'echo_crystal',
            name: 'Echo Crystal',
            element: 'void',
            power: 'void',
            quantity: 1
        });

        // Play collection sound
        this.game.synth.triggerAttackRelease(`${crystal.element === 'void' ? 'C2' : 'C4'}`, "8n");
    }

    draw(ctx) {
        this.crystals.forEach(crystal => {
            if (!crystal.collected) {
                const screenX = crystal.x - this.game.camera.x;
                const screenY = crystal.y - this.game.camera.y;

                // Draw crystal glow
                const glowSize = 15 + Math.sin(crystal.pulsePhase) * 5;
                const gradient = ctx.createRadialGradient(
                    screenX, screenY, 0,
                    screenX, screenY, glowSize
                );

                // Set gradient colors based on element
                let colors;
                switch (crystal.element) {
                    case 'fire': colors = ['#ff8a00', '#ff0000']; break;
                    case 'ice': colors = ['#00c6ff', '#0072ff']; break;
                    case 'nature': colors = ['#00ff87', '#60efff']; break;
                    case 'arcane': colors = ['#da22ff', '#9733ee']; break;
                    case 'void': colors = ['#141e30', '#243b55']; break;
                }

                gradient.addColorStop(0, colors[0] + '88');
                gradient.addColorStop(1, colors[1] + '00');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
                ctx.fill();

                // Draw crystal
                ctx.fillStyle = colors[0];
                ctx.strokeStyle = colors[1];
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(screenX, screenY - 10);
                ctx.lineTo(screenX + 7, screenY);
                ctx.lineTo(screenX, screenY + 10);
                ctx.lineTo(screenX - 7, screenY);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        });
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set proper canvas dimensions
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1, // Reduced from 0.1 to 0.05 for smoother movement
            lastUpdate: 0
        };

        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            velocity: { x: 0, y: 0 },
            maxSpeed: 8,
            acceleration: 0.5,
            friction: 0.85,
            gravity: 0.2,
            jumpForce: -8,
            isGrounded: false,
            inventory: new InventorySystem(this),
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
            // Main starting island
            {
                x: this.canvas.width / 2 - 200,
                y: this.canvas.height / 2 + 100,
                width: 400,
                height: 80,
                type: 'grass'
            },
            // Floating islands in different positions
            {
                x: this.canvas.width / 2 - 500,
                y: this.canvas.height / 2 - 100,
                width: 250,
                height: 60,
                type: 'stone'
            },
            {
                x: this.canvas.width / 2 + 300,
                y: this.canvas.height / 2 - 150,
                width: 300,
                height: 70,
                type: 'grass'
            },
            // Higher elevation islands
            {
                x: this.canvas.width / 2 - 200,
                y: this.canvas.height / 2 - 250,
                width: 180,
                height: 50,
                type: 'crystal'
            },
            {
                x: this.canvas.width / 2 + 100,
                y: this.canvas.height / 2 - 300,
                width: 220,
                height: 55,
                type: 'stone'
            },
            // Lower islands
            {
                x: this.canvas.width / 2 - 400,
                y: this.canvas.height / 2 + 200,
                width: 150,
                height: 45,
                type: 'grass'
            },
            {
                x: this.canvas.width / 2 + 450,
                y: this.canvas.height / 2 + 150,
                width: 280,
                height: 65,
                type: 'crystal'
            }
        ];

        this.crystalManager = new CrystalManager(this);
        this.ui = new GameUI(this);
        this.lastFrameTime = 0;
        this.lastCrystalUpdate = 0; // Added to track crystal update timing

        this.setupControls();
        this.setupAudio();
        this.gameLoop(0);

        window.addEventListener('resize', () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        });
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
            }
            if (e.key === ' ') {
                if (!this.player.isGrounded) {
                    this.gliding('on')
                }
            }
            if (e.key === 'ArrowUp' || e.key === 'w') {
                this.moveState.up = true;
                if (this.player.isGrounded) {
                    this.player.velocity.y = this.player.jumpForce;
                    this.player.isGrounded = false;
                }
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

    gliding(toggle) {
        if (toggle === 'on') {
            this.player.gravity = 0.15
        } else {
            this.player.gravity = 0.2
        }
    }

    updatePlayerMovement() {
        if (!this.player.isGrounded) {
            this.player.velocity.y += this.player.gravity;
        }

        let accelX = 0;
        if (this.moveState.left) accelX -= this.player.acceleration;
        if (this.moveState.right) accelX += this.player.acceleration;

        this.player.velocity.x += accelX;

        if (this.player.isGrounded) {
            this.player.velocity.x *= this.player.friction;
            this.player.maxSpeed = 8;
            this.gliding('off');
        } else {
            this.player.velocity.x *= 0.90;
            this.player.maxSpeed = 5;
        }

        this.player.velocity.x = Math.max(-this.player.maxSpeed,
            Math.min(this.player.maxSpeed, this.player.velocity.x));

        this.updatePosition();
    }

    updatePosition() {
        const oldX = this.player.x;
        const oldY = this.player.y;

        this.player.x += this.player.velocity.x;
        this.player.y += this.player.velocity.y;

        this.player.isGrounded = this.checkGrounded();

        for (const island of this.islands) {
            if (this.checkCollisionWithIsland(island)) {
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

        if (this.player.y > this.canvas.height * 1.5) {
            this.player.y = this.canvas.height / 2;
            this.player.x = this.canvas.width / 2;
            this.player.velocity.x = 0;
            this.player.velocity.y = 0;
            this.player.isGrounded = true;
        }
    }

    checkGrounded() {
        for (const island of this.islands) {
            if (
                this.player.x + 20 > island.x &&
                this.player.x - 20 < island.x + island.width &&
                this.player.y + 21 >= island.y &&
                this.player.y + 21 <= island.y + 10
            ) {
                return true;
            }
        }
        return false;
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

    updateCamera() {
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;

        //this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        //this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
    }

    drawIslands() {
        this.islands.forEach(island => {
            const screenX = island.x - this.camera.x;
            const screenY = island.y - this.camera.y;

            if (island.type === "stone") {
                this.ctx.fillStyle = '#4a5568';
                this.ctx.strokeStyle = '#718096';
            } else if (island.type === "grass") {
                this.ctx.fillStyle = '#134d15';
                this.ctx.strokeStyle = '#90aa90';
            } else if (island.type === "crystal") {
                this.ctx.fillStyle = '#634f76';
                this.ctx.strokeStyle = '#a6a6aa';
            }

            this.ctx.fillRect(screenX, screenY, island.width, island.height);
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(screenX, screenY, island.width, island.height);
        });
    }

    drawPlayer() {
        const screenX = this.player.x - this.camera.x;
        const screenY = this.player.y - this.camera.y;

        this.ctx.fillStyle = '#48bb78';
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 20, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#2f855a';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    gameLoop(timestamp) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Use transform for background
        this.ctx.save();
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        // Batch movement updates
        this.updatePlayerMovement();

        // Update camera position smoothly
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;

        // Calculate a more stable delta time with a maximum value to prevent jumps
        const deltaTime = Math.min(timestamp - (this.lastFrameTime || timestamp), 32); // Cap at ~30 FPS worth of movement
        const smoothFactor = deltaTime / 32; // Normalize to a 0-1 range

        // Apply smoother camera movement with dampening
        const dx = this.camera.targetX - this.camera.x;
        const dy = this.camera.targetY - this.camera.y;

        this.camera.x += dx * this.camera.smoothing * smoothFactor;
        this.camera.y += dy * this.camera.smoothing * smoothFactor;

        // Update crystals on significant movement only
        if (timestamp - (this.lastCrystalUpdate || 0) > 100) {
            this.crystalManager.update();
            this.lastCrystalUpdate = timestamp;
        }

        // Use transform for all game objects
        this.ctx.save();
        this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y)); // Round for pixel-perfect rendering

        this.drawIslands();
        this.crystalManager.draw(this.ctx);
        this.drawPlayer();

        this.ctx.restore();

        // Update last frame time for delta calculations
        this.lastFrameTime = timestamp;

        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}

//Import statements added here.  Paths may need adjustment depending on your project structure.
import { InventorySystem } from './inventory.js';
import { GameUI } from './ui.js';


window.addEventListener('load', () => {
    const game = new Game();
});