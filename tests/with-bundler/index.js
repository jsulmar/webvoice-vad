import webVoiceSDK from '../../src/webvoicesdk.js'

const VADHandler = function (speakingEvent) {
    speakingEvent.detail ? (document.getElementById("LED-1").classList.add("led-red"), document.getElementById("LED-1").classList.remove("led-green")) : (document.getElementById("LED-1").classList.add("led-green"), document.getElementById("LED-1").classList.remove("led-red"))
}

// start processing microphone
window.start = async function () {
    const micOptions = JSON.parse(document.getElementById('mic-args').value);

    if (useStream){
        const source = await getSource(micOptions);
        window.src = new webVoiceSDK.Src({ source, onAudioFrame: logFrameData,  })
    } else {
        window.src = new webVoiceSDK.Mic({ ...micOptions, onAudioFrame: logFrameData });
    }
    window.vad = new webVoiceSDK.Vad(JSON.parse(document.getElementById('vad-args').value));

    await src.start();
    await vad.start(src);
    document.getElementById("LED-1").setAttribute('style', 'display:inline-block;');
    document.getElementById("sample").classList.remove("hidden-text");

    vad.addEventListener("speakingStatus", VADHandler);
    streamOptionControlDisable(true);
}

window.stop = async function () {
    await window.vad.stop();
    window.src.stop();
    document.getElementById("LED-1").setAttribute('style', 'display:none;');
    document.getElementById("sample").classList.add("hidden-text");
    vad.removeEventListener("speakingStatus", VADHandler);
    streamOptionControlDisable(false);
}

const streamOptionControlDisable = dis => {
    document.getElementById('use-stream').disabled = dis;
    dis
        ? document.getElementById('use-stream-label').classList.add("disabled-text")
        : document.getElementById('use-stream-label').classList.remove("disabled-text")
}

// Initialize default settings (textarea)
document.getElementById('mic-args').value = JSON.stringify(webVoiceSDK.Mic.defaultOptions, false, 4);
document.getElementById('vad-args').value = JSON.stringify(webVoiceSDK.Vad.defaultOptions, false, 4);

// button handlers
document.getElementById("start").onclick = async () => { start(); }
document.getElementById("stop").onclick = async () => { stop(); }

// manage useStream checkbox option
window.useStream = false;
const handleUseStreamChange = e => useStream = e.target.checked;
window.streamCheckbox = document.getElementById("use-stream");
streamCheckbox.addEventListener('change', handleUseStreamChange)


// create optional source resources
const getSource = async function(options){
    let stream = null;
    try{
        stream =  await navigator.mediaDevices.getUserMedia({
            audio: options.constraints,
            video: false,
        });
    } catch (e) {
        console.log("getUserMedia error:", e)
    }

    // optional assets:
    const context =  stream ? new (window.AudioContext || window.webkitAudioContext)() : null;
    const node = (stream && context) ? context.createMediaStreamSource(stream) : null;
    return { stream, context, node }

}


// periodically log average frame data
window.frameLogInterval = 0;
window.frameSmoothedData = 0.0;
function logFrameData(buff) {
    var i;
    var sum = 0.0;
    for (i = 0; i < buff.length; ++i) {
        sum += buff[i] * buff[i];
    }
    window.frameSmoothedData = (0.95 * window.frameSmoothedData + 0.05 * sum);
    if (!(++window.frameLogInterval % 10)) {
        const sample = document.getElementById("sample");
        sample.innerText = window.frameSmoothedData.toFixed(2);
        console.log(window.frameSmoothedData.toFixed(2));
    }
}

