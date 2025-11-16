// Client management system
let clients = [];
let currentClientId = null;

// Load clients from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadClients();
    displayClients();
    setDefaultDate();
});

function loadClients() {
    const stored = localStorage.getItem('clients');
    if (stored) {
        clients = JSON.parse(stored);
    }
}

function saveClients() {
    localStorage.setItem('clients', JSON.stringify(clients));
}

function displayClients() {
    const container = document.getElementById('clientsList');

    if (clients.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">No clients yet</p>
                <p>Add your first client to get started</p>
            </div>
        `;
        return;
    }

    let html = '<table><thead><tr><th>Name</th><th>Contact</th><th>Sessions</th><th>Last Session</th><th>Actions</th></tr></thead><tbody>';

    clients.forEach(client => {
        const sessionCount = client.sessions ? client.sessions.length : 0;
        const lastSession = sessionCount > 0 ? new Date(client.sessions[sessionCount - 1].date).toLocaleDateString() : 'Never';

        html += `
            <tr>
                <td><strong>${client.name}</strong></td>
                <td>${client.email || client.phone || 'N/A'}</td>
                <td>${sessionCount}</td>
                <td>${lastSession}</td>
                <td>
                    <button onclick="viewClientDetails('${client.id}')" class="btn" style="padding: 0.5rem 1rem; font-size: 0.875rem;">View</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function filterClients() {
    const search = document.getElementById('searchClients').value.toLowerCase();
    const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(search) ||
        (client.email && client.email.toLowerCase().includes(search)) ||
        (client.phone && client.phone.includes(search))
    );

    // Display filtered results (simplified version)
    const container = document.getElementById('clientsList');
    let html = '<table><thead><tr><th>Name</th><th>Contact</th><th>Sessions</th><th>Last Session</th><th>Actions</th></tr></thead><tbody>';

    filtered.forEach(client => {
        const sessionCount = client.sessions ? client.sessions.length : 0;
        const lastSession = sessionCount > 0 ? new Date(client.sessions[sessionCount - 1].date).toLocaleDateString() : 'Never';

        html += `
            <tr>
                <td><strong>${client.name}</strong></td>
                <td>${client.email || client.phone || 'N/A'}</td>
                <td>${sessionCount}</td>
                <td>${lastSession}</td>
                <td>
                    <button onclick="viewClientDetails('${client.id}')" class="btn" style="padding: 0.5rem 1rem; font-size: 0.875rem;">View</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function showAddClient() {
    document.getElementById('addClientModal').style.display = 'block';
    document.getElementById('clientName').focus();
}

function cancelAddClient() {
    document.getElementById('addClientModal').style.display = 'none';
    clearClientForm();
}

function clearClientForm() {
    document.getElementById('clientName').value = '';
    document.getElementById('clientEmail').value = '';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientNotes').value = '';
}

function saveClient() {
    const name = document.getElementById('clientName').value.trim();

    if (!name) {
        alert('Please enter a client name');
        return;
    }

    const client = {
        id: generateId(),
        name,
        email: document.getElementById('clientEmail').value.trim(),
        phone: document.getElementById('clientPhone').value.trim(),
        notes: document.getElementById('clientNotes').value.trim(),
        sessions: [],
        createdAt: new Date().toISOString()
    };

    clients.push(client);
    saveClients();
    displayClients();
    cancelAddClient();
}

function viewClientDetails(clientId) {
    const client = clients.find(c => c.id === clientId);

    if (!client) {
        alert('Client not found');
        return;
    }

    currentClientId = clientId;

    document.getElementById('detailClientName').textContent = client.name;
    document.getElementById('detailClientInfo').textContent =
        `${client.email || ''} ${client.phone || ''} • Member since ${new Date(client.createdAt).toLocaleDateString()}`;

    displaySessionHistory(client);
    document.getElementById('clientDetailsModal').style.display = 'block';
}

function closeClientDetails() {
    document.getElementById('clientDetailsModal').style.display = 'none';
    currentClientId = null;
    document.getElementById('addSessionForm').style.display = 'none';
}

function displaySessionHistory(client) {
    const container = document.getElementById('sessionHistory');

    if (!client.sessions || client.sessions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-light);">
                <p>No sessions recorded yet</p>
            </div>
        `;
        return;
    }

    // Sort sessions by date (newest first)
    const sortedSessions = [...client.sessions].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    let totalRevenue = 0;
    let totalDuration = 0;

    let html = '<div style="margin-bottom: 2rem; padding: 1rem; background: var(--bg-light); border-radius: 8px;">';
    html += `<strong>Total Sessions:</strong> ${client.sessions.length} | `;

    client.sessions.forEach(s => {
        if (s.amount) totalRevenue += parseFloat(s.amount);
        if (s.duration) totalDuration += parseInt(s.duration);
    });

    html += `<strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)} | `;
    html += `<strong>Total Time:</strong> ${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`;
    html += '</div>';

    sortedSessions.forEach(session => {
        html += `
            <div class="result-box" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                            <strong style="font-size: 1.1rem;">${new Date(session.date).toLocaleDateString()}</strong>
                            <span class="badge badge-success">${session.type}</span>
                        </div>
                        <p style="color: var(--text-light); margin: 0.5rem 0;">
                            Duration: ${session.duration} minutes
                            ${session.amount ? ` | Payment: $${session.amount}` : ''}
                        </p>
                        ${session.notes ? `<p style="margin-top: 0.5rem;">${session.notes}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function showAddSession() {
    setDefaultDate();
    document.getElementById('addSessionForm').style.display = 'block';
    document.getElementById('sessionDate').focus();
}

function cancelAddSession() {
    document.getElementById('addSessionForm').style.display = 'none';
    clearSessionForm();
}

function clearSessionForm() {
    setDefaultDate();
    document.getElementById('sessionType').value = 'reiki';
    document.getElementById('sessionDuration').value = '60';
    document.getElementById('sessionNotes').value = '';
    document.getElementById('sessionAmount').value = '';
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('sessionDate');
    if (dateInput) {
        dateInput.value = today;
    }
}

function saveSession() {
    if (!currentClientId) {
        alert('No client selected');
        return;
    }

    const client = clients.find(c => c.id === currentClientId);

    if (!client) {
        alert('Client not found');
        return;
    }

    const session = {
        id: generateId(),
        date: document.getElementById('sessionDate').value,
        type: document.getElementById('sessionType').value,
        duration: parseInt(document.getElementById('sessionDuration').value),
        notes: document.getElementById('sessionNotes').value.trim(),
        amount: document.getElementById('sessionAmount').value.trim(),
        createdAt: new Date().toISOString()
    };

    if (!client.sessions) {
        client.sessions = [];
    }

    client.sessions.push(session);
    saveClients();
    displayClients();
    displaySessionHistory(client);
    cancelAddSession();
}

function exportClientData() {
    if (!currentClientId) return;

    const client = clients.find(c => c.id === currentClientId);

    if (!client) return;

    let text = `CLIENT RECORD\n`;
    text += `${'='.repeat(60)}\n\n`;
    text += `Name: ${client.name}\n`;
    text += `Email: ${client.email || 'N/A'}\n`;
    text += `Phone: ${client.phone || 'N/A'}\n`;
    text += `Member Since: ${new Date(client.createdAt).toLocaleDateString()}\n\n`;

    if (client.notes) {
        text += `Notes: ${client.notes}\n\n`;
    }

    text += `SESSION HISTORY\n`;
    text += `${'-'.repeat(60)}\n\n`;

    if (client.sessions && client.sessions.length > 0) {
        client.sessions.forEach((session, index) => {
            text += `Session ${index + 1} - ${new Date(session.date).toLocaleDateString()}\n`;
            text += `Type: ${session.type}\n`;
            text += `Duration: ${session.duration} minutes\n`;
            if (session.amount) text += `Payment: $${session.amount}\n`;
            if (session.notes) text += `Notes: ${session.notes}\n`;
            text += `\n`;
        });
    } else {
        text += `No sessions recorded.\n\n`;
    }

    text += `${'='.repeat(60)}\n`;
    text += `Exported: ${new Date().toLocaleString()}\n`;

    // Download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-${client.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
