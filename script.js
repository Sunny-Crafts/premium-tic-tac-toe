const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');

// Screens
const homePage = document.getElementById('homePage');
const mainMenu = document.getElementById('mainMenu');
const nameInputScreen = document.getElementById('nameInputScreen');
const gameScreen = document.getElementById('gameScreen');
const dashboardScreen = document.getElementById('dashboardScreen');

// Menu Buttons & Inputs
const btnPvP = document.getElementById('btnPvP');
const btnPvC = document.getElementById('btnPvC');
const btnDashboard = document.getElementById('btnDashboard');
const homePlayBtn = document.getElementById('homePlayBtn');
const backFromGame = document.getElementById('backFromGame');
const backFromDash = document.getElementById('backFromDash');
const backFromName = document.getElementById('backFromName');
const backFromMenu = document.getElementById('backFromMenu');

const nameForm = document.getElementById('nameForm');
const playerXInput = document.getElementById('playerXName');
const playerOInput = document.getElementById('playerOName');
const playerOInputGroup = document.getElementById('playerOInputGroup');

// Game State
let currentPlayer = 'X';
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' or 'computer'

// Player Names
let playerXName = 'Player X';
let playerOName = 'Player O';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// --- Navigation ---
const showScreen = (screen) => {
    [homePage, mainMenu, nameInputScreen, gameScreen, dashboardScreen].forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    screen.classList.remove('hidden');
    screen.classList.add('active');
};

const initiateGameSetup = (mode) => {
    gameMode = mode;
    // Reset inputs
    playerXInput.value = '';
    playerOInput.value = '';

    if (mode === 'computer') {
        playerOInputGroup.style.display = 'none';
        playerOInput.removeAttribute('required');
    } else {
        playerOInputGroup.style.display = 'block';
        playerOInput.setAttribute('required', 'true');
    }

    showScreen(nameInputScreen);
};

const startGame = () => {
    // Set Names
    playerXName = playerXInput.value || 'Player X';

    if (gameMode === 'computer') {
        playerOName = 'AI Computer';
    } else {
        playerOName = playerOInput.value || 'Player O';
    }

    handleRestartGame();
    showScreen(gameScreen);
};

// --- Game Logic ---
const handleCellPlayed = (clickedCell, clickedCellIndex) => {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerText = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
};

const handlePlayerChange = () => {
    currentPlayer = currentPlayer === "X" ? "O" : "X";

    const currentName = currentPlayer === 'X' ? playerXName : playerOName;
    statusText.innerText = `${currentName}'s Turn`;

    if (gameMode === 'computer' && currentPlayer === 'O' && gameActive) {
        statusText.innerText = `AI is thinking...`;
        setTimeout(computerPlay, 800);
    }
}

const computerPlay = () => {
    const bestMove = getBestMove(gameState);
    if (bestMove !== null) {
        const cell = cells[bestMove];
        handleCellPlayed(cell, bestMove);
        handleResultValidation();
    }
};

const getBestMove = (board) => {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
};

const minimax = (board, depth, isMaximizing) => {
    const winner = checkWinnerForMinimax(board);
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (!board.includes("")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "X";
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
};

const checkWinnerForMinimax = (board) => {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};

const handleResultValidation = () => {
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i <= 7; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            winningLine = winCondition;
            break;
        }
    }

    if (roundWon) {
        const winnerName = currentPlayer === 'X' ? playerXName : playerOName;
        statusText.innerText = `Congratulations ${winnerName} Won!`;
        gameActive = false;
        highlightWinningCells(winningLine);
        saveGameResult(currentPlayer);
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusText.innerText = `Game Ended in a Draw!`;
        gameActive = false;
        saveGameResult('Draw');
        return;
    }

    handlePlayerChange();
};

const highlightWinningCells = (indices) => {
    indices.forEach(index => {
        cells[index].classList.add('winner');
    });
};

const handleCellClick = (clickedCellEvent) => {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
};

const handleRestartGame = () => {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusText.innerText = `${playerXName}'s Turn`;
    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove('x', 'o', 'winner');
    });
};

