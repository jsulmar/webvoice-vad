import webVoiceSDK from '../../src/webvoicesdk.js'


const VADHandler = function (speakingEvent) {
    speakingEvent.detail ? (document.getElementById("VADLed").classList.add("led-red"), document.getElementById("VADLed").classList.remove("led-green")) : (document.getElementById("VADLed").classList.add("led-green"), document.getElementById("VADLed").classList.remove("led-red"))
}

window.start = async function () {
    const micOptions = JSON.parse(document.getElementById('mic').value);
    window.mic = new webVoiceSDK.Mic({ ...micOptions, onAudioFrame: logFrameData });
    window.vad = new webVoiceSDK.Vad(JSON.parse(document.getElementById('VAD').value));
    await mic.start();
    await vad.start(mic);
    document.getElementById("VADLed").setAttribute('style', 'display:inline-block;');
    vad.addEventListener("speakingStatus", VADHandler);
}

window.stop = async function () {
    await window.vad.stop();
    window.mic.stop();
    document.getElementById("VADLed").setAttribute('style', 'display:none;');
    vad.removeEventListener("speakingStatus", VADHandler);
}

// HTML Interface
document.getElementById('mic').value = JSON.stringify(webVoiceSDK.Mic.defaultOptions, false, 4);
document.getElementById('VAD').value = JSON.stringify(webVoiceSDK.Vad.defaultOptions, false, 4);
document.getElementById("start").onclick = async () => {
    start();
}
document.getElementById("stop").onclick = async () => {
    stop();
}

// periodically log average frame data
window.frameLogInterval = 0;
window.frameSmoothedData = 0.0;
function logFrameData( buff ){
    var i;
    var sum = 0.0;
    for (i = 0; i < buff.length; ++i) {
        sum += buff[i] * buff[i];
    }
    window.frameSmoothedData = (0.95 * window.frameSmoothedData + 0.05 * sum);
    if ( !(++window.frameLogInterval % 10) ) {
        const sample = document.getElementById("sample");
        sample.innerText = window.frameSmoothedData.toFixed(2); 
        console.log( window.frameSmoothedData.toFixed(2));
    }
}

