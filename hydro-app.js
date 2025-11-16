// HydroTracker - Complete Hydroponics Management System

// ===== DATA STORAGE =====
let grows = [];
let logs = [];
let nutrients = [];
let tasks = [];
let currentGrowId = null;
let currentDate = new Date();
let currentView = 'dashboard';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeApp();
    setDefaultDate();
    updateDashboard();
});

function loadData() {
    grows = JSON.parse(localStorage.getItem('hydro_grows')) || [];
    logs = JSON.parse(localStorage.getItem('hydro_logs')) || [];
    nutrients = JSON.parse(localStorage.getItem('hydro_nutrients')) || [];
    tasks = JSON.parse(localStorage.getItem('hydro_tasks')) || [];

    // Add some default nutrients if none exist
    if (nutrients.length === 0) {
        nutrients = [
            { id: generateId(), name: 'FloraGro', brand: 'General Hydroponics', type: 'Grow', npk: '3-1-6', dosage: 5 },
            { id: generateId(), name: 'FloraBloom', brand: 'General Hydroponics', type: 'Bloom', npk: '0-5-4', dosage: 5 },
            { id: generateId(), name: 'FloraMicro', brand: 'General Hydroponics', type: 'Base', npk: '5-0-1', dosage: 5 },
            { id: generateId(), name: 'CALiMAGic', brand: 'General Hydroponics', type: 'CalMag', npk: '1-0-0', dosage: 2.5 }
        ];
        saveNutrients();
    }
}

function saveGrows() {
    localStorage.setItem('hydro_grows', JSON.stringify(grows));
}

function saveLogs() {
    localStorage.setItem('hydro_logs', JSON.stringify(logs));
}

function saveNutrients() {
    localStorage.setItem('hydro_nutrients', JSON.stringify(nutrients));
}

function saveTasks() {
    localStorage.setItem('hydro_tasks', JSON.stringify(tasks));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function initializeApp() {
    // Set up task recurring checkbox handler
    document.getElementById('taskRecurring').addEventListener('change', (e) => {
        document.getElementById('recurringOptions').style.display =
            e.target.checked ? 'block' : 'none';
    });

    // Populate grow selects
    populateGrowSelects();

    // Load locations datalist
    updateLocationsDatalist();
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const logDateInput = document.getElementById('logDate');
    if (logDateInput) {
        logDateInput.value = today;
    }

    const taskDateInput = document.getElementById('taskDueDate');
    if (taskDateInput) {
        taskDateInput.value = today;
    }

    const growStartInput = document.getElementById('growStartDate');
    if (growStartInput) {
        growStartInput.value = today;
    }
}

function updateLocationsDatalist() {
    const locations = [...new Set(grows.map(g => g.location))];
    const datalist = document.getElementById('locations');
    datalist.innerHTML = locations.map(loc => `<option value="${loc}">`).join('');
}

function populateGrowSelects() {
    const activeGrows = grows.filter(g => g.status === 'active');
    const selects = [
        'logGrowSelect',
        'feedingGrowSelect',
        'analyticsGrowSelect',
        'taskGrow'
    ];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            const isTaskSelect = selectId === 'taskGrow';
            select.innerHTML = isTaskSelect ?
                '<option value="">-- Optional --</option>' :
                '<option value="">-- Select a grow --</option>';

            activeGrows.forEach(grow => {
                const option = document.createElement('option');
                option.value = grow.id;
                option.textContent = `${grow.name} (${grow.plantType})`;
                select.appendChild(option);
            });

            if (currentValue) {
                select.value = currentValue;
            }
        }
    });
}

// ===== NAVIGATION =====
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected view
    document.getElementById(`${viewName}-view`).classList.add('active');

    // Set active nav button
    document.querySelector(`.nav-btn[data-view="${viewName}"]`).classList.add('active');

    currentView = viewName;

    // Load view-specific data
    switch(viewName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'grows':
            displayGrows();
            break;
        case 'log':
            populateGrowSelects();
            break;
        case 'nutrients':
            displayNutrients();
            populateGrowSelects();
            break;
        case 'tasks':
            filterTasks('today');
            break;
        case 'timeline':
            renderCalendar();
            break;
        case 'analytics':
            populateGrowSelects();
            break;
    }
}

// ===== DASHBOARD =====
function updateDashboard() {
    const activeGrows = grows.filter(g => g.status === 'active');
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t =>
        !t.completed && t.dueDate === todayStr
    );

    // Calculate harvest soon (within 2 weeks)
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    const harvestSoon = activeGrows.filter(g => {
        if (!g.expectedHarvest) return false;
        const harvestDate = new Date(g.expectedHarvest);
        return harvestDate <= twoWeeksFromNow && harvestDate >= new Date();
    });

    const completedGrows = grows.filter(g => g.status === 'completed');

    // Update stats
    document.getElementById('activeGrowsCount').textContent = activeGrows.length;
    document.getElementById('tasksToday').textContent = todayTasks.length;
    document.getElementById('harvestSoon').textContent = harvestSoon.length;
    document.getElementById('totalHarvests').textContent = completedGrows.length;

    // Display active grows
    displayActiveGrows();
    displayUpcomingTasks();
    displayRecentAlerts();
}

