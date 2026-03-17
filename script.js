const audio = document.getElementById("audio")
const skip_back = document.getElementById("skip-back")
const play = document.getElementById("play")
const skip_forward = document.getElementById("skip-forward")
const artist_name = document.querySelector(".artist-name")
const song_name = document.querySelector(".song-name")
const playing_image = document.querySelector(".playing-image")
const play_svg = document.getElementById("play-svg")
const pause_svg = document.getElementById("pause-svg")

let currentSong = 0;
let songsList = []

if (currentSong == 0) {
    playing_image.src = "./music-logo.png";
}

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

skip_forward.addEventListener("click", function(){
    currentSong++;
    if (currentSong > songsList - 1) {
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
                time.textContent = song.durationStr || '0:00'

                card.appendChild(serial)
                card.appendChild(img)
                card.appendChild(details)
                card.appendChild(time)

                card.addEventListener('click', () => {
                    currentSong = i
                    loadSong(currentSong)
                    audio.play()
                })

                library.appendChild(card)
            })
        })
        .catch(err => console.error(err))
}

renderLibrary()