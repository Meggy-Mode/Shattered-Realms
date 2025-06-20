let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
if (!ctx) {
    console.error("Canvas context could not be initialized.");
} else { console.log("initialized canvas") }



class CrystalManager {
    constructor(game) {
        this.game = game;
        this.crystals = [];
        this.lastSpawnTime = Date.now();
        this.spawnInterval = 1000;
        this.elements = [
            'fire', 'fire', 'fire', 'fire', 'fire',
            'ice', 'ice', 'ice', 'ice', 'ice',
            'nature', 'nature', 'nature', 'nature', 'nature',
            'arcane', 'arcane', 'arcane', 'arcane', 'arcane',
            'void', 'void', 'void', 'void', 'void',
            'echo'
        ];
        this.chance = [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
            4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
            6, 6, 6, 6, 6, 6, 6, 6, 6,
            7, 7, 7, 7, 7, 7, 7, 7,
            8, 8, 8, 8, 8, 8, 8,
            9, 9, 9, 9, 9, 9,
            10, 10, 10,
            15
        ];


        this.isCollecting = false;
    }

    generateCrystal(x, y) {
        return {
            x,
            y,
            element: this.elements[Math.floor(Math.random() * this.elements.length)],
            power: this.chance[Math.floor(Math.random() * this.chance.length)],
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
        if (game.islands) {
            game.islands.forEach(island => {
                if (island.type === 'crystal' && this.crystals.length < 10) {
                    const crystalX = island.x + Math.random() * (island.width - 20);
                    const crystalY = island.y - 30; // Float above the platform
                    this.crystals.push(this.generateCrystal(crystalX, crystalY));


                }
            });
        }
    }

    async checkCollection() {
        if (this.isCollecting) {
            console.log('Collection already in progress');
            return;
        }

        const crystalsToCollect = [];

        this.crystals.forEach(crystal => {
            if (!crystal.collected) {
                const dx = player.player.x - crystal.x;
                const dy = player.player.y - crystal.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 40) {
                    console.log('Found crystal in range:', crystal);
                    crystalsToCollect.push(crystal);
                }
            }
        });

        if (crystalsToCollect.length > 0) {
            console.log('Starting collection process for crystals:', crystalsToCollect.length);
            this.isCollecting = true;

            try {
                for (const crystal of crystalsToCollect) {
                    if (!crystal.collected) {
                        await this.collectCrystal(crystal);
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            } catch (error) {
                console.error('Error during crystal collection:', error);
            } finally {
                this.isCollecting = false;
            }
        }
    }

    async collectCrystal(crystal) {
        if (!crystal || crystal.collected) {
            console.log('Crystal already collected or invalid');
            return;
        }

        console.log('Starting crystal collection:', crystal);

        try {
            if (!player.player.inventory) {
                console.error('Player inventory not initialized!');
                return;
            }

            const crystalItem = {
                type: 'echo_crystal',
                name: `${crystal.element.charAt(0).toUpperCase() + crystal.element.slice(1)} Crystal`,
                element: crystal.element,
                power: crystal.power,
                quantity: 1
            };

            console.log('Adding crystal to inventory:', crystalItem);
            const added = await player.player.inventory.addItem(crystalItem);

            if (added) {
                crystal.collected = true;
                this.crystals = this.crystals.filter(c => c !== crystal);

                // Play collection sound
                try {
                    const note = {
                        'fire': 'C4',
                        'ice': 'E4',
                        'nature': 'G4',
                        'arcane': 'B4',
                        'void': 'C2',
                        'echo': 'D4'
                    }[crystal.element] || 'C4';

                    await game.synth.triggerAttackRelease(note, "8n");
                } catch (soundError) {
                    console.error('Sound error:', soundError);
                }

                if (game.ui) {
                    game.ui.showNotification(`Collected ${crystal.element} crystal!`, 'success');
                }
                console.log('Crystal collection complete:', crystal.element);
            } else {
                console.error('Failed to add crystal to inventory');
            }
        } catch (error) {
            console.error('Crystal collection error:', error);
            throw error;
        }
    }

    draw(ctx) {
        this.crystals.forEach(crystal => {
            if (!crystal.collected) {
                const screenX = crystal.x - player.camera.x;
                const screenY = crystal.y - player.camera.y;

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
                    case 'nature': colors = ['#00ff87', '#00ae87']; break;
                    case 'arcane': colors = ['#da22ff', '#9733ee']; break;
                    case 'void': colors = ['#141e30', '#243b55']; break;
                    case 'echo': colors = ['#238082', '#657ba8']; break;
                }

                gradient.addColorStop(0, colors[0] + 'cc');    // Inner glow (more opaque)
                gradient.addColorStop(0.5, colors[0] + '44'); // Middle glow (semi-transparent)
                gradient.addColorStop(1, colors[1] + '00');    // Outer edge (fully transparent)

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

class Player {
    constructor() {
        this.dashing = false;
        // Set proper canvas dimensions
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        this.initializeGameState();

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
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: 20,
            velocity: { x: 0, y: 0 },
            maxSpeed: 10,
            acceleration: 0.8, 
            friction: 0.85,
            gravity: 0.2,
            jumpForce: -8,
            isGrounded: false,
            airJump: false,
            jumps: 0,
            inventory: null,
            health: 100,
            mana: 100,
            level: 1,
            experience: 0,
            maxExperience: 100,
            strength: 15,
            intelligence: 12,
            dexterity: 10,
            class: 'Seeker',

            useEchoCrystal: function(crystal) {
                console.log('Using crystal:', crystal);
                const boost = crystal.power;

                switch (crystal.element) {
                    case 'fire':
                        console.log(`Fire crystal boosting strength from ${this.strength} by ${boost}`);
                        this.strength += boost;
                        console.log(`New strength: ${this.strength}`);
                        return true;
                    case 'ice':
                        console.log(`Ice crystal boosting intelligence from ${this.intelligence} by ${boost}`);
                        this.intelligence += boost;
                        console.log(`New intelligence: ${this.intelligence}`);
                        return true;
                    case 'nature':
                        console.log(`Nature crystal boosting health from ${this.health} by ${boost * 2}`);
                        this.health = Math.min(100, this.health + boost * 2);
                        console.log(`New health: ${this.health}`);
                        return true;
                    case 'arcane':
                        console.log(`Arcane crystal boosting mana from ${this.mana} by ${boost * 2}`);
                        this.mana = Math.min(100, this.mana + boost * 2);
                        console.log(`New mana: ${this.mana}`);
                        return true;
                    case 'void':
                        console.log(`Void crystal boosting dexterity from ${this.dexterity} by ${boost}`);
                        this.dexterity += boost;
                        console.log(`New dexterity: ${this.dexterity}`);
                        return true;
                    default:
                        console.warn('Unknown crystal element:', crystal.element);
                        return false;
                }
            }
        };

        this.moveState = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }


    setupGameSystems() {
        console.log('Setting up game systems...');

        // Initialize UI first
        this.ui = new GameUI(this);

        // Initialize inventory before crystal manager
        this.player.inventory = new InventorySystem(this);
        console.log('Inventory system initialized:', this.player.inventory);

        // Initialize crystal manager last
        this.crystalManager = new CrystalManager(this);
        console.log('Crystal manager initialized');

        this.lastFrameTime = 0;
        this.lastCrystalUpdate = 0;
    }

    setupEventHandlers() {
        this.setupControls();

        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
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
            if (e.key.toLowerCase() === 'w') {
                if (!this.player.isGrounded) {
                    this.player.airJump = true;
                }
                this.moveState.up = true;
                if (this.player.isGrounded) {
                    this.player.velocity.y = this.player.jumpForce;
                    this.player.isGrounded = false;
                }
                if (this.player.airJump && this.player.jumps < 1) {
                    this.player.velocity.y = this.player.jumpForce / 1.2;
                    this.player.isGrounded = false;
                    this.player.jumps++
                }
                console.log("Jumps:", this.player.jumps, "Air jump:", this.player.airJump, "Grounded:", this.player.isGrounded)



            }

            if (e.key === 's') {
                this.moveState.down = true;
            }
            if (e.key === 'a') {
                this.moveState.left = true;
            }
            if (e.key === 'd') {
                this.moveState.right = true;
            }
            if (e.shiftKey) {
                if (e.key === 'A') {
                    this.dash(10, 1, "l")

                }
                else if (e.key === 'D') {
                    this.dash(10, 1, "r")

                }
            }
            if (e.key === 'k') {

            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'w') {
                this.moveState.up = false;
            }
            if (e.key === 's') {
                this.moveState.down = false;
            }
            if (e.key === 'a') {
                this.moveState.left = false;
            }
            if (e.key === 'd') {
                this.moveState.right = false;
            }
        });
    }
    attack(obj1, obj2, radius) {

    }

    gliding(toggle) {
        if (toggle === 'on') {
            this.player.gravity = 0.15
        } else {
            this.player.gravity = 0.2
        }
    }
    dash(p, gravityCurve, direction) {
        this.dashing = true;
        this.player.maxSpeed = Infinity
        gravityCurve /= 10;
        this.player.friction = p / 10

        this.player.gravity = gravityCurve;
        if (direction === "r") {
            this.player.velocity.x = p
        }
        if (direction === "l") {
            this.player.velocity.x = p * -1
        }

        setTimeout
        setTimeout(() => {
            this.player.friction = 0.85;
            this.player.maxSpeed = 10;
            this.dashing = false;
        }, p * 20);

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
            this.player.airJump = false;
            this.player.jumps = 0
            this.player.gravity = 0.2;
            this.gliding('off');
        } else if (!this.dashing) {
            this.player.velocity.x *= this.player.friction + 0.05;
            this.player.maxSpeed = 5;
        } else if (this.dashing) {
            this.player.velocity.x *= this.player.friction + 0.05;
            this.player.maxSpeed = Infinity;
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

        for (const island of game.islands) {
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

        if (this.player.y > canvas.height * 1.5) {
            this.player.y = canvas.height / 2;
            this.player.x = canvas.width / 2;
            this.player.velocity.x = 0;
            this.player.velocity.y = 0;
            this.player.isGrounded = true;
        }
    }

    checkGrounded() {
        for (const island of game.islands) {
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
        if (island.passThrough) {
            return false;
        }

        return this.player.x + 20 > island.x &&
            this.player.x - 20 < island.x + island.width &&
            this.player.y + 20 > island.y &&
            this.player.y - 20 < island.y + island.height;
    }

    drawPlayer() {
        const screenX = this.player.x - this.camera.x;
        const screenY = this.player.y - this.camera.y;

        ctx.fillStyle = '#48bb78';
        ctx.beginPath();
        ctx.arc(screenX, screenY, player.player.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#2f855a';
        ctx.lineWidth = 3;
        ctx.stroke();
        //console.log("Drawing player at:", player.player.x, player.player.y);
    }
}


const player = new Player();

class Game {
    constructor() {
        this.islands = [];

        player.initializeGameState();

        // Initialize game asynchronously
        this.initializeGame();
        this.area = 1

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
                x: island.x + canvas.width / 2,
                y: island.y + canvas.height / 2,
                texture: island.texture || 'default',
                passThrough: island.passThrough || false
            }));
        } catch (error) {
            console.error('Error loading islands:', error);
            this.islands = [];
            this.ui.showNotification('Error loading game world', 'error');
        }
        console.log("islands: ", this.islands)
    }
    async initializeGame() {
        try {
            console.log("Initializing game world...");
            await this.initializeGameWorld();
            console.log("Game world initialized.");

            console.log("Setting up audio...");
            this.setupAudio();
            console.log("Audio setup complete.");





            console.log("Game initializing...");
            this.gameLoop(0);
            console.log("Game initialized successfully");
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.ui?.showNotification('Failed to initialize game', 'error');
        }


    }

    async initializeGameWorld() {
        await this.loadIslands();
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
        player.camera.targetX = player.player.x - canvas.width / 2;
        player.camera.targetY = player.player.y - canvas.height / 2;

        player.camera.x += (player.camera.targetX - player.camera.x) * player.camera.smoothing;
        player.camera.y += (player.camera.targetY - player.camera.y) * player.camera.smoothing;
    }

    drawIslands() {
        this.islands.forEach(island => {
            const screenX = island.x - player.camera.x;
            const screenY = island.y - player.camera.y;

            // Set fill and stroke styles based on island type
            if (island.type === "stone") {
                ctx.fillStyle = '#4a5568';
                ctx.strokeStyle = '#718096';
            } else if (island.type === "grass") {
                ctx.fillStyle = '#134d15';
                ctx.strokeStyle = '#90aa90';
            } else if (island.type === "crystal") {
                ctx.fillStyle = '#634f76';
                ctx.strokeStyle = '#a6a6aa';
            } else {
                ctx.fillStyle = '#134d15';
                ctx.strokeStyle = '#90aa90';
            }

            // Draw the island
            ctx.fillRect(screenX, screenY, island.width, island.height);
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, screenY, island.width, island.height);
            //console.log("Drawing islands:", this.islands.length);
        });
    }

    async gameLoop(timestamp) {
        setTimeout(() => {

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use transform for background
            ctx.save();
            ctx.fillStyle = '#1a202c';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }, 10);

        //Movements
        player.updatePlayerMovement();
        this.updateCamera();
        enemy.update();



        // Update crystals on significant movement only
        if (timestamp - (player.lastCrystalUpdate || 0) > 100) {
            player.crystalManager.update();
            player.lastCrystalUpdate = timestamp;
        }

        if (this.ui) {
            this.ui.updatePlayerStats();
            /*if (timestamp - (this.lastUIUpdate || 0) > 500) {
                this.ui.updateQuestLog();
                this.ui.updateFactionStatus();
                this.lastUIUpdate = timestamp;
            }*/
        }
        // Use transform for all game objects
        ctx.save();
        this.drawIslands();
        player.crystalManager.draw(ctx);
        player.drawPlayer();
        ctx.restore();

        // Update last frame time for delta calculations
        player.lastFrameTime = timestamp;
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        enemy.draw()

    }

}

import { InventorySystem } from './inventory.js';
import { GameUI } from './ui.js';

const game = new Game();

window.onload = () => {
    console.log("Setting up game systems...");
    player.setupGameSystems();
    console.log("Game systems setup complete.");
    console.log("Setting up event handlers...");
    player.setupEventHandlers();
    console.log("Event handlers setup complete.");
};








class Enemy {
    constructor(x, y, health, speed, size, damage) {
        this.x = x;
        this.y = y;
        this.oldX = x; // Store previous position
        this.oldY = y;
        this.health = health;
        this.speed = speed;
        this.size = size;
        this.damage = damage

        this.isGrounded = true;
        this.velocity = { x: 0, y: 0 };
        
        // Get enemies
        fetch('/static/data/enemies.json')
            .then(response => response.json())
            .then(data => {
                let area1Enemies = data.areas[0].area1;
                console.log(area1Enemies);

                let area2Enemies = data.areas[1].area2;
                console.log(area2Enemies);
            })
            .catch(error => console.error('Error loading the JSON:', error));

    }

