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

let currentSong = 0;
let songsList = []

function loadSong(index) {
    const song = songsList[index]
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

play.addEventListener("click", function () {
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

function renderLibrary() {
    const library = document.getElementById('library')

    fetch('songs.json')
        .then(res => res.json())
        .then(songs => {
            songsList = songs
            library.innerHTML = ""

            songs.forEach((song, i) => {
                const card = document.createElement('div')
                card.className = 'song-card'

                const serial = document.createElement('span')
                serial.className = 'serial'
                serial.textContent = i + 1

                const img = document.createElement('img')
                img.src = song.cover || "./music-logo.png"
                img.alt = song.title

                const details = document.createElement('div')
                details.className = 'details'

                const title = document.createElement('p')
                title.textContent = song.title

                const artist = document.createElement('p')
                artist.textContent = song.artist

                details.appendChild(title)
                details.appendChild(artist)

                const time = document.createElement('span')
                time.className = 'time'

                let duration = Math.floor(song.duration);
                let m = Math.floor(duration / 60);
                let s = duration % 60;

                m = m < 10 ? '0' + m : m;
                s = s < 10 ? '0' + s : s;

                time.textContent = `${m}:${s}`

                card.appendChild(serial)
                card.appendChild(img)
                card.appendChild(details)
                card.appendChild(time)

                card.addEventListener('click', () => {
                    currentSong = i
                    loadSong(currentSong)
                    progress_time_ending.textContent = `${m}:${s}`
                    audio.play()
                })

                library.appendChild(card)
            })

            document.querySelectorAll('.song-card').forEach((card, index) => {
                card.dataset.title = songsList[index].title.toLowerCase();
            });

            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                document.querySelectorAll('.song-card').forEach(card => {
                    card.style.display = card.dataset.title.startsWith(query) ? '' : 'none';
                });
            });


        })
        .catch(err => console.error(err))
}

renderLibrary()