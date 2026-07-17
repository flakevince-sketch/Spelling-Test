document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // ====== GAME SETTINGS & LEVELS ============
    // ==========================================

    const levels = [
        { name: "Easy", words: ["cat", "dog", "sun", "map", "red"] },
        { name: "Medium", words: ["apple", "house", "table", "chair", "mouse"] },
        { name: "Medium 2", words: ["purple", "bridge", "yellow", "orange", "window"] },
        { name: "Hard", words: ["beautiful", "tomorrow", "elephant", "umbrella", "language"] },
        { name: "Possible", words: ["definitely", "restaurant", "appreciate", "phenomenon", "mysterious"] },
        { name: "Impossible", words: ["onomatopoeia", "fuchsia", "chrysanthemum", "pharaoh", "rhythm"] },
        { name: "Bot", words: ["syzygy", "ptyalism", "houyhnhnm", "logorrhea", "chthonic"] },
        { name: "Strong Brain", words: ["sesquipedalian", "perspicacious", "schadenfreude", "myrmecophilous", "bourguignon"] },
        { name: "Godly", words: ["antidisestablishmentarianism", "pneumonoultramicroscopicsilicovolcanoconiosis", "hippopotomonstrosesquippedaliophobia", "floccinaucinihilipilification", "pseudopseudohypoparathyroidism"] }
    ];

    let currentLevelIndex = 0;
    let currentWordIndex = 0;
    let currentWord = "";
    let surpriseTriggered = false;
    let isTimedOut = false;
    let startTime;
    let timerInterval;
    let isTimerRunning = false;
    let ytPlayer;

    // HTML Elements
    const startScreen = document.getElementById("start-screen");
    const gameScreen = document.getElementById("game-screen");
    const startBtn = document.getElementById("start-btn");
    const levelDisplay = document.getElementById("level-display");
    const roundDisplay = document.getElementById("round-display");
    const timerDisplay = document.getElementById("timer");
    const listenBtn = document.getElementById("listen-btn");
    const wordInput = document.getElementById("word-input");
    const submitBtn = document.getElementById("submit-btn");
    const feedbackMsg = document.getElementById("feedback-msg");

    // ==========================================
    // ====== GAME LOGIC ========================
    // ==========================================

    startBtn.addEventListener("click", () => {
        startScreen.style.display = "none";
        gameScreen.style.display = "block";
        loadNextWord();
    });

    function loadNextWord() {
        // Trigger surprise at end of level 5 (index 4)
        if (currentLevelIndex === 5 && !surpriseTriggered) {
            triggerSurpriseEvent();
            return;
        }

        if (currentLevelIndex >= levels.length) {
            endGame();
            return;
        }

        isTimedOut = false;
        wordInput.placeholder = "Type spelling here...";
        levelDisplay.innerText = `Level: ${levels[currentLevelIndex].name}`;
        roundDisplay.innerText = `Word: ${currentWordIndex + 1} / 5`;
        currentWord = levels[currentLevelIndex].words[currentWordIndex];
        
        wordInput.value = "";
        feedbackMsg.classList.remove("show");
        timerDisplay.innerText = "0.0";
        isTimerRunning = false;
        wordInput.focus();

        speakWord();
    }

    function startTimer() {
        if (isTimerRunning) return; 
        isTimerRunning = true;
        startTime = Date.now();
        
        timerInterval = setInterval(() => {
            let elapsedTime = (Date.now() - startTime) / 1000;
            timerDisplay.innerText = elapsedTime.toFixed(1);

            if (elapsedTime >= 20.0) {
                stopTimer();
                handleTimeOut();
            }
        }, 100);
    }

    function handleTimeOut() {
        isTimedOut = true;
        timerDisplay.innerText = "20.0";
        wordInput.value = "";
        wordInput.placeholder = "Type 'Miss' to escape...";
        displayFeedback("Too slow! Type 'Miss'", "wrong");
        wordInput.focus();
    }

    function stopTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }

    function speakWord() {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(currentWord);
        utterance.rate = 0.85; 
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang.includes('en'));
        if (englishVoice) utterance.voice = englishVoice;
        window.speechSynthesis.speak(utterance);
        startTimer(); 
    }

    function displayFeedback(text, type) {
        feedbackMsg.innerText = text;
        feedbackMsg.className = type + " show";
    }

    function checkSpelling() {
        const playerGuess = wordInput.value.trim().toLowerCase();

        if (isTimedOut) {
            if (playerGuess === "miss") {
                triggerSurpriseEvent();
            } else {
                displayFeedback("Must type 'Miss'!", "wrong");
            }
            return;
        }

        const correctSpelling = currentWord.toLowerCase();
        if (playerGuess === "") return;

        if (playerGuess === correctSpelling) {
            stopTimer();
            displayFeedback("✅ Correct!", "correct");
            setTimeout(() => {
                currentWordIndex++;
                if (currentWordIndex >= 5) {
                    currentWordIndex = 0;
                    currentLevelIndex++;
                }
                loadNextWord(); 
            }, 1500);
        } else {
            displayFeedback("❌ Incorrect, keep trying!", "wrong");
            wordInput.value = ""; 
            wordInput.focus();
        }
    }

    function endGame() {
        levelDisplay.innerText = "Game Over!";
        roundDisplay.innerText = "You are a Spelling God!";
        wordInput.disabled = true;
        submitBtn.disabled = true;
        listenBtn.disabled = true;
        timerDisplay.innerText = "WIN";
        displayFeedback("Congratulations!", "correct");
    }

    // Event Listeners
    listenBtn.addEventListener("click", speakWord); 
    submitBtn.addEventListener("click", checkSpelling);
    wordInput.addEventListener("keypress", (e) => { if (e.key === "Enter") checkSpelling(); });

    // ==========================================
    // ====== SURPRISE EVENT (Clean) ============
    // ==========================================

    function triggerSurpriseEvent() {
        surpriseTriggered = true;
        stopTimer();
        gameScreen.style.display = "none";
        
        const style = document.createElement("style");
        style.innerHTML = `
            body { margin: 0; background: #000; color: white; font-family: 'Arial', sans-serif; overflow: hidden; }
            #surprise-screen { 
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                height: 100vh; width: 100vw; background: radial-gradient(circle, #222, #000); 
            }
            #surprise-title { 
                font-size: 4rem; font-weight: bold; letter-spacing: 5px; 
                text-shadow: 0 0 20px rgba(255,255,255,0.5);
            }
        `;
        document.head.appendChild(style);

        const screen = document.createElement("div");
        screen.id = "surprise-screen";
        
        const title = document.createElement("div");
        title.id = "surprise-title";
        title.innerText = "Leonora";
        
        screen.appendChild(title);
        document.body.appendChild(screen);

        const yt = document.createElement("div");
        yt.id = "yt-player";
        document.body.appendChild(yt);

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
            window.onYouTubeIframeAPIReady = initPlayer;
        } else { 
            initPlayer(); 
        }
    }

    function initPlayer() {
        ytPlayer = new YT.Player('yt-player', {
            height: '0', width: '0',
            videoId: 'T73x3GQA75g', 
            playerVars: { 'autoplay': 1, 'controls': 0, 'playsinline': 1 },
            events: { 'onReady': (e) => { e.target.playVideo(); } }
        });
    }
});