const audio = document.getElementById("audio")
const shuffle = document.getElementById("shuffle")
const skip_back = document.getElementById("skip-back")
const play = document.getElementById("play")
const skip_forward = document.getElementById("skip-forward")
const repeat = document.getElementById("repeat")
const artist_name = document.querySelector(".artist-name")
const song_name = document.querySelector(".song-name")
const playing_image = document.querySelector(".playing-image")
const play_svg = play.getElementById("play-svg")
const pause_svg = play.getElementById("pause-svg")

const songs = [
    "resources/A Horse With No Name.mp3",
    "resources/Bad Liar.mp3",
    "resources/A Thousand Miles.mp3",
    "resources/A Thousand Years.mp3",
    "resources/After Dark x Sweater Weather.mp3",
    "resources/Agora hills.mp3",
    "resources/All The Stars.mp3",
    "resources/Arrival To Earth.mp3",
    "resources/As It Was.mp3",
    "resources/Baby.mp3"

]

let currentSong = 0;
let isPlaying = false;


function loadSong(index) {
    audio.src = songs[index]
}

loadSong(currentSong)

play.onclick = function () {
    if (audio.paused) {
        audio.play();
        play_svg.style.display = "none";
        pause_svg.style.display = "block"

    } else {
        audio.pause();
        play_svg.style.display = "block";
        pause_svg.style.display = "none"
    }
}

skip_forward.onclick = function () {
    currentSong++;
    if (currentSong >= songs.length) {
        currentSong = 0
    }
    loadSong(currentSong)
    audio.play()
}

skip_back.onclick = function () {
    currentSong--
    if (currentSong < 0) {
        currentSong = songs.length - 1
    }
    loadSong(currentSong)
    audio.play()

}





