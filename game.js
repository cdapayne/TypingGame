// Game State
let currentLevel = 1;
let currentIndex = 0;
let correctKeys = 0;
let totalKeys = 0;
let startTime = null;
let levelData = [];
let userInputText = '';

// Level configurations with progressive difficulty
const levels = [
    // Levels 1-5: Home row keys (easy)
    {
        level: 1,
        description: "Home Row - Let's start with the basics!",
        text: "fff jjj fff jjj ddd kkk ddd kkk",
        difficulty: "easy"
    },
    {
        level: 2,
        description: "Home Row - More practice!",
        text: "aaa ;;; sss lll ddd kkk fff jjj",
        difficulty: "easy"
    },
    {
        level: 3,
        description: "Home Row - Mix it up!",
        text: "asdf jkl; asdf jkl; fdsa ;lkj",
        difficulty: "easy"
    },
    {
        level: 4,
        description: "Home Row Words!",
        text: "ask dad; dad asks; as dad; a lad",
        difficulty: "easy"
    },
    {
        level: 5,
        description: "Home Row Challenge!",
        text: "all lads; fall sad; a glass; ask all",
        difficulty: "easy"
    },
    
    // Levels 6-10: Adding top row (medium)
    {
        level: 6,
        description: "Top Row - New keys!",
        text: "rrr uuu rrr uuu ttt yyy ttt yyy",
        difficulty: "medium"
    },
    {
        level: 7,
        description: "Top Row Practice!",
        text: "qqq ppp www ooo eee iii rrr uuu",
        difficulty: "medium"
    },
    {
        level: 8,
        description: "Top and Home Rows!",
        text: "qwert yuiop asdfg hjkl; true quest",
        difficulty: "medium"
    },
    {
        level: 9,
        description: "Simple Words!",
        text: "the quick red toy will help you",
        difficulty: "medium"
    },
    {
        level: 10,
        description: "More Words!",
        text: "to do or not to do that is a quest",
        difficulty: "medium"
    },
    
    // Levels 11-15: Adding bottom row (harder)
    {
        level: 11,
        description: "Bottom Row - Let's go!",
        text: "zzz xxx ccc vvv bbb nnn mmm",
        difficulty: "hard"
    },
    {
        level: 12,
        description: "All Three Rows!",
        text: "zxcvbnm qwertyuiop asdfghjkl;",
        difficulty: "hard"
    },
    {
        level: 13,
        description: "Common Words!",
        text: "the quick brown fox jumps over lazy dog",
        difficulty: "hard"
    },
    {
        level: 14,
        description: "Sentences!",
        text: "can you type this sentence very fast now",
        difficulty: "hard"
    },
    {
        level: 15,
        description: "Longer Text!",
        text: "practice makes perfect when you try hard",
        difficulty: "hard"
    },
    
    // Levels 16-20: Numbers, symbols, and advanced (expert)
    {
        level: 16,
        description: "Adding Numbers!",
        text: "123 456 789 000 the year is 2024 today",
        difficulty: "expert"
    },
    {
        level: 17,
        description: "Numbers & Letters!",
        text: "call me at 555-1234 or email me today",
        difficulty: "expert"
    },
    {
        level: 18,
        description: "Punctuation Time!",
        text: "hello, world! how are you? i am fine.",
        difficulty: "expert"
    },
    {
        level: 19,
        description: "Mixed Challenge!",
        text: "type fast: abc 123, xyz 789! great job?",
        difficulty: "expert"
    },
    {
        level: 20,
        description: "Ultimate Challenge!",
        text: "the quick brown fox jumps over 13 lazy dogs! amazing work; you did it 100%!",
        difficulty: "expert"
    }
];

// Initialize the game
function init() {
    generateLevelButtons();
    showLevelSelection();
    loadStats();
}

// Generate level selection buttons
function generateLevelButtons() {
    const levelSelection = document.querySelector('#levelSelection .grid');
    levelSelection.innerHTML = '';
    
    levels.forEach(level => {
        const button = document.createElement('button');
        button.className = 'level-card bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition transform';
        
        const stats = getLevelStats(level.level);
        const completed = stats.completed;
        const bestAccuracy = stats.bestAccuracy || 0;
        
        let difficultyColor = 'bg-green-400';
        if (level.difficulty === 'medium') difficultyColor = 'bg-yellow-400';
        if (level.difficulty === 'hard') difficultyColor = 'bg-orange-400';
        if (level.difficulty === 'expert') difficultyColor = 'bg-red-400';
        
        button.innerHTML = `
            <div class="text-4xl font-bold text-purple-600 mb-2">Level ${level.level}</div>
            <div class="${difficultyColor} text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-2">
                ${level.difficulty.toUpperCase()}
            </div>
            ${completed ? '<div class="text-2xl mb-2">✅</div>' : '<div class="text-2xl mb-2">🔒</div>'}
            ${completed ? `<div class="text-sm text-gray-600">Best: ${bestAccuracy}%</div>` : ''}
        `;
        
        button.onclick = () => startLevel(level.level);
        levelSelection.appendChild(button);
    });
}

