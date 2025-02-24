class GameUI {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        document.getElementById('playerStats').addEventListener('click', () => {
            this.toggleStatsPanel();
        });
    }

    updateUI() {
        this.updatePlayerStats();
        this.updateQuestLog();
        this.updateFactionStatus();
        requestAnimationFrame(() => this.updateUI());
    }

    updatePlayerStats() {
        const statsContainer = document.getElementById('playerStats');
        statsContainer.innerHTML = `
            <div class="progress mb-2">
                <div class="progress-bar bg-danger" 
                     role="progressbar" 
                     style="width: ${this.game.player.health}%" 
                     aria-valuenow="${this.game.player.health}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                    HP: ${this.game.player.health}
                </div>
            </div>
            <div class="progress">
                <div class="progress-bar bg-info" 
                     role="progressbar" 
                     style="width: ${this.game.player.mana}%" 
                     aria-valuenow="${this.game.player.mana}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                    MP: ${this.game.player.mana}
                </div>
            </div>
        `;
    }

    updateQuestLog() {
        const questLog = document.getElementById('questLog');
        questLog.innerHTML = `
            <div class="list-group">
                <div class="list-group-item">
                    <h5 class="mb-1">Main Quest: The Echo Crystal</h5>
                    <small>Find the first Echo Crystal in the Ember Wastes</small>
                    <div class="progress mt-2" style="height: 5px;">
                        <div class="progress-bar" role="progressbar" style="width: 25%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    updateFactionStatus() {
        const factionStatus = document.getElementById('factionStatus');
        factionStatus.innerHTML = `
            <div class="list-group">
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    Skyborn Guardians
                    <span class="badge bg-primary rounded-pill">Neutral</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    Shardwalkers
                    <span class="badge bg-warning rounded-pill">Cautious</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    Echo Cultists
                    <span class="badge bg-danger rounded-pill">Hostile</span>
                </div>
            </div>
        `;
    }

    showCombatUI() {
        const combat = document.createElement('div');
        combat.className = 'combat-overlay';
        combat.innerHTML = `
            <div class="btn-group">
                <button class="btn btn-danger" onclick="game.combat.playerAttack('melee')">
                    Melee Attack
                </button>
                <button class="btn btn-primary" onclick="game.combat.playerAttack('magic')">
                    Magic Attack
                </button>
                <button class="btn btn-success" onclick="game.combat.playerAttack('ranged')">
                    Ranged Attack
                </button>
            </div>
        `;
        document.body.appendChild(combat);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
        notification.innerHTML = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}
