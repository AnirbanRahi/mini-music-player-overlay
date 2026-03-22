const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Main function
async function generateLibrary(folderPath, outputDir) {
    if (!folderPath || !fs.existsSync(folderPath)) {
        console.error("Folder not found:", folderPath);
        return;
    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".mp3"));
    const songs = [];

    for (let i = 0; i < files.length; i++) {
        const filePath = path.join(folderPath, files[i]);
        try {
            const metadata = await mm.parseFile(filePath, { native: true });

            let coverBase64 = null;
            if (metadata.common.picture && metadata.common.picture.length > 0) {
                const pic = metadata.common.picture[0];
                coverBase64 = `data:${pic.format};base64,${Buffer.from(pic.data).toString("base64")}`;
            }

            const durationSeconds = metadata.format.duration || 0;

            songs.push({
                title: metadata.common.title || files[i].replace(".mp3", ""),
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