    update() {
        this.oldX = this.x; // Store previous position before movement
        this.oldY = this.y;

        this.followPlayer();
        this.applyMovement();
        this.ccwiEnemy();
        if (game.area = 1){
            
        }
    }

    followPlayer() {
        const distance = this.calcDistance(this, player.player)


        if (distance[0] > 5) {
            this.velocity.x = (distance[1] / distance[0]) * this.speed;
            this.velocity.y = (distance[2] / distance[0]) * this.speed;
        } else {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
        if (this.calcDistance(this, player.player)[0] <= (player.player.size / 2) + (this.size)) {


            console.log("attack!")
        }
    }

    applyMovement() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    draw() {
        let screenX = this.x - player.camera.x;
        let screenY = this.y - player.camera.y;
        ctx.fillStyle = '#ff9999';
        ctx.strokeStyle = '#aa5555';
        ctx.fillRect(screenX, screenY, this.size, this.size);
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, this.size, this.size);
    }

    checkCollisionWithIsland(island) {
        return (
            this.x < island.x + island.width &&
            this.x + this.size > island.x &&
            this.y < island.y + island.height &&
            this.y + this.size > island.y
        );
    }

    ccwiEnemy() {
        for (const island of game.islands) {
            if (this.checkCollisionWithIsland(island)) {
                const fromTop = this.oldY + this.size <= island.y;
                const fromBottom = this.oldY >= island.y + island.height;
                const fromLeft = this.oldX + this.size <= island.x;
                const fromRight = this.oldX >= island.x + island.width;

                if (fromTop && this.velocity.y > 0) {
                    this.y = island.y - this.size;
                    this.velocity.y = 0;
                    this.isGrounded = true;
                } else if (fromBottom && this.velocity.y < 0) {
                    this.y = island.y + island.height;
                    this.velocity.y = 0;
                } else if (fromLeft && this.velocity.x > 0) {
                    this.x = island.x - this.size;
                    this.velocity.x = 0;
                } else if (fromRight && this.velocity.x < 0) {
                    this.x = island.x + island.width;
                    this.velocity.x = 0;
                }
            }
        }
    }

    calcDistance(obj1, obj2) {
        let dx = obj2.x - obj1.x;
        let dy = obj2.y - obj1.y;
        return [Math.sqrt(dx * dx + dy * dy), dx, dy];
    }
}
const enemy = new Enemy(100, 100, 100, 0.5, 15, 1)