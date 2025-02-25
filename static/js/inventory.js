export class InventorySystem {
    constructor(game) {
        this.game = game;
        this.items = [];
        this.maxSize = 20;
        console.log('Initializing InventorySystem');
        this.setupUI();
    }

    setupUI() {
        this.container = document.getElementById('inventory');
        console.log('Setting up inventory UI, container:', this.container);
        if (!this.container) {
            console.error('Inventory container not found!');
            return;
        }
        this.render();
    }

    addItem(item) {
        console.log('Adding item to inventory:', item);

        if (!item) {
            console.error('Attempted to add null/undefined item');
            return false;
        }

        if (this.items.length >= this.maxSize) {
            console.log('Inventory full');
            this.game.ui?.showNotification('Inventory is full!', 'warning');
            return false;
        }

        // Special handling for echo crystals
        if (item.type === 'echo_crystal') {
            console.log('Processing echo crystal:', item);
            const existingCrystal = this.items.find(i => 
                i.type === 'echo_crystal' && 
                i.element === item.element &&
                i.power === item.power
            );

            if (existingCrystal) {
                console.log('Updating existing crystal quantity');
                existingCrystal.quantity += item.quantity || 1;
                this.render();
                return true;
            }
        }

        // Create a new item with default quantity
        const newItem = {
            ...item,
            quantity: item.quantity || 1
        };

        console.log('Adding new item to inventory:', newItem);
        this.items.push(newItem);

        // Force UI update
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
        console.log('Rendering inventory, items:', this.items.length);
        if (!this.container) {
            console.error('No inventory container found for rendering');
            return;
        }

        this.container.innerHTML = '';
        const itemList = document.createElement('ul');
        itemList.className = 'list-group inventory-list mb-3';

        if (this.items.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'list-group-item text-center text-muted';
            emptyMessage.textContent = 'Inventory is empty';
            itemList.appendChild(emptyMessage);
        } else {
            this.items.forEach((item, index) => {
                const itemElement = document.createElement('li');
                itemElement.className = 'list-group-item d-flex justify-content-between align-items-center';

                if (item.type === 'echo_crystal') {
                    itemElement.classList.add('echo-crystal');
                    itemElement.classList.add(`crystal-${item.element}`);
                    itemElement.innerHTML = `
                        <div class="d-flex align-items-center">
                            <i class="fas fa-gem me-2"></i>
                            ${item.name}
                            <span class="badge bg-secondary ms-2">Power: ${item.power || 1}</span>
                        </div>
                        <span class="badge bg-primary rounded-pill">×${item.quantity}</span>
                    `;
                } else {
                    itemElement.innerHTML = `
                        <div class="d-flex align-items-center">
                            <i class="fas fa-flask me-2"></i>
                            ${item.name}
                        </div>
                        <span class="badge bg-primary rounded-pill">×${item.quantity}</span>
                    `;
                }

                itemElement.onclick = () => this.useItem(index);
                itemList.appendChild(itemElement);
            });
        }

        this.container.appendChild(itemList);
        console.log('Inventory render complete');
    }

    useItem(index) {
        const item = this.items[index];
        if (!item) return;

        if (item.type === 'echo_crystal') {
            // Echo crystal effects
            if (this.game.player.useEchoCrystal) {
                const success = this.game.player.useEchoCrystal(item);
                if (success) {
                    item.quantity--;
                    if (item.quantity <= 0) {
                        this.removeItem(index);
                    } else {
                        this.render();
                    }
                    this.game.ui?.showNotification(`Used ${item.name}`, 'success');
                }
            }
        }

        // Update UI after using item
        if (this.game.ui) {
            this.game.ui.updatePlayerStats(true);
        }
    }
}