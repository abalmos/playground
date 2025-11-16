import { browser } from '$app/environment';

class UsersStore {
	currentUser = $state(null);
	users = $state([]);

	constructor() {
		if (browser) {
			const storedUser = localStorage.getItem('hydro_current_user');
			if (storedUser) {
				this.currentUser = JSON.parse(storedUser);
			}

			const storedUsers = localStorage.getItem('hydro_users');
			if (storedUsers) {
				this.users = JSON.parse(storedUsers);
			}
		}
	}

	login(username, password) {
		// Simple mock authentication for demo
		const user = this.users.find(u => u.username === username && u.password === password);

		if (user) {
			this.currentUser = { ...user, password: undefined };
			this.#saveCurrentUser();
			return true;
		}

		return false;
	}

	register(userData) {
		const newUser = {
			id: this.#generateId(),
			...userData,
			createdAt: new Date().toISOString(),
			bio: '',
			avatar: null,
			following: [],
			followers: [],
			growsCount: 0,
			publicGrowsCount: 0
		};

		this.users.push(newUser);
		this.currentUser = { ...newUser, password: undefined };

		this.#saveUsers();
		this.#saveCurrentUser();

		return newUser;
	}

	logout() {
		this.currentUser = null;
		if (browser) {
			localStorage.removeItem('hydro_current_user');
		}
	}

	updateProfile(updates) {
		if (!this.currentUser) return;

		const index = this.users.findIndex(u => u.id === this.currentUser.id);
		if (index !== -1) {
			this.users[index] = { ...this.users[index], ...updates };
			this.currentUser = { ...this.users[index], password: undefined };
			this.#saveUsers();
			this.#saveCurrentUser();
		}
	}

	follow(userId) {
		if (!this.currentUser) return;

		if (!this.currentUser.following.includes(userId)) {
			this.currentUser.following.push(userId);

			// Update follower count
			const targetUser = this.users.find(u => u.id === userId);
			if (targetUser && !targetUser.followers.includes(this.currentUser.id)) {
				targetUser.followers.push(this.currentUser.id);
			}

			this.#saveUsers();
			this.#saveCurrentUser();
		}
	}

	unfollow(userId) {
		if (!this.currentUser) return;

		this.currentUser.following = this.currentUser.following.filter(id => id !== userId);

		// Update follower count
		const targetUser = this.users.find(u => u.id === userId);
		if (targetUser) {
			targetUser.followers = targetUser.followers.filter(id => id !== this.currentUser.id);
		}

		this.#saveUsers();
		this.#saveCurrentUser();
	}

	isFollowing(userId) {
		return this.currentUser?.following?.includes(userId) || false;
	}

	getById(id) {
		return this.users.find(u => u.id === id);
	}

	#saveUsers() {
		if (browser) {
			localStorage.setItem('hydro_users', JSON.stringify(this.users));
		}
	}

	#saveCurrentUser() {
		if (browser) {
			localStorage.setItem('hydro_current_user', JSON.stringify(this.currentUser));
		}
	}

	#generateId() {
		return Date.now().toString(36) + Math.random().toString(36).substr(2);
	}
}

export const usersStore = new UsersStore();
