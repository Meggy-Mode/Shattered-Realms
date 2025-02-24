class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = {
            x: 400,
            y: 300,
            speed: 5,
            inventory: [],
            health: 100,
            mana: 100
        };
        this.islands = [
            { x: 200, y: 200, width: 300, height: 200 },
            { x: 600, y: 400, width: 250, height: 150 }
        ];
        this.setupControls();
        this.setupAudio();
        this.gameLoop();
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
        });
    }

    drawPlayer() {
        this.ctx.fillStyle = '#48bb78';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }

    checkCollisions() {
        this.islands.forEach(island => {
            if (this.player.x > island.x && 
                this.player.x < island.x + island.width &&
                this.player.y > island.y && 
                this.player.y < island.y + island.height) {
                // Player is on an island
                return true;
            }
        });
        return false;
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawIslands();
        this.drawPlayer();
        this.checkCollisions();

        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    const game = new Game();
});
