export class InventorySystem {
    constructor(game) {
        this.game = game;
        this.items = [];
        this.maxSize = 20;
        console.log('Initializing InventorySystem');
        this.setupUI();
        this.selectedCrystal = null;
    }

    setupUI() {
        this.container = document.getElementById('inventory');
        this.modal = document.getElementById('crystalModal');
        this.modalBackdrop = document.getElementById('crystalModalBackdrop');
        this.confirmUseBtn = document.getElementById('confirmUseBtn');
        this.cancelUseBtn = document.getElementById('cancelUseBtn');
        this.closeModalBtn = document.querySelector('.crystal-modal-close');

        console.log('Setting up inventory UI elements:', {
            container: this.container,
            modal: this.modal,
            modalBackdrop: this.modalBackdrop,
            confirmUseBtn: this.confirmUseBtn,
            cancelUseBtn: this.cancelUseBtn,
            closeModalBtn: this.closeModalBtn
        });

        if (!this.container) {
            console.error('Inventory container not found!');
            return;
        }

        // Setup modal event listeners
        this.confirmUseBtn.addEventListener('click', () => {
            console.log('Confirm use button clicked');
            this.useCrystal();
        });
        this.cancelUseBtn.addEventListener('click', () => {
            console.log('Cancel button clicked');
            this.hideModal();
        });
        this.closeModalBtn.addEventListener('click', () => {
            console.log('Close button clicked');
            this.hideModal();
        });
        this.modalBackdrop.addEventListener('click', () => {
            console.log('Modal backdrop clicked');
            this.hideModal();
        });

        this.render();
    }

    showCrystalModal(crystal) {
        console.log('Showing crystal modal for:', crystal);
        this.selectedCrystal = crystal;

        const elementSpan = document.getElementById('crystalElement');
        const powerSpan = document.getElementById('crystalPower');
        const quantitySpan = document.getElementById('crystalQuantity');

        console.log('Setting modal content:', {
            element: crystal.element,
            power: crystal.power,
            quantity: crystal.quantity
        });

        elementSpan.textContent = crystal.element;
        powerSpan.textContent = crystal.power;
        quantitySpan.textContent = crystal.quantity;

        this.modal.classList.add('active');
        this.modalBackdrop.classList.add('active');
    }

    hideModal() {
        console.log('Hiding crystal modal');
        this.modal.classList.remove('active');
        this.modalBackdrop.classList.remove('active');
        this.selectedCrystal = null;
    }

    useCrystal() {
        console.log('Using crystal:', this.selectedCrystal);
        if (this.selectedCrystal) {
            if (this.game.player.useEchoCrystal) {
                const success = this.game.player.useEchoCrystal(this.selectedCrystal);
                if (success) {
                    this.selectedCrystal.quantity--;
                    if (this.selectedCrystal.quantity <= 0) {
                        const index = this.items.indexOf(this.selectedCrystal);
                        if (index > -1) {
                            this.removeItem(index);
                        }
                    } else {
                        this.render();
                    }
                    this.game.ui?.showNotification(`Used ${this.selectedCrystal.name}`, 'success');
                }
            }
            this.hideModal();

            // Update UI after using item
            if (this.game.ui) {
                this.game.ui.updatePlayerStats(true);
            }
        }
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

        const newItem = {
            ...item,
            quantity: item.quantity || 1
        };

        console.log('Adding new item to inventory:', newItem);
        this.items.push(newItem);

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
        const itemList = document.createElement('div');
        itemList.className = 'list-group inventory-list mb-3';

        if (this.items.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'list-group-item text-center text-muted';
            emptyMessage.textContent = 'Inventory is empty';
            itemList.appendChild(emptyMessage);
        } else {
            // Sort items by type and element
            const sortedItems = [...this.items].sort((a, b) => {
                if (a.type !== b.type) return a.type.localeCompare(b.type);
                if (a.element && b.element) return a.element.localeCompare(b.element);
                return 0;
            });

            sortedItems.forEach((item) => {
                if (item.type === 'echo_crystal') {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'echo-crystal';
                    // Add crystal-echo class if it's an echo crystal
                    itemElement.classList.add(`crystal-${item.element.toLowerCase()}`);
                    itemElement.innerHTML = `
                        <div class="d-flex align-items-center flex-grow-1">
                            <i class="fas fa-gem me-2"></i>
                            <div class="d-flex flex-column">
                                <span>${item.name}</span>
                                <small class="text-muted">Power: ${item.power}</small>
                            </div>
                            <span class="badge bg-primary rounded-pill ms-auto">×${item.quantity}</span>
                        </div>
                    `;

                    // Add click handler for crystals
                    itemElement.onclick = () => {
                        console.log('Crystal clicked:', item);
                        this.showCrystalModal(item);
                    };

                    itemList.appendChild(itemElement);
                }
            });
        }

        this.container.appendChild(itemList);
        console.log('Inventory render complete');
    }
}