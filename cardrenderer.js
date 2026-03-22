window.songsList = [];

async function renderLibrary() {
    const library = document.getElementById('library');
    try {
        // Get the path to songs.json from the main process
        const songsPath = await window.electronAPI.getSongsPath();
        const res = await fetch(`file://${songsPath}`);
        const songs = await res.json();

        songsList = songs;
        library.innerHTML = "";

        songs.forEach((song, i) => {
            const card = document.createElement('div');
            card.className = 'song-card';

            const serial = document.createElement('span');
            serial.className = 'serial';
            serial.textContent = i + 1;

            const img = document.createElement('img');
            img.src = song.cover || "./music-logo.png";
            img.alt = song.title;

            const details = document.createElement('div');
            details.className = 'details';

            const title = document.createElement('p');
            title.textContent = song.title;

            const artist = document.createElement('p');
            artist.textContent = song.artist;

            details.appendChild(title);
            details.appendChild(artist);

            const time = document.createElement('span');
            time.className = 'time';

            let duration = Math.floor(song.duration);
            let m = Math.floor(duration / 60);
            let s = duration % 60;

            m = m < 10 ? '0' + m : m;
            s = s < 10 ? '0' + s : s;

            time.textContent = `${m}:${s}`;

            card.appendChild(serial);
            card.appendChild(img);
            card.appendChild(details);
            card.appendChild(time);

            card.addEventListener('click', () => {
                currentSong = i;
                loadSong(currentSong);                          // updates audio src, UI
                progress_time_ending.textContent = `${m}:${s}`; // update ending time
                audio.play();
            });

            library.appendChild(card);
        });

        // store lowercase title for search
        document.querySelectorAll('.song-card').forEach((card, index) => {
            card.dataset.title = songsList[index].title.toLowerCase();
        });

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            document.querySelectorAll('.song-card').forEach(card => {
                card.style.display = card.dataset.title.startsWith(query) ? '' : 'none';
            });
        });

    } catch (err) {
        console.error("Failed to load library:", err);
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function playSong(index, duration) {
    const audio = document.getElementById('audio');
    audio.src = `file://${encodeURI(songsList[index].file.replace(/\\/g, '/'))}`;
    audio.play();
    document.querySelector('.progress-time-ending').textContent = formatTime(duration);
}

window.renderLibrary = renderLibrary;
window.songsList = songsList;