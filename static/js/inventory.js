class InventorySystem {
    constructor(game) {
        this.game = game;
        this.items = [];
        this.maxSize = 20;
        this.visible = false;
        this.setupUI();
        this.setupControls();
    }

    setupUI() {
        this.container = document.getElementById('inventory');
        this.container.parentElement.parentElement.classList.add('inventory-hidden');
        this.render();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e') {
                this.toggleVisibility();
            }
        });
    }

    toggleVisibility() {
        this.visible = !this.visible;
        if (this.visible) {
            this.container.parentElement.parentElement.classList.remove('inventory-hidden');
        } else {
            this.container.parentElement.parentElement.classList.add('inventory-hidden');
        }
    }

    addItem(item) {
        if (this.items.length >= this.maxSize) {
            return false;
        }
        this.items.push(item);
        this.render();
        return true;
    }

    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
            this.render();
            return true;
        }
        return false;
    }

    render() {
        this.container.innerHTML = '';

        const itemList = document.createElement('ul');
        itemList.className = 'list-group';

        this.items.forEach((item, index) => {
            const itemElement = document.createElement('li');
            itemElement.className = 'list-group-item d-flex justify-content-between align-items-center';
            itemElement.innerHTML = `
                ${item.name}
                <span class="badge bg-primary rounded-pill">${item.quantity}</span>
            `;
            itemElement.onclick = () => this.useItem(index);
            itemList.appendChild(itemElement);
        });

        this.container.appendChild(itemList);
    }

    useItem(index) {
        const item = this.items[index];
        if (item.type === 'consumable') {
            if (item.effect === 'health') {
                this.game.player.health += item.value;
            } else if (item.effect === 'mana') {
                this.game.player.mana += item.value;
            }

            item.quantity--;
            if (item.quantity <= 0) {
                this.removeItem(index);
            } else {
                this.render();
            }
        }
    }
}