// Chakra and hand position data
const chakraPositions = [
    {
        name: "Crown Chakra",
        color: "#9400d3",
        description: "Top of head - Connection to divine, spiritual awareness",
        duration: 5
    },
    {
        name: "Third Eye",
        color: "#4b0082",
        description: "Forehead - Intuition, insight, wisdom",
        duration: 5
    },
    {
        name: "Throat Chakra",
        color: "#4169e1",
        description: "Throat - Communication, self-expression",
        duration: 5
    },
    {
        name: "Heart Chakra",
        color: "#00ff00",
        description: "Center of chest - Love, compassion, emotional balance",
        duration: 5
    },
    {
        name: "Solar Plexus",
        color: "#ffd700",
        description: "Upper abdomen - Personal power, confidence",
        duration: 5
    },
    {
        name: "Sacral Chakra",
        color: "#ff8c00",
        description: "Lower abdomen - Creativity, sexuality, emotions",
        duration: 5
    },
    {
        name: "Root Chakra",
        color: "#dc143c",
        description: "Base of spine - Grounding, security, survival",
        duration: 5
    }
];

const handPositions = {
    full: [
        { name: "Crown", description: "Hands on top of head", duration: 5 },
        { name: "Eyes", description: "Hands over eyes", duration: 5 },
        { name: "Temples", description: "Hands on temples", duration: 3 },
        { name: "Throat", description: "Hands on throat", duration: 5 },
        { name: "Heart", description: "Hands on chest", duration: 5 },
        { name: "Solar Plexus", description: "Hands on upper abdomen", duration: 5 },
        { name: "Sacral", description: "Hands on lower abdomen", duration: 5 },
        { name: "Root", description: "Hands near base of spine", duration: 5 },
        { name: "Knees", description: "Hands on knees", duration: 3 },
        { name: "Feet", description: "Hands on feet", duration: 5 }
    ],
    chakra: chakraPositions,
    quick: [
        { name: "Head", description: "Crown and third eye", duration: 5 },
        { name: "Heart", description: "Heart chakra", duration: 5 },
        { name: "Solar Plexus", description: "Solar plexus chakra", duration: 5 },
        { name: "Root", description: "Root chakra", duration: 5 }
    ]
};

// Session state
let sessionState = {
    active: false,
    paused: false,
    currentPosition: 0,
    positions: [],
    startTime: null,
    totalTime: 0,
    positionStartTime: null,
    timerInterval: null,
    clientName: '',
    sessionType: 'full',
    positionLogs: []
};

function updateSessionType() {
    const type = document.getElementById('sessionType').value;
    const customGroup = document.getElementById('customDurationGroup');

    if (type === 'custom') {
        customGroup.style.display = 'block';
    } else {
        customGroup.style.display = 'none';
    }
}

function startSession() {
    const sessionType = document.getElementById('sessionType').value;
    const clientName = document.getElementById('clientName').value.trim();

    // Set up positions
    if (sessionType === 'custom') {
        const duration = parseInt(document.getElementById('customDuration').value) || 5;
        sessionState.positions = chakraPositions.map(p => ({ ...p, duration }));
    } else {
        sessionState.positions = handPositions[sessionType] || handPositions.full;
    }

    sessionState.active = true;
    sessionState.paused = false;
    sessionState.currentPosition = 0;
    sessionState.startTime = Date.now();
    sessionState.positionStartTime = Date.now();
    sessionState.clientName = clientName;
    sessionState.sessionType = sessionType;
    sessionState.positionLogs = [];

    // Update UI
    document.getElementById('sessionActive').style.display = 'block';
    document.getElementById('sessionComplete').style.display = 'none';
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;

    // Start timer
    updateTimer();
    sessionState.timerInterval = setInterval(updateTimer, 1000);

    // Display positions
    displayPositions();
    updateCurrentPosition();

    // Play gentle chime sound (optional - would need audio file)
    playChime();
}

function pauseSession() {
    if (sessionState.paused) {
        // Resume
        sessionState.paused = false;
        sessionState.positionStartTime = Date.now();
        sessionState.timerInterval = setInterval(updateTimer, 1000);
        document.getElementById('pauseBtn').textContent = 'Pause';
    } else {
        // Pause
        sessionState.paused = true;
        clearInterval(sessionState.timerInterval);
        document.getElementById('pauseBtn').textContent = 'Resume';
    }
}

function stopSession() {
    if (!confirm('Are you sure you want to end this session?')) {
        return;
    }

    sessionState.active = false;
    clearInterval(sessionState.timerInterval);

    // Log final position
    logPosition();

    // Calculate total time
    sessionState.totalTime = Math.floor((Date.now() - sessionState.startTime) / 1000);

    // Show completion
    showSessionComplete();
}