// Show level selection screen
function showLevelSelection() {
    document.getElementById('levelSelection').classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
}

// Start a specific level
function startLevel(levelNum) {
    currentLevel = levelNum;
    currentIndex = 0;
    correctKeys = 0;
    totalKeys = 0;
    startTime = null;
    userInputText = '';
    
    const level = levels[levelNum - 1];
    levelData = level.text.split('');
    
    document.getElementById('currentLevel').textContent = levelNum;
    document.getElementById('levelDescription').textContent = level.description;
    document.getElementById('total').textContent = levelData.length;
    document.getElementById('progress').textContent = 0;
    document.getElementById('accuracy').textContent = 100;
    document.getElementById('wpm').textContent = 0;
    document.getElementById('userInput').textContent = '';
    
    updateTextDisplay();
    updateProgressBar();
    
    document.getElementById('levelSelection').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    
    // Focus is not required for key detection, but helps indicate game is ready
}

// Update text display
function updateTextDisplay() {
    const targetText = document.getElementById('targetText');
    const nextText = document.getElementById('nextText');
    
    if (currentIndex < levelData.length) {
        targetText.textContent = levelData[currentIndex];
        
        // Show next 5 characters
        const upcoming = levelData.slice(currentIndex + 1, currentIndex + 6).join('');
        nextText.textContent = upcoming ? `Next: ${upcoming}` : '';
        
        // Highlight the corresponding key
        highlightKey(levelData[currentIndex]);
    } else {
        targetText.textContent = '';
        nextText.textContent = '';
    }
}

// Highlight key on virtual keyboard
function highlightKey(char) {
    // Remove previous highlights
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('active', 'bg-gradient-to-br');
        key.classList.add('bg-gradient-to-br');
    });
    
    // Highlight current key
    const key = document.querySelector(`[data-key="${char.toLowerCase()}"]`);
    if (key) {
        key.classList.add('active');
        key.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
        setTimeout(() => {
            key.style.boxShadow = '';
        }, 500);
    }
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    // Only process if game screen is visible
    if (document.getElementById('gameScreen').classList.contains('hidden')) {
        return;
    }
    
    // Prevent default for game keys
    if (e.key.length === 1 || e.key === ' ') {
        e.preventDefault();
    }
    
    // Start timer on first keypress
    if (startTime === null && currentIndex === 0) {
        startTime = Date.now();
    }
    
    if (currentIndex >= levelData.length) {
        return;
    }
    
    const expectedChar = levelData[currentIndex];
    const typedChar = e.key;
    
    totalKeys++;
    
    // Animate key press
    const key = document.querySelector(`[data-key="${typedChar.toLowerCase()}"]`);
    if (key) {
        key.classList.add('pressed');
        setTimeout(() => key.classList.remove('pressed'), 150);
    }
    
    if (typedChar === expectedChar) {
        // Correct key
        correctKeys++;
        currentIndex++;
        userInputText += typedChar;
        
        // Visual feedback
        document.getElementById('userInput').textContent = userInputText;
        document.getElementById('targetText').classList.add('bounce');
        setTimeout(() => {
            document.getElementById('targetText').classList.remove('bounce');
        }, 500);
        
        updateTextDisplay();
        updateStats();
        updateProgressBar();
        
        // Check if level complete
        if (currentIndex >= levelData.length) {
            completeLevel();
        }
    } else {
        // Wrong key - shake animation
        document.getElementById('targetText').classList.add('shake');
        setTimeout(() => {
            document.getElementById('targetText').classList.remove('shake');
        }, 300);
    }
});

