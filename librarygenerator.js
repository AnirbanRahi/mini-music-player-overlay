const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Helper to get files recursively
function getFilesRecursive(dir, allFiles = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFilesRecursive(name, allFiles);
        } else {
            // Added common formats: mp3, wav, flac, m4a, ogg
            if (/\.(mp3|wav|flac|m4a|ogg)$/i.test(name)) {
                allFiles.push(name);
            }
        }
    });
    return allFiles;
}

// Main function
async function generateLibrary(folderPath, outputDir) {
    if (!folderPath || !fs.existsSync(folderPath)) {
        console.error("Folder not found:", folderPath);
        return;
    }

    // const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".mp3"));
    const files = getFilesRecursive(folderPath);
    files.sort((a, b) => {
        const nameA = path.basename(a).toLowerCase();
        const nameB = path.basename(b).toLowerCase();
        return nameA.localeCompare(nameB);
    });
    const songs = [];

    for (let i = 0; i < files.length; i++) {
        // const filePath = path.join(folderPath, files[i]);
        const filePath = files[i];
        try {
            const metadata = await mm.parseFile(filePath, { native: true });

            let coverBase64 = null;
            if (metadata.common.picture && metadata.common.picture.length > 0) {
                const pic = metadata.common.picture[0];
                coverBase64 = `data:${pic.format};base64,${Buffer.from(pic.data).toString("base64")}`;
            }

            const durationSeconds = metadata.format.duration || 0;

            songs.push({
                // title: metadata.common.title || files[i].replace(".mp3", ""),
                title: metadata.common.title || path.basename(filePath, path.extname(filePath)),
                artist: metadata.common.artist || "Unknown",
                album: metadata.common.album || "Unknown",
                file: filePath.replace(/\\/g, "/"),
                cover: coverBase64,
                duration: durationSeconds,
                durationStr: formatDuration(durationSeconds),
                index: i
            });
        } catch (err) {
            console.warn(`Failed to read metadata for ${files[i]}: ${err.message}`);
        }
    }

    const outputFile = path.join(outputDir, "songs.json");
    fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2));
    console.log(`Library generated with ${songs.length} songs at ${outputFile}`);
}

module.exports = { generateLibrary };