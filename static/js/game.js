class CrystalManager {
    constructor(game) {
        this.game = game;
        this.crystals = [];
        this.lastSpawnTime = Date.now();
        this.spawnInterval = 10000; 
        this.elements = ['fire', 'ice', 'nature', 'arcane', 'void'];
        this.isCollecting = false; // Lock for collection process
    }

    generateCrystal(x, y) {
        return {
            x,
            y,
            element: this.elements[Math.floor(Math.random() * this.elements.length)],
            power: Math.floor(Math.random() * 10) + 1,
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
        if (!this.isCollecting) {
            this.checkCollection();
        }
    }

    spawnCrystals() {
        // Clear old crystals
        this.crystals = this.crystals.filter(crystal => !crystal.collected);

        // Spawn new crystals on crystal platforms
        if (this.game.islands) {
            this.game.islands.forEach(island => {
                if (island.type === 'crystal' && this.crystals.length < 10) {
                    const crystalX = island.x + Math.random() * (island.width - 20);
                    const crystalY = island.y - 30; // Float above the platform
                    this.crystals.push(this.generateCrystal(crystalX, crystalY));
                }
            });
        }
    }

    async checkCollection() {
        const crystalsToCollect = [];

        // First, identify all crystals that need to be collected
        this.crystals.forEach(crystal => {
            if (!crystal.collected) {
                const dx = this.game.player.x - crystal.x;
                const dy = this.game.player.y - crystal.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 40) { // Collection radius
                    crystalsToCollect.push(crystal);
                }
            }
        });

        // If there are crystals to collect, set the lock
        if (crystalsToCollect.length > 0) {
            this.isCollecting = true;

            // Process each crystal sequentially
            for (const crystal of crystalsToCollect) {
                crystal.collected = true;
                await this.collectCrystal(crystal);
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between collections
            }

            // Release the lock after all crystals are collected
            this.isCollecting = false;
        }
    }

    async collectCrystal(crystal) {
   
            try {
                if (!crystal || crystal.collected) return;
                
                // Add to inventory if it exists
                if (this.game.player.inventory) {
                    this.game.player.inventory.addItem({
                        type: 'echo_crystal',
                        name: `${crystal.element.charAt(0).toUpperCase() + crystal.element.slice(1)} Echo Crystal`,
                        element: crystal.element,
                        power: crystal.power,
                        quantity: 1
                    });
                }
                // Play collection sound with proper error handling
                            try {

                                    // Play different notes based on crystal element
                                    let note = 'C4';
                                    switch(crystal.element) {
                                        case 'fire': note = 'C4'; break;
                                        case 'ice': note = 'E4'; break;
                                        case 'nature': note = 'G4'; break;
                                        case 'arcane': note = 'B4'; break;
                                        case 'void': note = 'C2'; break;
                                        default: note = 'C4';
                                    }
                this.game.synth.triggerAttackRelease(note, "8n");
                                    
                            } catch (soundError) {
                                console.error('Error playing crystal collection sound:', soundError);
                            }
                        // Show notification if UI is initialized
                        if (this.game.ui) {
                            this.game.ui.showNotification(`Collected ${crystal.element} crystal!`, 'success');
                        }
                    } catch (error) {
                        console.error('Error collecting crystal:', error);
                    }
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

        // Initialize islands as empty array to prevent "not iterable" errors
        this.islands = [];

        this.initializeGameState();

        // Initialize game asynchronously
        this.initializeGame();
    }

    async initializeGame() {
        try {
            await this.initializeGameWorld();
            this.setupGameSystems();
            this.setupAudio(); // Moved this line here
            this.setupEventHandlers();
            // Start the game loop only after initialization is complete
            this.gameLoop(0);
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.ui?.showNotification('Failed to initialize game', 'error');
        }
    }

    async loadIslands() {
        try {
            const response = await fetch('/static/data/islands.json');
            if (!response.ok) {
                throw new Error('Failed to load islands data');
            }
            const data = await response.json();
            this.islands = data.islands.map(island => ({
                ...island,
                // Adjust coordinates relative to canvas center
                x: island.x + this.canvas.width / 2,
                y: island.y + this.canvas.height / 2
            }));
        } catch (error) {
            console.error('Error loading islands:', error);
            this.islands = []; // Initialize empty array instead of hardcoding fallback
            this.ui.showNotification('Error loading game world', 'error');
        }
    }


    initializeGameState() {
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1
        };

        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            velocity: { x: 0, y: 0 },
            maxSpeed: 10,
            acceleration: 0.8,
            friction: 0.85,
            gravity: 0.2,
            jumpForce: -8,
            isGrounded: false,
            inventory: null, // Will be initialized in setupGameSystems
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
    }

    async initializeGameWorld() {
        await this.loadIslands();
    }

    setupGameSystems() {
        // Initialize inventory first since UI depends on it
        this.player.inventory = new InventorySystem(this);

        // Initialize crystal manager
        this.crystalManager = new CrystalManager(this);

        // Initialize UI last to ensure all dependencies are available
        this.ui = new GameUI(this);

        this.lastFrameTime = 0;
        this.lastCrystalUpdate = 0;
    }

    setupEventHandlers() {
        this.setupControls();

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
        try {
            // Initialize Tone.js
            this.synth = new Tone.Synth({
                oscillator: {
                    type: "sine"
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.3,
                    release: 1
                }
            }).toDestination();

            // Set initial volume
            this.synth.volume.value = -10;

            // Start audio context
            Tone.start();
        } catch (error) {
            console.error('Error initializing audio:', error);
            this.ui?.showNotification('Audio initialization failed', 'error');
        }
    }

    updateCamera() {
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;

        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
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
        this.updateCamera();

        // Update crystals on significant movement only
        if (timestamp - (this.lastCrystalUpdate || 0) > 100) {
            this.crystalManager.update();
            this.lastCrystalUpdate = timestamp;
        }

        // Update UI elements periodically
        if (timestamp - (this.lastUIUpdate || 0) > 500) {
            this.ui.updatePlayerStats();
            this.ui.updateQuestLog();
            this.ui.updateFactionStatus();
            this.lastUIUpdate = timestamp;
        }

        // Use transform for all game objects
        this.ctx.save();
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


window.addEventListener('load', async () => {
    const game = new Game();
});