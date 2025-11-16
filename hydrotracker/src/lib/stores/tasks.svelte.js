import { browser } from '$app/environment';

class TasksStore {
	tasks = $state([]);

	constructor() {
		if (browser) {
			const stored = localStorage.getItem('hydro_tasks');
			if (stored) {
				this.tasks = JSON.parse(stored);
			}
		}
	}

	add(task) {
		const newTask = {
			id: this.#generateId(),
			...task,
			completed: false,
			createdAt: new Date().toISOString()
		};
		this.tasks.push(newTask);
		this.#save();
		return newTask;
	}

	update(id, updates) {
		const index = this.tasks.findIndex(t => t.id === id);
		if (index !== -1) {
			this.tasks[index] = { ...this.tasks[index], ...updates };
			this.#save();
		}
	}

	toggle(id) {
		const task = this.tasks.find(t => t.id === id);
		if (!task) return;

		task.completed = !task.completed;
		task.completedAt = task.completed ? new Date().toISOString() : null;

		// If recurring and completed, create next occurrence
		if (task.completed && task.recurring && task.frequency) {
			const nextDate = new Date(task.dueDate);

			switch (task.frequency) {
				case 'daily':
					nextDate.setDate(nextDate.getDate() + 1);
					break;
				case 'weekly':
					nextDate.setDate(nextDate.getDate() + 7);
					break;
				case 'biweekly':
					nextDate.setDate(nextDate.getDate() + 14);
					break;
				case 'monthly':
					nextDate.setMonth(nextDate.getMonth() + 1);
					break;
			}

			this.add({
				...task,
				dueDate: nextDate.toISOString().split('T')[0],
				completed: false,
				completedAt: null
			});
		}

		this.#save();
	}

	delete(id) {
		this.tasks = this.tasks.filter(t => t.id !== id);
		this.#save();
	}

	getByGrowId(growId) {
		return this.tasks.filter(t => t.growId === growId);
	}

	getToday() {
		const today = new Date().toISOString().split('T')[0];
		return this.tasks.filter(t => !t.completed && t.dueDate === today);
	}

	getUpcoming() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return this.tasks.filter(t => {
			if (t.completed) return false;
			const dueDate = new Date(t.dueDate);
			return dueDate > today;
		}).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
	}

	getOverdue() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return this.tasks.filter(t => {
			if (t.completed) return false;
			const dueDate = new Date(t.dueDate);
			return dueDate < today;
		});
	}

	#save() {
		if (browser) {
			localStorage.setItem('hydro_tasks', JSON.stringify(this.tasks));
		}
	}

	#generateId() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}
}

export const tasksStore = new TasksStore();