// --- Local Storage Integration (Replaces API) ---
const saveGameResult = (winner) => {
    try {
        const games = JSON.parse(localStorage.getItem('ttt_games') || '[]');
        const newGame = {
            id: Date.now(),
            mode: gameMode,
            winner,
            playerX: playerXName,
            playerO: playerOName,
            date: new Date()
        };
        games.push(newGame);

        // Keep only last 50
        const trimmedGames = games.slice(-50);
        localStorage.setItem('ttt_games', JSON.stringify(trimmedGames));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
};

const setProgress = (percent, circleId, textId) => {
    const circle = document.getElementById(circleId);
    const text = document.getElementById(textId);
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    const offset = circumference - (percent / 100 * circumference);
    circle.style.strokeDashoffset = offset;

    // Animate text
    let current = 0;
    const duration = 1500;
    const start = performance.now();

    const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const val = Math.floor(easeOut * percent);
        text.innerText = `${val}%`;

        if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
};

const loadDashboard = () => {
    showScreen(dashboardScreen);
    try {
        const games = JSON.parse(localStorage.getItem('ttt_games') || '[]');

        const total = games.length;
        const xWins = games.filter(g => g.winner === 'X').length;
        const oWins = games.filter(g => g.winner === 'O').length;
        const draws = games.filter(g => g.winner === 'Draw').length;
        const recentGames = [...games].reverse().slice(0, 5);

        const xRate = total > 0 ? Math.round((xWins / total) * 100) : 0;
        const oRate = total > 0 ? Math.round((oWins / total) * 100) : 0;

        // Update Labels with current session names
        const labelX = document.querySelector('.x-stat .stat-label');
        const labelO = document.querySelector('.o-stat .stat-label');
        if (labelX) labelX.innerText = `${playerXName} Wins`;
        if (labelO) labelO.innerText = `${playerOName} Wins`;

        document.getElementById('statTotal').innerText = total;
        document.getElementById('statX').innerText = xWins;
        document.getElementById('statO').innerText = oWins;
        document.getElementById('statDraw').innerText = draws;

        // Animate Rings
        setTimeout(() => {
            setProgress(xRate, 'progressX', 'percentX');
            setProgress(oRate, 'progressO', 'percentO');
        }, 300);

        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';

        recentGames.forEach((game, index) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.style.animationDelay = `${index * 0.1}s`;

            let winBadgeClass = 'win-draw';
            let statusText = 'Draw';
            if (game.winner === 'X') {
                winBadgeClass = 'win-x';
                statusText = 'X Wins';
            }
            if (game.winner === 'O') {
                winBadgeClass = 'win-o';
                statusText = 'O Wins';
            }

            // Format Names
            let matchTitle = 'Vs Computer';
            if (game.mode === 'pvp') {
                matchTitle = `${game.playerX || 'X'} vs ${game.playerO || 'O'}`;
            } else {
                matchTitle = `${game.playerX || 'You'} vs AI`;
            }

            const date = new Date(game.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            li.innerHTML = `
                <div class="match-info">
                    <span class="match-players">${matchTitle}</span>
                    <span class="match-date">${date}</span>
                </div>
                <span class="win-badge ${winBadgeClass}">${statusText}</span>
            `;
            historyList.appendChild(li);
        });

    } catch (error) {
        console.error('Failed to load stats:', error);
    }
};

// --- Routing (History API — clean /play/* URLs) ---
const routes = {
    '/': () => showScreen(homePage),
    '/play/menu': () => showScreen(mainMenu),
    '/play/duo': () => initiateGameSetup('pvp'),
    '/play/cyber': () => initiateGameSetup('computer'),
    '/play/stats': () => loadDashboard(),
    '/play/game': () => showScreen(gameScreen),
    '/play/setup': () => showScreen(nameInputScreen)
};

const navigate = (path) => {
    history.pushState({}, '', path);
    // Reset scroll and lock body when playing
    if (path !== '/') {
        window.scrollTo(0, 0);
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
    }
    router();
};

const router = () => {
    const path = window.location.pathname;

    // Sync body scroll class during population
    if (path === '/') {
        document.body.classList.remove('no-scroll');
    } else {
        document.body.classList.add('no-scroll');
    }

    const route = routes[path] || routes['/'];
    route();
};

// Handle browser back/forward buttons
window.addEventListener('popstate', router);
window.addEventListener('load', router);

// --- Event Listeners ---
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', handleRestartGame);

// Link buttons to clean path routes
homePlayBtn.addEventListener('click', () => navigate('/play/menu'));
btnPvP.addEventListener('click', () => navigate('/play/duo'));
btnPvC.addEventListener('click', () => navigate('/play/cyber'));
btnDashboard.addEventListener('click', () => navigate('/play/stats'));

nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    startGame();
    navigate('/play/game');
});

