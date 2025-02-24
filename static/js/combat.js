class CombatSystem {
    constructor(game) {
        this.game = game;
        this.inCombat = false;
        this.enemy = null;
        this.turns = [];
    }

    initiateCombat(enemy) {
        this.inCombat = true;
        this.enemy = enemy;
        this.turns = ['player', 'enemy'];
        this.game.synth.triggerAttackRelease("C4", "8n");
    }

    playerAttack(type) {
        if (!this.inCombat) return;

        let damage = 0;
        switch(type) {
            case 'melee':
                damage = 20;
                break;
            case 'magic':
                damage = 30;
                this.game.player.mana -= 10;
                break;
            case 'ranged':
                damage = 15;
                break;
        }

        this.enemy.health -= damage;
        this.checkCombatEnd();
    }

    enemyTurn() {
        if (!this.inCombat) return;
        
        const damage = 15;
        this.game.player.health -= damage;
        this.checkCombatEnd();
    }

    checkCombatEnd() {
        if (this.enemy.health <= 0) {
            this.inCombat = false;
            this.enemy = null;
            return 'victory';
        }
        if (this.game.player.health <= 0) {
            this.inCombat = false;
            return 'defeat';
        }
        return null;
    }
}
