# Musiclay 
Musiclay is a lightweight desktop overlay music player built with HTML, CSS JavaScript and Electron. It appears on top of all windows when hotkey is pressed and hides automatically when clicked outside. It provides quick access to music collection without cluttering workspace.

# Demo
![Musiclay Overlay Demo](assets/demo.gif)

# Key Feature
- **On-Demand Overlay:** Appears when the assigned global hotkey is pressed and hides when clicking outside.
- **Audio Support:** MP3, WAV, FLAC, M4A, OGG
- **Playback Controls:** Play, pause, skip forward/back
- **Volume Control with slider**
- **Dynamic Library:** Add folders, auto-scan subfolders, album art included
- **Search Songs:** Filter library by title
- **Global Hotkey:** Trigger overlay from anywhere
- **Auto-Play Next Song:** Continuous playback
- **System Tray Support:** Runs in tray after launch for quick access

# Installation & Setup
- **Download the Installer**
    - [Musiclay v1.0.0 for Windows](https://github.com/AnirbanRahi/mini-music-player-overlay/releases/tag/v1.0.0)
    - This is a full installer that will guide you through installation on your system.
- **Run the Installer**
    - Double-click the downloaded `.exe` file.
    - Follow the on-screen prompts to install Musiclay in your preferred directory.
    - Once installed, Musiclay will automatically add a shortcut and can run from your Start menu or desktop.
- **Launch Musiclay**
    - After installation, Musiclay will start in the system tray by default.
    - Press your assigned global hotkey (e.g., Ctrl+Alt+M) to show the overlay.
    - Click outside the overlay to hide it automatically.
- **Configure Hotkey**
    - Open the Musiclay window.
    - Click **Edit** in settings to assign a preferred hotkey.
    - Pressing this hotkey toggles the overlay on-demand from anywhere.


# Usage
- **Trigger Overlay**
    - Press your global hotkey (by default **Control+Alt+M** ) to show Musiclay.
    - Click outside the window to hide it automatically.
- **System Tray**
    - After launching, Musiclay runs in the system tray.
    - Right-click the tray icon to:
        - **Show/Hide** the overlay manually.
        - **Quit** the application completely.
- **Add Music Folders**
    - Click the folder icon to select a directory containing audio files.
    - Musiclay scans recursively and generates songs.json.
- **Playback Controls**
    - Play/Pause: Large center button
    - Skip Forward/Back: Navigate songs
    - Progress Bar: Drag to jump
    - Volume Slider: Adjust volume
- **Search & Library**
    - Type in the search box to filter songs instantly.
    - Click a song card to play it immediately.

# Project Structure
```text
Musiclay/
├─ assets/               # Images, logos, demo GIF/video
│   ├─ music-logo.png
│   └─ demo.gif
├─ style.css             # Styling for overlay and library UI
├─ script.js             # Core playback logic and audio handling
├─ cardrenderer.js       # Dynamically renders the music library cards
├─ settings.js           # Hotkey assignment and overlay toggle logic
├─ main.js               # Electron main process, window creation
├─ preload.js            # Preload script for secure IPC between renderer & main
├─ songs.json            # Generated library metadata (song list)
├─ package.json          # Project configuration and dependencies
└─ README.md             # Project documentation
```


# Development Notes
- Overlay toggle behavior implemented via Electron always-on-top window combined with click-outside detection.
- Uses music-metadata to read audio metadata & album art.
- Supports nested directories for music collections.
- Hotkeys handled securely via Electron IPC.
- UI is responsive, minimal, and optimized for a temporary overlay window.
- Runs in system tray after launch for minimal distraction.

# ⚠️ Limitations 
- When hotkey pressed, the taskbar also appears along with overlay.
- Some applications or games (e.g., GTA5) may prevent Musiclay overlay from appearing.

# ⚠️ Disclaimer
- Bugs may exist as this is an early/personal project.
- Many parts of this project were assisted by AI for learning and implementation.
- The focus is on learning and experimenting, not production-ready software.