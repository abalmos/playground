import { browser } from '$app/environment';

class LogsStore {
	logs = $state([]);

	constructor() {
		if (browser) {
			const stored = localStorage.getItem('hydro_logs');
			if (stored) {
				this.logs = JSON.parse(stored);
			}
		}
	}

	add(log) {
		const newLog = {
			id: this.#generateId(),
			...log,
			timestamp: new Date().toISOString()
		};
		this.logs.push(newLog);
		this.#save();
		return newLog;
	}

	update(id, updates) {
		const index = this.logs.findIndex(l => l.id === id);
		if (index !== -1) {
			this.logs[index] = { ...this.logs[index], ...updates };
			this.#save();
		}
	}

	delete(id) {
		this.logs = this.logs.filter(l => l.id !== id);
		this.#save();
	}

	getByGrowId(growId) {
		return this.logs
			.filter(l => l.growId === growId)
			.sort((a, b) => new Date(b.date) - new Date(a.date));
	}

	getByDate(date) {
		return this.logs.filter(l => l.date === date);
	}

	getRecent(limit = 10) {
		return [...this.logs]
			.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
			.slice(0, limit);
	}

	#save() {
		if (browser) {
			localStorage.setItem('hydro_logs', JSON.stringify(this.logs));
		}
	}

	#generateId() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}
}

export const logsStore = new LogsStore();
