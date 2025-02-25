export class GameUI {
    constructor(game) {
        this.game = game;
        this.cachedValues = {};
        this.cacheElements();
        this.setupEventListeners();
        this.initializeUI();
    }

    cacheElements() {
        this.elements = {
            playerStats: document.getElementById('playerStats'),
            questLog: document.getElementById('questLog'),
            factionStatus: document.getElementById('factionStatus'),
            notificationArea: document.getElementById('notification-area') || this.createNotificationArea()
        };
    }

    createNotificationArea() {
        const notificationArea = document.createElement('div');
        notificationArea.id = 'notification-area';
        notificationArea.className = 'notification-area';
        document.body.appendChild(notificationArea);
        return notificationArea;
    }

    setupEventListeners() {
        if (this.elements?.playerStats) {
            this.elements.playerStats.addEventListener('click', () => {
                this.toggleStatsPanel();
            });
        }
    }

    initializeUI() {
        // Force initial update of all UI components
        this.updatePlayerStats(true);
        this.updateQuestLog(true);
        this.updateFactionStatus(true);
        this.showNotification('Game UI loaded successfully', 'success');
    }

    shouldUpdate(key, newValue, forceUpdate = false) {
        if (forceUpdate || JSON.stringify(this.cachedValues[key]) !== JSON.stringify(newValue)) {
            this.cachedValues[key] = newValue;
            return true;
        }
        return false;
    }

    updatePlayerStats(forceUpdate = false) {
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

        if (!this.shouldUpdate('playerStats', newStats, forceUpdate)) return;

        const statsHtml = `
            <div class="card-text mb-3">
                <h5 class="mb-2">${newStats.class} - Level ${newStats.level}</h5>
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

    updateQuestLog(forceUpdate = false) {
        const questData = {
            progress: 0,
            currentQuest: 'The Echo Crystal',
            questDescription: 'Find the first Echo Crystal in the Ember Wastes',
            location: 'Ember Wastes'
        };

        if (!this.shouldUpdate('questLog', questData, forceUpdate)) return;

        const questHtml = `
            <div class="list-group">
                <div class="list-group-item">
                    <h5 class="mb-1">Main Quest: ${questData.currentQuest}</h5>
                    <small>${questData.questDescription}</small>
                    <div class="progress mt-2" style="height: 5px;">
                        <div class="progress-bar" role="progressbar" style="width: ${questData.progress}%"></div>
                    </div>
                    <small class="text-muted mt-2 d-block">Current Location: ${questData.location}</small>
                </div>
            </div>
        `;

        if (this.elements.questLog) {
            this.elements.questLog.innerHTML = questHtml;
        }
    }

    updateFactionStatus(forceUpdate = false) {
        const factionData = {
            skyborn: 'Neutral',
            shardwalkers: 'Cautious',
            echoCultists: 'Hostile'
        };

        if (!this.shouldUpdate('factionStatus', factionData, forceUpdate)) return;

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
        let notification = document.createElement('div');
        notification.className = `game-notification alert alert-${type} position-fixed top-0 end-0 m-3`;
        notification.innerHTML = message;

        this.elements.notificationArea.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2700);
    }

    toggleStatsPanel() {
        if (this.elements.playerStats) {
            this.elements.playerStats.classList.toggle('expanded');
        }
    }
}