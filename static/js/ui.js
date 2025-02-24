export class GameUI {
    constructor(game) {
        this.game = game;
        this.cachedValues = {};
        this.setupEventListeners();
        this.cacheElements();
    }

    cacheElements() {
        this.elements = {
            playerStats: document.getElementById('playerStats'),
            questLog: document.getElementById('questLog'),
            factionStatus: document.getElementById('factionStatus')
        };
    }

    setupEventListeners() {
        if (this.elements?.playerStats) {
            this.elements.playerStats.addEventListener('click', () => {
                this.toggleStatsPanel();
            });
        }
    }

    shouldUpdate(key, newValue) {
        if (JSON.stringify(this.cachedValues[key]) !== JSON.stringify(newValue)) {
            this.cachedValues[key] = newValue;
            return true;
        }
        return false;
    }

    // Individual update methods to be called explicitly when needed
    updatePlayerStats() {
        const newStats = {
            level: this.game.player.level,
            class: this.game.player.class,
            experience: this.game.player.experience,
            maxExperience: this.game.player.maxExperience,
            health: this.game.player.health,
            mana: this.game.player.mana,
            strength: this.game.player.strength,
            intelligence: this.game.player.intelligence,
            dexterity: this.game.player.dexterity
        };

        if (!this.shouldUpdate('playerStats', newStats)) return;

        const statsHtml = `
            <div class="card-text mb-3">
                <h5 class="mb-2">Level ${newStats.level}</h5>
                <div class="progress mb-2">
                    <div class="progress-bar bg-success" 
                         role="progressbar" 
                         style="width: ${(newStats.experience / newStats.maxExperience) * 100}%" 
                         aria-valuenow="${newStats.experience}" 
                         aria-valuemin="0" 
                         aria-valuemax="${newStats.maxExperience}">
                        XP: ${newStats.experience}/${newStats.maxExperience}
                    </div>
                </div>
                <div class="progress mb-2">
                    <div class="progress-bar bg-danger" 
                         role="progressbar" 
                         style="width: ${newStats.health}%" 
                         aria-valuenow="${newStats.health}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                        HP: ${newStats.health}/100
                    </div>
                </div>
                <div class="progress mb-3">
                    <div class="progress-bar bg-info" 
                         role="progressbar" 
                         style="width: ${newStats.mana}%" 
                         aria-valuenow="${newStats.mana}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                        Mana: ${newStats.mana}/100
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <i class="fas fa-fist-raised"></i> STR: ${newStats.strength}
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-brain"></i> INT: ${newStats.intelligence}
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-running"></i> DEX: ${newStats.dexterity}
                    </div>
                </div>
            </div>
        `;

        if (this.elements.playerStats) {
            this.elements.playerStats.innerHTML = statsHtml;
        }
    }

    updateQuestLog() {
        const questData = {
            progress: 0
        };

        if (!this.shouldUpdate('questLog', questData)) return;

        const questHtml = `
            <div class="list-group">
                <div class="list-group-item">
                    <h5 class="mb-1">Main Quest: The Echo Crystal</h5>
                    <small>Find the first Echo Crystal in the Ember Wastes</small>
                    <div class="progress mt-2" style="height: 5px;">
                        <div class="progress-bar" role="progressbar" style="width: ${questData.progress}%"></div>
                    </div>
                </div>
            </div>
        `;

        if (this.elements.questLog) {
            this.elements.questLog.innerHTML = questHtml;
        }
    }

    updateFactionStatus() {
        const factionData = {
            skyborn: 'Neutral',
            shardwalkers: 'Cautious',
            echoCultists: 'Hostile'
        };

        if (!this.shouldUpdate('factionStatus', factionData)) return;

        const factionHtml = `
            <div class="list-group">
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    Skyborn Guardians
                    <span class="badge bg-primary rounded-pill">${factionData.skyborn}</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    Shardwalkers
                    <span class="badge bg-warning rounded-pill">${factionData.shardwalkers}</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    Echo Cultists
                    <span class="badge bg-danger rounded-pill">${factionData.echoCultists}</span>
                </div>
            </div>
        `;

        if (this.elements.factionStatus) {
            this.elements.factionStatus.innerHTML = factionHtml;
        }
    }

    showNotification(message, type = 'info') {
        let notification = document.querySelector('.game-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = `game-notification alert alert-${type} position-fixed top-0 end-0 m-3`;
            document.body.appendChild(notification);
        }
        notification.innerHTML = message;
        notification.classList.remove('fade-out');

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2700);
    }
}