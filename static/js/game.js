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
            speed: 5,
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
                    this.player.y -= this.player.speed;
                    break;
                case 'ArrowDown':
                    this.player.y += this.player.speed;
                    break;
                case 'ArrowLeft':
                    this.player.x -= this.player.speed;
                    break;
                case 'ArrowRight':
                    this.player.x += this.player.speed;
                    break;
            }
        });
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

        this.drawIslands();
        this.drawPlayer();
        this.checkCollisions();

        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    const game = new Game();
});