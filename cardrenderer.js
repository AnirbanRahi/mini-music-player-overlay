window.songsList = [];

async function renderLibrary() {
    const library = document.getElementById('library');
    try {
        const songsPath = await window.electronAPI.getSongsPath();
        const res = await fetch(`file://${songsPath}`);
        const songs = await res.json();

        songsList = songs;
        library.innerHTML = "";

        songs.forEach((song, i) => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.dataset.title = song.title.toLowerCase();

            card.innerHTML = `
                <span class="serial">${i + 1}</span>
                <img src="${song.cover || './music-logo.png'}" alt="${song.title}">
                <div class="details">
                    <p>${song.title}</p>
                    <p>${song.artist}</p>
                </div>
                <span class="time">${formatTime(song.duration)}</span>
            `;

            card.addEventListener('click', () => playSong(i, song.duration));
            library.appendChild(card);
        });

        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            document.querySelectorAll('.song-card').forEach(card => {
                card.style.display = card.dataset.title.startsWith(query) ? '' : 'none';
            });
        });

    } catch (err) {
        console.error(err);
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