function displayActiveGrows() {
    const container = document.getElementById('activeGrowsList');
    const activeGrows = grows.filter(g => g.status === 'active');

    if (activeGrows.length === 0) {
        container.innerHTML = '<div class="empty-state">No active grows. Start one to begin tracking!</div>';
        return;
    }

    container.innerHTML = activeGrows.slice(0, 5).map(grow => {
        const daysSinceStart = grow.startDate ?
            Math.floor((new Date() - new Date(grow.startDate)) / (1000 * 60 * 60 * 24)) : 0;
        const latestLog = logs.filter(l => l.growId === grow.id).sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        )[0];

        return `
            <div class="grow-item">
                <div class="grow-header">
                    <div>
                        <div class="grow-title">${grow.name}</div>
                        <div class="grow-meta">
                            <span>🌱 ${grow.plantType}</span>
                            <span>📍 ${grow.location}</span>
                            <span>💧 ${grow.system}</span>
                            ${latestLog ? `<span>📊 ${latestLog.stage || 'N/A'}</span>` : ''}
                        </div>
                    </div>
                    <span class="badge badge-success">Day ${daysSinceStart}</span>
                </div>
                ${latestLog ? `
                    <div class="log-metrics">
                        ${latestLog.pH ? `<div class="metric-item"><div class="metric-value">${latestLog.pH}</div><div class="metric-label">pH</div></div>` : ''}
                        ${latestLog.EC ? `<div class="metric-item"><div class="metric-value">${latestLog.EC}</div><div class="metric-label">EC</div></div>` : ''}
                        ${latestLog.waterTemp ? `<div class="metric-item"><div class="metric-value">${latestLog.waterTemp}°F</div><div class="metric-label">Water</div></div>` : ''}
                        ${latestLog.airTemp ? `<div class="metric-item"><div class="metric-value">${latestLog.airTemp}°F</div><div class="metric-label">Air</div></div>` : ''}
                    </div>
                ` : '<p style="color: var(--text-light);">No logs yet</p>'}
                <div class="grow-actions">
                    <button onclick="quickLog('${grow.id}')" class="btn">Quick Log</button>
                    <button onclick="viewGrowDetails('${grow.id}')" class="btn btn-secondary">View Details</button>
                </div>
            </div>
        `;
    }).join('');
}

function displayUpcomingTasks() {
    const container = document.getElementById('upcomingTasksList');
    const upcoming = tasks.filter(t => !t.completed)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    if (upcoming.length === 0) {
        container.innerHTML = '<div class="empty-state">No upcoming tasks</div>';
        return;
    }

    container.innerHTML = upcoming.map(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = dueDate < today;
        const grow = grows.find(g => g.id === task.growId);

        return `
            <div class="task-item ${isOverdue ? 'overdue' : ''}">
                <input type="checkbox" class="task-checkbox" onchange="toggleTask('${task.id}')">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        ${task.dueDate} | ${task.priority} priority
                        ${grow ? ` | ${grow.name}` : ''}
                    </div>
                </div>
                <span class="badge ${task.priority === 'Urgent' ? 'badge-danger' : task.priority === 'High' ? 'badge-warning' : 'badge-info'}">
                    ${task.priority}
                </span>
            </div>
        `;
    }).join('');
}