function nextPosition() {
    if (sessionState.currentPosition < sessionState.positions.length - 1) {
        logPosition();
        sessionState.currentPosition++;
        sessionState.positionStartTime = Date.now();
        updateCurrentPosition();
        playChime();
    } else {
        // Session complete
        stopSession();
    }
}

function previousPosition() {
    if (sessionState.currentPosition > 0) {
        sessionState.currentPosition--;
        sessionState.positionStartTime = Date.now();
        updateCurrentPosition();
    }
}

function updateTimer() {
    if (sessionState.paused) return;

    const elapsed = Math.floor((Date.now() - sessionState.positionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    document.getElementById('timer').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Auto-advance if time is up (optional - can be enabled)
    const currentPos = sessionState.positions[sessionState.currentPosition];
    if (currentPos && elapsed >= currentPos.duration * 60) {
        // Visual/audio notification that time is up
        document.getElementById('timer').style.color = 'var(--success-color)';
    }
}

function updateCurrentPosition() {
    const position = sessionState.positions[sessionState.currentPosition];

    if (!position) return;

    document.getElementById('currentPosition').textContent = position.name;
    document.getElementById('positionDescription').textContent =
        position.description || `Duration: ${position.duration} minutes`;

    // Reset timer color
    document.getElementById('timer').style.color = 'var(--primary-color)';

    // Update progress display
    displayPositions();
}

function displayPositions() {
    const grid = document.getElementById('chakraGrid');
    grid.innerHTML = '';

    sessionState.positions.forEach((position, index) => {
        const item = document.createElement('div');
        item.className = 'chakra-item';

        if (index === sessionState.currentPosition) {
            item.classList.add('active');
        }

        if (index < sessionState.currentPosition) {
            item.style.opacity = '0.6';
        }

        const borderColor = position.color || 'var(--primary-color)';
        item.style.borderLeftColor = borderColor;

        item.innerHTML = `
            ${position.color ? `<div class="chakra-color" style="background: ${position.color};"></div>` : ''}
            <div style="flex: 1;">
                <strong>${position.name}</strong>
                <div style="font-size: 0.875rem; color: var(--text-light);">
                    ${position.description || ''} (${position.duration} min)
                </div>
            </div>
            ${index === sessionState.currentPosition ? '<span style="color: var(--success-color);">● Active</span>' : ''}
            ${index < sessionState.currentPosition ? '<span style="color: var(--text-light);">✓ Complete</span>' : ''}
        `;

        grid.appendChild(item);
    });
}

function logPosition() {
    const position = sessionState.positions[sessionState.currentPosition];
    const timeSpent = Math.floor((Date.now() - sessionState.positionStartTime) / 1000);

    sessionState.positionLogs.push({
        position: position.name,
        timeSpent,
        timestamp: new Date().toISOString()
    });
}

function showSessionComplete() {
    document.getElementById('sessionActive').style.display = 'none';
    document.getElementById('sessionComplete').style.display = 'block';

    const totalMinutes = Math.floor(sessionState.totalTime / 60);
    const totalSeconds = sessionState.totalTime % 60;

    const summary = `
        <p><strong>Client:</strong> ${sessionState.clientName || 'Not specified'}</p>
        <p><strong>Session Type:</strong> ${sessionState.sessionType}</p>
        <p><strong>Total Duration:</strong> ${totalMinutes}m ${totalSeconds}s</p>
        <p><strong>Positions Completed:</strong> ${sessionState.positionLogs.length}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    `;

    document.getElementById('sessionSummary').innerHTML = summary;
}

function saveSession() {
    const session = {
        clientName: sessionState.clientName,
        sessionType: sessionState.sessionType,
        totalTime: sessionState.totalTime,
        positions: sessionState.positionLogs,
        date: new Date().toISOString()
    };

    // Get existing sessions
    let sessions = JSON.parse(localStorage.getItem('reikiSessions')) || [];
    sessions.push(session);
    localStorage.setItem('reikiSessions', JSON.stringify(sessions));

    alert('Session saved successfully!');
    resetSession();
}

function resetSession() {
    sessionState = {
        active: false,
        paused: false,
        currentPosition: 0,
        positions: [],
        startTime: null,
        totalTime: 0,
        positionStartTime: null,
        timerInterval: null,
        clientName: '',
        sessionType: 'full',
        positionLogs: []
    };

    document.getElementById('sessionActive').style.display = 'none';
    document.getElementById('sessionComplete').style.display = 'none';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('clientName').value = '';
    document.getElementById('timer').textContent = '00:00';
}

function playChime() {
    // Optional: Play a gentle chime sound
    // This would require an audio file
    // const audio = new Audio('chime.mp3');
    // audio.play();
}

// Handle page visibility to pause/resume timer
document.addEventListener('visibilitychange', () => {
    if (document.hidden && sessionState.active && !sessionState.paused) {
        // Optionally pause when tab is hidden
        // pauseSession();
    }
});