// Update progress bar
function updateProgressBar() {
    const progress = (currentIndex / levelData.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progress').textContent = currentIndex;
}

// Update statistics
function updateStats() {
    const accuracy = totalKeys > 0 ? Math.round((correctKeys / totalKeys) * 100) : 100;
    document.getElementById('accuracy').textContent = accuracy;
    
    if (startTime && currentIndex > 0) {
        const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
        const words = currentIndex / 5; // Average word length
        const wpm = Math.round(words / elapsedMinutes);
        document.getElementById('wpm').textContent = wpm;
    }
}

// Complete level
function completeLevel() {
    const accuracy = totalKeys > 0 ? Math.round((correctKeys / totalKeys) * 100) : 100;
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const words = levelData.length / 5;
    const wpm = Math.round(words / elapsedMinutes);
    
    document.getElementById('finalAccuracy').textContent = accuracy;
    document.getElementById('finalWPM').textContent = wpm;
    
    // Save stats
    saveLevelStats(currentLevel, accuracy, wpm);
    
    // Show completion modal
    document.getElementById('levelCompleteModal').classList.remove('hidden');
    
    // Confetti effect (simple text animation)
    setTimeout(() => {
        // Could add more elaborate effects here
    }, 100);
}

// Next level
function nextLevel() {
    document.getElementById('levelCompleteModal').classList.add('hidden');
    
    if (currentLevel < levels.length) {
        startLevel(currentLevel + 1);
    } else {
        // Show completion modal instead of alert
        document.getElementById('finalAccuracy').textContent = '🎉';
        document.getElementById('finalWPM').textContent = 'All levels complete!';
        document.getElementById('levelCompleteModal').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('levelCompleteModal').classList.add('hidden');
            backToMenu();
        }, 3000);
    }
}

// Restart current level
function restartLevel() {
    startLevel(currentLevel);
}

// Skip to next level
function skipLevel() {
    // Use custom modal instead of confirm dialog for consistency
    if (currentLevel < levels.length) {
        startLevel(currentLevel + 1);
    }
}

// Back to menu
function backToMenu() {
    document.getElementById('levelCompleteModal').classList.add('hidden');
    generateLevelButtons(); // Refresh to show updated stats
    showLevelSelection();
}

// Statistics functions
function saveLevelStats(level, accuracy, wpm) {
    let stats = JSON.parse(localStorage.getItem('typingGameStats') || '{}');
    
    if (!stats[level]) {
        stats[level] = {
            completed: true,
            bestAccuracy: accuracy,
            bestWPM: wpm,
            attempts: 1
        };
    } else {
        stats[level].completed = true;
        stats[level].bestAccuracy = Math.max(stats[level].bestAccuracy, accuracy);
        stats[level].bestWPM = Math.max(stats[level].bestWPM, wpm);
        stats[level].attempts++;
    }
    
    localStorage.setItem('typingGameStats', JSON.stringify(stats));
}

function getLevelStats(level) {
    let stats = JSON.parse(localStorage.getItem('typingGameStats') || '{}');
    return stats[level] || { completed: false, bestAccuracy: 0, bestWPM: 0, attempts: 0 };
}

function showStats() {
    const statsContent = document.getElementById('statsContent');
    const stats = JSON.parse(localStorage.getItem('typingGameStats') || '{}');
    
    let totalCompleted = 0;
    let totalAccuracy = 0;
    let totalWPM = 0;
    let count = 0;
    
    for (let i = 1; i <= levels.length; i++) {
        const levelStat = stats[i];
        if (levelStat && levelStat.completed) {
            totalCompleted++;
            totalAccuracy += levelStat.bestAccuracy;
            totalWPM += levelStat.bestWPM;
            count++;
        }
    }
    
    const avgAccuracy = count > 0 ? Math.round(totalAccuracy / count) : 0;
    const avgWPM = count > 0 ? Math.round(totalWPM / count) : 0;
    
    statsContent.innerHTML = `
        <div class="bg-purple-100 p-6 rounded-xl">
            <div class="text-gray-600 mb-2">Levels Completed</div>
            <div class="text-5xl font-bold text-purple-600">${totalCompleted}/${levels.length}</div>
        </div>
        <div class="bg-green-100 p-6 rounded-xl">
            <div class="text-gray-600 mb-2">Avg Accuracy</div>
            <div class="text-5xl font-bold text-green-600">${avgAccuracy}%</div>
        </div>
        <div class="bg-blue-100 p-6 rounded-xl">
            <div class="text-gray-600 mb-2">Avg Speed</div>
            <div class="text-5xl font-bold text-blue-600">${avgWPM}</div>
        </div>
    `;
    
    document.getElementById('statsModal').classList.remove('hidden');
}

function closeStats() {
    document.getElementById('statsModal').classList.add('hidden');
}

// Initialize game on page load
window.onload = init;
