<script>
	import { tasksStore } from '$lib/stores/tasks.svelte.js';
	import { growsStore } from '$lib/stores/grows.svelte.js';

	let filter = $state('today');

	const filteredTasks = $derived.by(() => {
		switch (filter) {
			case 'today':
				return tasksStore.getToday();
			case 'upcoming':
				return tasksStore.getUpcoming();
			case 'overdue':
				return tasksStore.getOverdue();
			case 'completed':
				return tasksStore.tasks.filter(t => t.completed);
			default:
				return tasksStore.tasks;
		}
	});

	function deleteTask(id) {
		if (confirm('Delete this task?')) {
			tasksStore.delete(id);
		}
	}
</script>

<svelte:head>
	<title>Tasks - HydroTracker</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-bold">Tasks & Reminders</h1>
		<a href="/tasks/new" class="btn btn-primary">
			<span class="text-xl">+</span>
			New Task
		</a>
	</div>

	<!-- Filter Tabs -->
	<div role="tablist" class="tabs tabs-boxed bg-base-200">
		<button
			role="tab"
			class="tab"
			class:tab-active={filter === 'today'}
			onclick={() => filter = 'today'}
		>
			Today ({tasksStore.getToday().length})
		</button>
		<button
			role="tab"
			class="tab"
			class:tab-active={filter === 'upcoming'}
			onclick={() => filter = 'upcoming'}
		>
			Upcoming
		</button>
		<button
			role="tab"
			class="tab"
			class:tab-active={filter === 'overdue'}
			onclick={() => filter = 'overdue'}
		>
			Overdue ({tasksStore.getOverdue().length})
		</button>
		<button
			role="tab"
			class="tab"
			class:tab-active={filter === 'completed'}
			onclick={() => filter = 'completed'}
		>
			Completed
		</button>
		<button
			role="tab"
			class="tab"
			class:tab-active={filter === 'all'}
			onclick={() => filter = 'all'}
		>
			All
		</button>
	</div>

	<!-- Tasks List -->
	{#if filteredTasks.length === 0}
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body text-center py-12">
				<div class="text-6xl mb-4">✓</div>
				<h3 class="text-2xl font-bold mb-2">No tasks found</h3>
				<p class="opacity-70 mb-4">You're all caught up!</p>
				<a href="/tasks/new" class="btn btn-primary">Create a Task</a>
			</div>
		</div>
	{:else}
		<div class="space-y-3">
			{#each filteredTasks as task}
				{@const grow = growsStore.getById(task.growId)}
				{@const isOverdue = !task.completed && new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0)}

				<div class="card bg-base-100 shadow hover:shadow-lg transition {isOverdue ? 'border-l-4 border-l-error' : ''}">
					<div class="card-body p-4">
						<div class="flex items-start gap-4">
							<input
								type="checkbox"
								class="checkbox checkbox-primary checkbox-lg mt-1"
								checked={task.completed}
								onchange={() => tasksStore.toggle(task.id)}
							/>

							<div class="flex-1">
								<h3 class="font-semibold text-lg {task.completed ? 'line-through opacity-60' : ''}">
									{task.title}
								</h3>
								<div class="text-sm opacity-70 space-x-2 mt-1">
									<span>📅 {task.dueDate}</span>
									{#if grow}
										<span>🌱 {grow.name}</span>
									{/if}
									{#if task.recurring}
										<span class="badge badge-sm badge-info">Recurring ({task.frequency})</span>
									{/if}
								</div>
								{#if task.notes}
									<p class="text-sm mt-2 opacity-80">{task.notes}</p>
								{/if}
							</div>

							<div class="flex flex-col items-end gap-2">
								<div class="badge {task.priority === 'Urgent' ? 'badge-error' : task.priority === 'High' ? 'badge-warning' : 'badge-info'}">
									{task.priority}
								</div>
								{#if isOverdue}
									<div class="badge badge-error">Overdue</div>
								{/if}
								<button class="btn btn-error btn-xs" onclick={() => deleteTask(task.id)}>
									Delete
								</button>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
