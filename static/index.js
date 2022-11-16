"use strict";

const noteLookup = {
    "c": 0,
    "c#": 1,
    "d": 2,
    "d#": 3,
    "e": 4,
    "f": 5,
    "f#": 6,
    "g": 7,
    "g#": 8,
    "a": 9,
    "a#": 10,
    "b": 11,
};

function parse(text) {
    const lines = text.split("\n");
    let parts = [];
    lines.forEach((line) => {
        const uncommented = line.split("%")[0];
        let octave = 1;
        let fraction = 4;
        let dot = false;
        uncommented.split(/\s/).forEach((part) => {
            if (!part) return;
            if (part[0] == "\\") return; // Skip the stuff we don't understand
            const m = part.match(/([a-g]#?)(\d+)?(?:\/(\d+))?(\.)?/);
            if (!m) {
                console.log("Not a valid note", part);
                return;
            }
            const noteText = m[1];
            octave = m[2] || octave;
            fraction = m[3] || fraction;
            dot = (typeof(m[4]) != "undefined"); // Supposed to roll over, ignore that shit
            const duration = 1000 * (1.0 / fraction) * (1.0 + (dot * 0.5));
            const note = noteLookup[noteText] + 12*octave; // In ms
            const pitch = 440.0*Math.pow(2, (note-9-12)/12.0); // In Hz
            parts.push([pitch, duration]);
        });
    });
    return parts;
}

let audioCtx = new(window.AudioContext || window.webkitAudioContext)();
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
async function playNote(frequencyHz, durationMs) {
    var oscillator = audioCtx.createOscillator();

    oscillator.type = 'square';
    oscillator.frequency.value = frequencyHz;
    oscillator.connect(audioCtx.destination);
    oscillator.start()

    await timeout(durationMs);
    oscillator.stop();
}
async function play(song) {
    for (let i=0; i<song.length; i++) {
        await playNote(song[i][0], song[i][1]);
    }
}

window.onload = () => {
    $(".play").on("click", () => {
        const text = $(".song").text();
        const song = parse(text);
        $(".debug").text(song);
        play(song);
    });
};