function displayRecentAlerts() {
    const container = document.getElementById('recentAlerts');
    const alerts = [];

    // Check for pH issues in recent logs
    const recentLogs = logs.filter(l => {
        const logDate = new Date(l.date);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return logDate >= threeDaysAgo;
    });

    recentLogs.forEach(log => {
        const grow = grows.find(g => g.id === log.growId);
        if (!grow) return;

        if (log.pH && (log.pH < 5.5 || log.pH > 6.5)) {
            alerts.push({
                type: 'warning',
                message: `pH out of range (${log.pH}) for ${grow.name}`,
                date: log.date
            });
        }

        if (log.waterTemp && (log.waterTemp < 60 || log.waterTemp > 75)) {
            alerts.push({
                type: 'warning',
                message: `Water temp out of range (${log.waterTemp}°F) for ${grow.name}`,
                date: log.date
            });
        }
    });

    // Check for overdue tasks
    const overdueTasks = tasks.filter(t => {
        if (t.completed) return false;
        const dueDate = new Date(t.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    });

    if (overdueTasks.length > 0) {
        alerts.push({
            type: 'danger',
            message: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
            date: new Date().toISOString().split('T')[0]
        });
    }

    if (alerts.length === 0) {
        container.innerHTML = '<div class="alert alert-success">All systems looking good! 🌱</div>';
        return;
    }

    container.innerHTML = alerts.slice(0, 5).map(alert => `
        <div class="alert alert-${alert.type}">
            <strong>${alert.message}</strong><br>
            <small>${alert.date}</small>
        </div>
    `).join('');
}

function quickLog(growId) {
    showView('log');
    document.getElementById('logGrowSelect').value = growId;
    showLogForm();
}

function viewGrowDetails(growId) {
    showView('analytics');
    document.getElementById('analyticsGrowSelect').value = growId;
    loadAnalytics();
}

// ===== GROW MANAGEMENT =====
function showAddGrow() {
    document.getElementById('addGrowModal').classList.add('active');
}

function closeAddGrow() {
    document.getElementById('addGrowModal').classList.remove('active');
    clearGrowForm();
}

function clearGrowForm() {
    document.getElementById('growName').value = '';
    document.getElementById('growPlantType').value = '';
    document.getElementById('growLocation').value = '';
    document.getElementById('growEnvironment').value = 'Indoor';
    document.getElementById('growSystem').value = 'DWC';
    document.getElementById('growMedium').value = 'Coco Coir';
    document.getElementById('growStartDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('growExpectedHarvest').value = '';
    document.getElementById('growPurpose').value = 'Fresh Consumption';
    document.getElementById('growNotes').value = '';
}

function saveGrow() {
    const name = document.getElementById('growName').value.trim();
    const plantType = document.getElementById('growPlantType').value.trim();
    const location = document.getElementById('growLocation').value.trim();

    if (!name || !plantType || !location) {
        alert('Please fill in required fields (Name, Plant Type, Location)');
        return;
    }

    const grow = {
        id: generateId(),
        name,
        plantType,
        location,
        environment: document.getElementById('growEnvironment').value,
        system: document.getElementById('growSystem').value,
        medium: document.getElementById('growMedium').value,
        startDate: document.getElementById('growStartDate').value,
        expectedHarvest: document.getElementById('growExpectedHarvest').value,
        purpose: document.getElementById('growPurpose').value,
        notes: document.getElementById('growNotes').value.trim(),
        status: 'active',
        createdAt: new Date().toISOString()
    };

    grows.push(grow);
    saveGrows();
    updateLocationsDatalist();
    populateGrowSelects();
    closeAddGrow();
    updateDashboard();
    displayGrows();

    // Auto-create initial tasks
    createInitialTasks(grow);
}

function createInitialTasks(grow) {
    const startDate = new Date(grow.startDate);

    // Add first check task
    const firstCheck = new Date(startDate);
    firstCheck.setDate(firstCheck.getDate() + 1);

    tasks.push({
        id: generateId(),
        title: 'First system check',
        growId: grow.id,
        dueDate: firstCheck.toISOString().split('T')[0],
        priority: 'High',
        completed: false,
        recurring: false,
        notes: 'Check pH, EC, water level, and plant health',
        createdAt: new Date().toISOString()
    });

    // Add weekly reservoir change reminder
    const weeklyCheck = new Date(startDate);
    weeklyCheck.setDate(weeklyCheck.getDate() + 7);

    tasks.push({
        id: generateId(),
        title: 'Weekly reservoir change/check',
        growId: grow.id,
        dueDate: weeklyCheck.toISOString().split('T')[0],
        priority: 'Medium',
        completed: false,
        recurring: true,
        frequency: 'weekly',
        notes: 'Change reservoir, clean system, fresh nutrients',
        createdAt: new Date().toISOString()
    });

    saveTasks();
}

function displayGrows() {
    const container = document.getElementById('growsList');
    const filterLocation = document.getElementById('filterLocation').value;
    const filterSystem = document.getElementById('filterSystem').value;
    const filterStatus = document.getElementById('filterStatus').value;

    let filtered = grows;

    if (filterLocation) {
        filtered = filtered.filter(g => g.location === filterLocation);
    }

    if (filterSystem) {
        filtered = filtered.filter(g => g.system === filterSystem);
    }

    if (filterStatus !== 'all') {
        filtered = filtered.filter(g => g.status === filterStatus);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No grows found</div>';
        return;
    }

    container.innerHTML = filtered.map(grow => {
        const daysSinceStart = grow.startDate ?
            Math.floor((new Date() - new Date(grow.startDate)) / (1000 * 60 * 60 * 24)) : 0;
        const growLogs = logs.filter(l => l.growId === grow.id);
        const latestLog = growLogs.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        return `
            <div class="grow-item">
                <div class="grow-header">
                    <div>
                        <div class="grow-title">${grow.name}</div>
                        <div class="grow-meta">
                            <span>🌱 ${grow.plantType}</span>
                            <span>📍 ${grow.location} (${grow.environment})</span>
                            <span>💧 ${grow.system} - ${grow.medium}</span>
                            <span>📅 Started: ${grow.startDate || 'N/A'}</span>
                            ${grow.expectedHarvest ? `<span>🌾 Harvest: ${grow.expectedHarvest}</span>` : ''}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge ${grow.status === 'active' ? 'badge-success' : 'badge-info'}">
                            ${grow.status}
                        </span>
                        ${grow.status === 'active' ? `<div style="margin-top: 0.5rem;"><span class="badge badge-info">Day ${daysSinceStart}</span></div>` : ''}
                    </div>
                </div>

                ${latestLog && latestLog.stage ? `
                    <div style="margin: 1rem 0;">
                        <span class="stage-indicator stage-${latestLog.stage.toLowerCase().replace(/[- ]/g, '')}">${latestLog.stage}</span>
                    </div>
                ` : ''}

                <div style="margin: 1rem 0;">
                    <strong>Purpose:</strong> ${grow.purpose}<br>
                    ${grow.notes ? `<strong>Notes:</strong> ${grow.notes}<br>` : ''}
                    <strong>Total Logs:</strong> ${growLogs.length}
                </div>

                <div class="grow-actions">
                    <button onclick="quickLog('${grow.id}')" class="btn">Add Log</button>
                    <button onclick="viewGrowDetails('${grow.id}')" class="btn btn-secondary">Analytics</button>
                    ${grow.status === 'active' ? `
                        <button onclick="completeGrow('${grow.id}')" class="btn btn-success">Mark Complete</button>
                    ` : ''}
                    <button onclick="deleteGrow('${grow.id}')" class="btn btn-danger">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    // Update filter dropdowns with unique locations
    updateFilterDropdowns();
}

function updateFilterDropdowns() {
    const locations = [...new Set(grows.map(g => g.location))];
    const locationSelect = document.getElementById('filterLocation');
    const currentValue = locationSelect.value;

    locationSelect.innerHTML = '<option value="">All Locations</option>' +
        locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');

    if (currentValue) {
        locationSelect.value = currentValue;
    }
}

function filterGrows() {
    displayGrows();
}

function completeGrow(growId) {
    const grow = grows.find(g => g.id === growId);
    if (!grow) return;

    const yield = prompt(`Enter harvest yield for ${grow.name} (optional):`);

    grow.status = 'completed';
    grow.completedDate = new Date().toISOString().split('T')[0];
    if (yield) {
        grow.harvestYield = yield;
    }

    saveGrows();
    displayGrows();
    updateDashboard();
}

function deleteGrow(growId) {
    if (!confirm('Are you sure you want to delete this grow? This will also delete all associated logs.')) {
        return;
    }

    grows = grows.filter(g => g.id !== growId);
    logs = logs.filter(l => l.growId !== growId);
    tasks = tasks.filter(t => t.growId !== growId);

    saveGrows();
    saveLogs();
    saveTasks();

    displayGrows();
    updateDashboard();
}

// ===== DAILY LOGGING =====
function showLogForm() {
    const growId = document.getElementById('logGrowSelect').value;
    if (!growId) {
        document.getElementById('logFormContainer').style.display = 'none';
        return;
    }

    document.getElementById('logFormContainer').style.display = 'block';
    currentGrowId = growId;
    loadTodayLogsForGrow(growId);
}

function loadTodayLogsForGrow(growId) {
    const date = document.getElementById('logDate').value;
    const growLogs = logs.filter(l => l.growId === growId && l.date === date);
    const container = document.getElementById('todayLogs');

    if (growLogs.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No logs for this date yet</p>';
        return;
    }

    container.innerHTML = growLogs.map(log => `
        <div class="log-entry">
            <div class="log-header">
                <span>${new Date(log.timestamp).toLocaleTimeString()}</span>
                <button onclick="deleteLog('${log.id}')" class="btn btn-danger" style="padding: 0.25rem 0.75rem; font-size: 0.85rem;">Delete</button>
            </div>
            <div class="log-metrics">
                ${log.pH ? `<div class="metric-item"><div class="metric-value">${log.pH}</div><div class="metric-label">pH</div></div>` : ''}
                ${log.EC ? `<div class="metric-item"><div class="metric-value">${log.EC}</div><div class="metric-label">EC</div></div>` : ''}
                ${log.PPM ? `<div class="metric-item"><div class="metric-value">${log.PPM}</div><div class="metric-label">PPM</div></div>` : ''}
                ${log.waterTemp ? `<div class="metric-item"><div class="metric-value">${log.waterTemp}°F</div><div class="metric-label">Water Temp</div></div>` : ''}
                ${log.airTemp ? `<div class="metric-item"><div class="metric-value">${log.airTemp}°F</div><div class="metric-label">Air Temp</div></div>` : ''}
                ${log.humidity ? `<div class="metric-item"><div class="metric-value">${log.humidity}%</div><div class="metric-label">Humidity</div></div>` : ''}
                ${log.lightHours ? `<div class="metric-item"><div class="metric-value">${log.lightHours}h</div><div class="metric-label">Light</div></div>` : ''}
                ${log.stage ? `<div class="metric-item"><div class="metric-value" style="font-size: 0.9rem;">${log.stage}</div><div class="metric-label">Stage</div></div>` : ''}
            </div>
            ${log.notes ? `<p style="margin-top: 0.75rem;"><strong>Notes:</strong> ${log.notes}</p>` : ''}
        </div>
    `).join('');
}

function saveLog() {
    const growId = document.getElementById('logGrowSelect').value;
    const date = document.getElementById('logDate').value;

    if (!growId) {
        alert('Please select a grow');
        return;
    }

    const log = {
        id: generateId(),
        growId,
        date,
        timestamp: new Date().toISOString(),
        pH: parseFloat(document.getElementById('logPH').value) || null,
        EC: parseFloat(document.getElementById('logEC').value) || null,
        PPM: parseInt(document.getElementById('logPPM').value) || null,
        waterTemp: parseFloat(document.getElementById('logWaterTemp').value) || null,
        airTemp: parseFloat(document.getElementById('logAirTemp').value) || null,
        humidity: parseInt(document.getElementById('logHumidity').value) || null,
        lightHours: parseFloat(document.getElementById('logLightHours').value) || null,
        reservoirLevel: parseFloat(document.getElementById('logReservoirLevel').value) || null,
        runoffPH: parseFloat(document.getElementById('logRunoffPH').value) || null,
        runoffEC: parseFloat(document.getElementById('logRunoffEC').value) || null,
        plantHeight: parseFloat(document.getElementById('logPlantHeight').value) || null,
        stage: document.getElementById('logStage').value || null,
        notes: document.getElementById('logNotes').value.trim() || null
    };

    logs.push(log);
    saveLogs();

    // Clear form
    clearLogForm();

    // Reload today's logs
    loadTodayLogsForGrow(growId);
    updateDashboard();

    alert('Log entry saved!');
}

function clearLogForm() {
    document.getElementById('logPH').value = '';
    document.getElementById('logEC').value = '';
    document.getElementById('logPPM').value = '';
    document.getElementById('logWaterTemp').value = '';
    document.getElementById('logAirTemp').value = '';
    document.getElementById('logHumidity').value = '';
    document.getElementById('logLightHours').value = '';
    document.getElementById('logReservoirLevel').value = '';
    document.getElementById('logRunoffPH').value = '';
    document.getElementById('logRunoffEC').value = '';
    document.getElementById('logPlantHeight').value = '';
    document.getElementById('logStage').value = '';
    document.getElementById('logNotes').value = '';
}

function deleteLog(logId) {
    if (!confirm('Delete this log entry?')) return;

    logs = logs.filter(l => l.id !== logId);
    saveLogs();

    const growId = document.getElementById('logGrowSelect').value;
    loadTodayLogsForGrow(growId);
}

function loadLogsForDate() {
    const growId = document.getElementById('logGrowSelect').value;
    if (growId) {
        loadTodayLogsForGrow(growId);
    }
}

// ===== NUTRIENTS =====
function displayNutrients() {
    const container = document.getElementById('nutrientList');

    if (nutrients.length === 0) {
        container.innerHTML = '<div class="empty-state">No nutrients added yet</div>';
        return;
    }

    container.innerHTML = nutrients.map(nutrient => `
        <div class="nutrient-item">
            <div class="nutrient-info">
                <h4>${nutrient.name}</h4>
                <div class="nutrient-meta">
                    ${nutrient.brand} | ${nutrient.type} | NPK: ${nutrient.npk} | ${nutrient.dosage} ml/gal
                </div>
            </div>
            <button onclick="deleteNutrient('${nutrient.id}')" class="btn btn-danger" style="padding: 0.5rem 1rem;">Delete</button>
        </div>
    `).join('');
}

function showAddNutrient() {
    document.getElementById('addNutrientModal').classList.add('active');
}

function closeAddNutrient() {
    document.getElementById('addNutrientModal').classList.remove('active');
}

function saveNutrient() {
    const name = document.getElementById('nutrientName').value.trim();

    if (!name) {
        alert('Please enter nutrient name');
        return;
    }

    const nutrient = {
        id: generateId(),
        name,
        brand: document.getElementById('nutrientBrand').value.trim(),
        type: document.getElementById('nutrientType').value,
        npk: document.getElementById('nutrientNPK').value.trim(),
        dosage: parseFloat(document.getElementById('nutrientDosage').value) || 0
    };

    nutrients.push(nutrient);
    saveNutrients();
    closeAddNutrient();
    displayNutrients();

    // Clear form
    document.getElementById('nutrientName').value = '';
    document.getElementById('nutrientBrand').value = '';
    document.getElementById('nutrientNPK').value = '';
    document.getElementById('nutrientDosage').value = '';
}

function deleteNutrient(nutrientId) {
    if (!confirm('Delete this nutrient?')) return;

    nutrients = nutrients.filter(n => n.id !== nutrientId);
    saveNutrients();
    displayNutrients();
}

function loadFeedingSchedule() {
    const growId = document.getElementById('feedingGrowSelect').value;
    const container = document.getElementById('feedingSchedule');

    if (!growId) {
        container.innerHTML = '';
        return;
    }

    const grow = grows.find(g => g.id === growId);
    const growLogs = logs.filter(l => l.growId === growId).sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    container.innerHTML = `
        <h4>${grow.name} - Feeding History</h4>
        ${growLogs.length === 0 ? '<p>No feeding logs yet</p>' : ''}
        ${growLogs.map(log => `
            <div class="log-entry">
                <strong>${log.date}</strong>
                ${log.stage ? `<span class="badge badge-info">${log.stage}</span>` : ''}
                <div class="log-metrics">
                    ${log.EC ? `<div class="metric-item"><div class="metric-value">${log.EC}</div><div class="metric-label">EC</div></div>` : ''}
                    ${log.PPM ? `<div class="metric-item"><div class="metric-value">${log.PPM}</div><div class="metric-label">PPM</div></div>` : ''}
                    ${log.pH ? `<div class="metric-item"><div class="metric-value">${log.pH}</div><div class="metric-label">pH</div></div>` : ''}
                </div>
                ${log.notes ? `<p><small>${log.notes}</small></p>` : ''}
            </div>
        `).join('')}
    `;
}

// ===== TASKS =====
function showAddTask() {
    document.getElementById('addTaskModal').classList.add('active');
    populateGrowSelects();
}

function closeAddTask() {
    document.getElementById('addTaskModal').classList.remove('active');
}

function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;

    if (!title || !dueDate) {
        alert('Please enter task title and due date');
        return;
    }

    const task = {
        id: generateId(),
        title,
        growId: document.getElementById('taskGrow').value || null,
        dueDate,
        priority: document.getElementById('taskPriority').value,
        recurring: document.getElementById('taskRecurring').checked,
        frequency: document.getElementById('taskRecurring').checked ?
            document.getElementById('taskFrequency').value : null,
        notes: document.getElementById('taskNotes').value.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    closeAddTask();

    // Clear form
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDueDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('taskPriority').value = 'Medium';
    document.getElementById('taskRecurring').checked = false;
    document.getElementById('recurringOptions').style.display = 'none';
    document.getElementById('taskNotes').value = '';

    if (currentView === 'tasks') {
        filterTasks('today');
    }
    updateDashboard();
}

function filterTasks(filter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = tasks;

    // Remove active from all filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Set active on clicked button
    event.target.classList.add('active');

    switch(filter) {
        case 'today':
            const todayStr = today.toISOString().split('T')[0];
            filtered = tasks.filter(t => !t.completed && t.dueDate === todayStr);
            break;
        case 'upcoming':
            filtered = tasks.filter(t => {
                if (t.completed) return false;
                const dueDate = new Date(t.dueDate);
                return dueDate > today;
            });
            break;
        case 'overdue':
            filtered = tasks.filter(t => {
                if (t.completed) return false;
                const dueDate = new Date(t.dueDate);
                return dueDate < today;
            });
            break;
        case 'completed':
            filtered = tasks.filter(t => t.completed);
            break;
        case 'all':
            // Show all
            break;
    }

    displayTasks(filtered);
}

function displayTasks(taskList) {
    const container = document.getElementById('tasksList');

    if (taskList.length === 0) {
        container.innerHTML = '<div class="empty-state">No tasks found</div>';
        return;
    }

    container.innerHTML = taskList.map(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = !task.completed && dueDate < today;
        const grow = grows.find(g => g.id === task.growId);

        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        Due: ${task.dueDate} | ${task.priority} priority
                        ${grow ? ` | ${grow.name}` : ''}
                        ${task.recurring ? ' | Recurring' : ''}
                    </div>
                    ${task.notes ? `<p style="margin-top: 0.5rem; color: var(--text-light);">${task.notes}</p>` : ''}
                </div>
                <div>
                    <span class="badge ${task.priority === 'Urgent' ? 'badge-danger' : task.priority === 'High' ? 'badge-warning' : 'badge-info'}">
                        ${task.priority}
                    </span>
                    <button onclick="deleteTask('${task.id}')" class="btn btn-danger" style="padding: 0.25rem 0.75rem; font-size: 0.85rem; margin-top: 0.5rem;">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    // If recurring, create next occurrence
    if (task.completed && task.recurring) {
        const nextDate = new Date(task.dueDate);

        switch(task.frequency) {
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

        const newTask = {
            ...task,
            id: generateId(),
            dueDate: nextDate.toISOString().split('T')[0],
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
    }

    saveTasks();

    if (currentView === 'tasks') {
        // Re-apply current filter
        const activeFilter = document.querySelector('.filter-btn.active');
        if (activeFilter) {
            const filterText = activeFilter.textContent.toLowerCase();
            filterTasks(filterText);
        }
    }
    updateDashboard();
}

function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;

    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();

    if (currentView === 'tasks') {
        const activeFilter = document.querySelector('.filter-btn.active');
        if (activeFilter) {
            const filterText = activeFilter.textContent.toLowerCase();
            filterTasks(filterText);
        }
    }
    updateDashboard();
}

// ===== TIMELINE/CALENDAR =====
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('currentMonth').textContent =
        new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const calendar = document.getElementById('calendar');
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '<div class="calendar-grid">';

    // Day headers
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day" style="opacity: 0.3;"></div>';
    }

    // Days of month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dateStr === today.toISOString().split('T')[0];

        // Count events for this day
        const dayTasks = tasks.filter(t => t.dueDate === dateStr);
        const dayLogs = logs.filter(l => l.date === dateStr);
        const hasEvents = dayTasks.length > 0 || dayLogs.length > 0;

        html += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}"
                 onclick="selectCalendarDate('${dateStr}')">
                <div class="day-number">${day}</div>
                <div class="day-events">${dayTasks.length + dayLogs.length} events</div>
            </div>
        `;
    }

    html += '</div>';
    calendar.innerHTML = html;
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function selectCalendarDate(dateStr) {
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    const dayLogs = logs.filter(l => l.date === dateStr);

    const container = document.getElementById('dateEvents');

    if (dayTasks.length === 0 && dayLogs.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No events for this date</p>';
        return;
    }

    let html = `<h4>${dateStr}</h4>`;

    if (dayTasks.length > 0) {
        html += '<h5>Tasks:</h5>';
        dayTasks.forEach(task => {
            const grow = grows.find(g => g.id === task.growId);
            html += `
                <div class="task-item ${task.completed ? 'completed' : ''}">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
                    <div class="task-content">
                        <div class="task-title">${task.title}</div>
                        <div class="task-meta">${task.priority} priority${grow ? ` | ${grow.name}` : ''}</div>
                    </div>
                </div>
            `;
        });
    }

    if (dayLogs.length > 0) {
        html += '<h5>Logs:</h5>';
        dayLogs.forEach(log => {
            const grow = grows.find(g => g.id === log.growId);
            html += `
                <div class="log-entry">
                    <strong>${grow ? grow.name : 'Unknown Grow'}</strong>
                    <div class="log-metrics">
                        ${log.pH ? `<div class="metric-item"><div class="metric-value">${log.pH}</div><div class="metric-label">pH</div></div>` : ''}
                        ${log.EC ? `<div class="metric-item"><div class="metric-value">${log.EC}</div><div class="metric-label">EC</div></div>` : ''}
                        ${log.stage ? `<div class="metric-item"><div class="metric-value" style="font-size: 0.9rem;">${log.stage}</div><div class="metric-label">Stage</div></div>` : ''}
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = html;
}

// ===== ANALYTICS =====
function loadAnalytics() {
    const growId = document.getElementById('analyticsGrowSelect').value;
    const container = document.getElementById('analyticsContainer');

    if (!growId) {
        container.innerHTML = '';
        return;
    }

    const grow = grows.find(g => g.id === growId);
    const growLogs = logs.filter(l => l.growId === growId).sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    if (growLogs.length === 0) {
        container.innerHTML = '<div class="empty-state">No logs to analyze yet</div>';
        return;
    }

    // Calculate statistics
    const pHValues = growLogs.filter(l => l.pH).map(l => l.pH);
    const ecValues = growLogs.filter(l => l.EC).map(l => l.EC);
    const waterTempValues = growLogs.filter(l => l.waterTemp).map(l => l.waterTemp);
    const airTempValues = growLogs.filter(l => l.airTemp).map(l => l.airTemp);

    const avgPH = pHValues.length > 0 ? (pHValues.reduce((a, b) => a + b, 0) / pHValues.length).toFixed(2) : 'N/A';
    const avgEC = ecValues.length > 0 ? (ecValues.reduce((a, b) => a + b, 0) / ecValues.length).toFixed(2) : 'N/A';
    const avgWaterTemp = waterTempValues.length > 0 ? (waterTempValues.reduce((a, b) => a + b, 0) / waterTempValues.length).toFixed(1) : 'N/A';
    const avgAirTemp = airTempValues.length > 0 ? (airTempValues.reduce((a, b) => a + b, 0) / airTempValues.length).toFixed(1) : 'N/A';

    const daysSinceStart = grow.startDate ?
        Math.floor((new Date() - new Date(grow.startDate)) / (1000 * 60 * 60 * 24)) : 0;

    let html = `
        <div class="card">
            <h3>${grow.name} - Analytics</h3>
            <div class="grow-meta">
                <span>📅 Day ${daysSinceStart}</span>
                <span>📊 ${growLogs.length} log entries</span>
                <span>🌱 ${grow.plantType}</span>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${avgPH}</div>
                <div class="stat-label">Avg pH</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgEC}</div>
                <div class="stat-label">Avg EC</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgWaterTemp}°F</div>
                <div class="stat-label">Avg Water Temp</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgAirTemp}°F</div>
                <div class="stat-label">Avg Air Temp</div>
            </div>
        </div>

        <div class="card">
            <h3>Growth Timeline</h3>
            ${renderTimeline(growLogs)}
        </div>

        <div class="card">
            <h3>Complete Log History</h3>
            ${growLogs.map(log => `
                <div class="log-entry">
                    <div class="log-header">
                        <span><strong>${log.date}</strong> ${new Date(log.timestamp).toLocaleTimeString()}</span>
                        ${log.stage ? `<span class="badge badge-info">${log.stage}</span>` : ''}
                    </div>
                    <div class="log-metrics">
                        ${log.pH ? `<div class="metric-item"><div class="metric-value">${log.pH}</div><div class="metric-label">pH</div></div>` : ''}
                        ${log.EC ? `<div class="metric-item"><div class="metric-value">${log.EC}</div><div class="metric-label">EC</div></div>` : ''}
                        ${log.PPM ? `<div class="metric-item"><div class="metric-value">${log.PPM}</div><div class="metric-label">PPM</div></div>` : ''}
                        ${log.waterTemp ? `<div class="metric-item"><div class="metric-value">${log.waterTemp}°F</div><div class="metric-label">Water</div></div>` : ''}
                        ${log.airTemp ? `<div class="metric-item"><div class="metric-value">${log.airTemp}°F</div><div class="metric-label">Air</div></div>` : ''}
                        ${log.humidity ? `<div class="metric-item"><div class="metric-value">${log.humidity}%</div><div class="metric-label">Humidity</div></div>` : ''}
                        ${log.plantHeight ? `<div class="metric-item"><div class="metric-value">${log.plantHeight}"</div><div class="metric-label">Height</div></div>` : ''}
                    </div>
                    ${log.notes ? `<p style="margin-top: 0.75rem;"><strong>Notes:</strong> ${log.notes}</p>` : ''}
                </div>
            `).join('')}
        </div>

        <div class="card">
            <button onclick="exportGrowData('${growId}')" class="btn">Export Grow Data</button>
        </div>
    `;

    container.innerHTML = html;
}

function renderTimeline(logs) {
    return logs.map(log => {
        const dayNumber = Math.floor((new Date(log.date) - new Date(logs[0].date)) / (1000 * 60 * 60 * 24));
        return `
            <div style="padding: 0.75rem; border-left: 3px solid var(--primary-color); margin-left: 1rem; margin-bottom: 0.75rem; background: var(--bg-light);">
                <strong>Day ${dayNumber}</strong> - ${log.date}
                ${log.stage ? `<span class="badge badge-info" style="margin-left: 0.5rem;">${log.stage}</span>` : ''}
                <div style="margin-top: 0.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${log.pH ? `<span>pH: ${log.pH}</span>` : ''}
                    ${log.EC ? `<span>EC: ${log.EC}</span>` : ''}
                    ${log.plantHeight ? `<span>Height: ${log.plantHeight}"</span>` : ''}
                </div>
                ${log.notes ? `<p style="margin-top: 0.5rem; color: var(--text-light); font-size: 0.9rem;">${log.notes}</p>` : ''}
            </div>
        `;
    }).join('');
}

function exportGrowData(growId) {
    const grow = grows.find(g => g.id === growId);
    const growLogs = logs.filter(l => l.growId === growId).sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    let csv = 'Date,Time,pH,EC,PPM,Water Temp,Air Temp,Humidity,Light Hours,Reservoir Level,Runoff pH,Runoff EC,Plant Height,Stage,Notes\n';

    growLogs.forEach(log => {
        const timestamp = new Date(log.timestamp);
        csv += `${log.date},${timestamp.toLocaleTimeString()},${log.pH || ''},${log.EC || ''},${log.PPM || ''},${log.waterTemp || ''},${log.airTemp || ''},${log.humidity || ''},${log.lightHours || ''},${log.reservoirLevel || ''},${log.runoffPH || ''},${log.runoffEC || ''},${log.plantHeight || ''},${log.stage || ''},"${log.notes || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${grow.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
