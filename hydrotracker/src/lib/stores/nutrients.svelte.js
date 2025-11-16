import { browser } from '$app/environment';

const DEFAULT_NUTRIENTS = [
	{ name: 'FloraGro', brand: 'General Hydroponics', type: 'Grow', npk: '3-1-6', dosage: 5 },
	{ name: 'FloraBloom', brand: 'General Hydroponics', type: 'Bloom', npk: '0-5-4', dosage: 5 },
	{ name: 'FloraMicro', brand: 'General Hydroponics', type: 'Base', npk: '5-0-1', dosage: 5 },
	{ name: 'CALiMAGic', brand: 'General Hydroponics', type: 'CalMag', npk: '1-0-0', dosage: 2.5 }
];

class NutrientsStore {
	nutrients = $state([]);

	constructor() {
		if (browser) {
			const stored = localStorage.getItem('hydro_nutrients');
			if (stored) {
				this.nutrients = JSON.parse(stored);
			} else {
				// Initialize with defaults
				this.nutrients = DEFAULT_NUTRIENTS.map(n => ({
					id: this.#generateId(),
					...n
				}));
				this.#save();
			}
		}
	}

	add(nutrient) {
		const newNutrient = {
			id: this.#generateId(),
			...nutrient
		};
		this.nutrients.push(newNutrient);
		this.#save();
		return newNutrient;
	}

	update(id, updates) {
		const index = this.nutrients.findIndex(n => n.id === id);
		if (index !== -1) {
			this.nutrients[index] = { ...this.nutrients[index], ...updates };
			this.#save();
		}
	}

	delete(id) {
		this.nutrients = this.nutrients.filter(n => n.id !== id);
		this.#save();
	}

	getByType(type) {
		return this.nutrients.filter(n => n.type === type);
	}

	#save() {
		if (browser) {
			localStorage.setItem('hydro_nutrients', JSON.stringify(this.nutrients));
		}
	}

	#generateId() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}
}

export const nutrientsStore = new NutrientsStore();