// Back buttons navigate home
backFromMenu.addEventListener('click', () => navigate('/'));
backFromName.addEventListener('click', () => navigate('/'));
backFromGame.addEventListener('click', () => navigate('/'));
backFromDash.addEventListener('click', () => navigate('/'));

// --- Navbar & Footer links ---
document.getElementById('navPlayBtn').addEventListener('click', (e) => { e.preventDefault(); navigate('/play/menu'); });
document.getElementById('navPlayLink').addEventListener('click', (e) => { e.preventDefault(); navigate('/play/menu'); });
document.getElementById('navStatsLink').addEventListener('click', (e) => { e.preventDefault(); navigate('/play/stats'); });

// --- Feature Info Popup Modal ---
const featureData = {
    ai: {
        icon: '🤖',
        title: 'Smart AI Opponent',
        desc: 'Face off against an artificial intelligence powered by the Minimax algorithm — the same logic used in competitive game engines. It evaluates every possible move to always play optimally.',
        bullets: [
            'Minimax algorithm with full game-tree search',
            'Unbeatable — AI never makes a mistake',
            'Responds instantly after your move'
        ]
    },
    stats: {
        icon: '📊',
        title: 'Stats Dashboard',
        desc: 'Your match history and win rates are saved directly to your browser so you can track your performance — no external database or account required.',
        bullets: [
            'X & O win-rate rings with animated counters',
            'Total matches, wins, and draw breakdown',
            'Recent match history with player names & dates'
        ]
    },
    multiplayer: {
        icon: '👥',
        title: 'Local Multiplayer',
        desc: 'Challenge a friend on the same device. Both players take turns on the same screen — no internet, no account, just pure head-to-head competition.',
        bullets: [
            'Custom player names for both X and O',
            'Turn-by-turn gameplay with status updates',
            'Winning cells highlighted at game end'
        ]
    }
};

const featureModal = document.getElementById('featureModal');
const featureModalClose = document.getElementById('featureModalClose');
const featureModalIcon = document.getElementById('featureModalIcon');
const featureModalTitle = document.getElementById('featureModalTitle');
const featureModalDesc = document.getElementById('featureModalDesc');
const featureModalList = document.getElementById('featureModalList');

const openFeatureModal = (key) => {
    const data = featureData[key];
    if (!data) return;

    // Populate content
    featureModalIcon.textContent = data.icon;
    featureModalTitle.textContent = data.title;
    featureModalDesc.textContent = data.desc;
    featureModalList.innerHTML = data.bullets
        .map(b => `<li>${b}</li>`)
        .join('');

    // Trigger animation re-run
    featureModalIcon.style.animation = 'none';
    void featureModalIcon.offsetWidth; // reflow
    featureModalIcon.style.animation = '';

    featureModal.setAttribute('aria-hidden', 'false');
    featureModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const closeFeatureModal = () => {
    featureModal.classList.remove('active');
    featureModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

// Open on each feature card click
document.querySelectorAll('.hf-item[data-feature]').forEach(item => {
    item.addEventListener('click', () => openFeatureModal(item.dataset.feature));
});

// Close via button or overlay click
featureModalClose.addEventListener('click', closeFeatureModal);
featureModal.addEventListener('click', (e) => {
    if (e.target === featureModal) closeFeatureModal();
});

// Close with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && featureModal.classList.contains('active')) {
        closeFeatureModal();
    }
});
