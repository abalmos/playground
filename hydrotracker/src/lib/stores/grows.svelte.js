import { browser } from '$app/environment';

class GrowsStore {
	grows = $state([]);

	constructor() {
		if (browser) {
			const stored = localStorage.getItem('hydro_grows');
			if (stored) {
				this.grows = JSON.parse(stored);
			}
		}
	}

	add(grow) {
		const newGrow = {
			id: this.#generateId(),
			...grow,
			status: 'active',
			createdAt: new Date().toISOString(),
			public: false,
			userId: null, // Will be set when user auth is added
			likes: 0,
			followers: []
		};
		this.grows.push(newGrow);
		this.#save();
		return newGrow;
	}

	update(id, updates) {
		const index = this.grows.findIndex(g => g.id === id);
		if (index !== -1) {
			this.grows[index] = { ...this.grows[index], ...updates };
			this.#save();
		}
	}

	delete(id) {
		this.grows = this.grows.filter(g => g.id !== id);
		this.#save();
	}

	getById(id) {
		return this.grows.find(g => g.id === id);
	}

	getActive() {
		return this.grows.filter(g => g.status === 'active');
	}

	getCompleted() {
		return this.grows.filter(g => g.status === 'completed');
	}

	getPublic() {
		return this.grows.filter(g => g.public === true);
	}

	makePublic(id) {
		this.update(id, { public: true });
	}

	makePrivate(id) {
		this.update(id, { public: false });
	}

	#save() {
		if (browser) {
			localStorage.setItem('hydro_grows', JSON.stringify(this.grows));
		}
	}

	#generateId() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}
}

export const growsStore = new GrowsStore();
