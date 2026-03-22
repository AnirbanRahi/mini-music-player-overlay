const audio = document.getElementById("audio")
const skip_back = document.getElementById("skip-back")
const play = document.getElementById("play")
const skip_forward = document.getElementById("skip-forward")
const artist_name = document.querySelector(".artist-name")
const song_name = document.querySelector(".song-name")
const playing_image = document.querySelector(".playing-image")
const play_svg = document.getElementById("play-svg")
const pause_svg = document.getElementById("pause-svg")
const progress = document.getElementById("progress")
const progress_time = document.querySelector('.progress-time');
const progress_time_ending = document.querySelector('.progress-time-ending');
const volume = document.getElementById("volume-level")
const searchInput = document.getElementById('search-input');
const refreshBtn = document.getElementById("refresh");

window.currentSong = 0;

function loadSong(index) {
    const song = window.songsList[index];
    if (!song) return
    audio.src = `file://${encodeURI(song.file.replace(/\\/g, '/'))}`
    song_name.textContent = song.title
    artist_name.textContent = song.artist
    playing_image.src = song.cover || "./music-logo.png"
    play_svg.style.display = "none"
    pause_svg.style.display = "block"
}

audio.addEventListener('loadedmetadata', () => {
    progress.max = audio.duration;
});

audio.addEventListener('ended', () => {
    currentSong++;
    if (currentSong >= songsList.length) {
        currentSong = 0;
    }
    loadSong(currentSong);
    audio.play();
});

play.addEventListener("click", function (e) {
    if (songsList.length === 0) {
        play_svg.style.display = "block";
        pause_svg.style.display = "none";
        return;
    }
    if (audio.paused) {
        if (!audio.src && songsList.length > 0) {
            currentSong = 0
            loadSong(currentSong)
            audio.play()
        } else {
            audio.play()
            play_svg.style.display = "none"
            pause_svg.style.display = "block"
        }
    } else {
        audio.pause()
        play_svg.style.display = "block"
        pause_svg.style.display = "none"
    }
});

skip_forward.addEventListener("click", function () {
    currentSong++;
    if (currentSong > songsList.length - 1) {
        currentSong = 0;
    }
    loadSong(currentSong);
    audio.play();
});

skip_back.addEventListener("click", function () {
    currentSong--;
    if (currentSong < 0) {
        currentSong = songsList.length - 1;
    }
    loadSong(currentSong);
    audio.play();
});

audio.addEventListener('timeupdate', () => {
    progress.value = audio.currentTime;

    let minutes = Math.floor(audio.currentTime / 60);
    let seconds = Math.floor(audio.currentTime % 60);
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;

    progress_time.textContent = `${minutes}:${seconds}`;
});

progress.oninput = function () {
    audio.play();
    audio.currentTime = progress.value;
    play_svg.style.display = "none"
    pause_svg.style.display = "block"
}

volume.oninput = () => {
    audio.volume = Number(volume.value);
};

refreshBtn.addEventListener("click", () => {
    window.electronAPI.reloadWindow();
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.renderLibrary) {
            await window.renderLibrary();
        }
    } catch (err) {
        console.error("Library could not be loaded at startup:", err);
    }
});



const display = document.getElementById('hotkey-display');
const button = document.getElementById('hotkey-button');

let editing = false;
let currentHotkey = "";

// Load current hotkey
async function loadHotkey() {
    const hotkey = await window.electronAPI.getHotkey();
    display.value = hotkey;
}

// 🔥 Capture key combo in real time
display.addEventListener('keydown', (e) => {
    if (!editing) return;

    e.preventDefault(); // stop typing letters

    const keys = [];

    if (e.ctrlKey) keys.push('Control');
    if (e.shiftKey) keys.push('Shift');
    if (e.altKey) keys.push('Alt');
    if (e.metaKey) keys.push('Command');

    // Add main key (ignore pure modifiers)
    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        keys.push(keyName);
    }

    currentHotkey = keys.join('+');
    display.value = currentHotkey; // 🔥 real-time update
});

// Button logic (Change ↔ OK)
button.addEventListener('click', async () => {
    if (!editing) {
        // Start editing
        display.value = "";
        display.placeholder = "Press keys...";
        display.readOnly = false;
        display.focus();
        button.textContent = "OK";
        editing = true;
    } else {
        // Save hotkey
        const newHotkey = currentHotkey || display.value.trim();

        if (newHotkey) {
            try {
                const registered = await window.electronAPI.updateHotkey(newHotkey);
                display.value = registered;
            } catch (err) {
                alert("Failed to register hotkey. Use something like Ctrl+Alt+M");
                display.value = await window.electronAPI.getHotkey();
            }
        } else {
            display.value = await window.electronAPI.getHotkey();
        }

        display.readOnly = true;
        button.textContent = "Change Hk";
        editing = false;
        currentHotkey = "";
    }
});

loadHotkey();