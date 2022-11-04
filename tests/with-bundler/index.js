import webVoiceSDK from '../../src/webvoicesdk.js'


const VADHandler = function (speakingEvent) {
    speakingEvent.detail ? (document.getElementById("VADLed").classList.add("led-red"), document.getElementById("VADLed").classList.remove("led-green")) : (document.getElementById("VADLed").classList.add("led-green"), document.getElementById("VADLed").classList.remove("led-red"))
}

window.start = async function () {
    window.mic = new webVoiceSDK.Mic(JSON.parse(document.getElementById('mic').value))
    window.vad = new webVoiceSDK.Vad(JSON.parse(document.getElementById('VAD').value))
    await mic.start()
    await vad.start(mic)
    document.getElementById("VADLed").setAttribute('style', 'display:inline-block;')
    vad.addEventListener("speakingStatus", VADHandler)
}

window.stop = async function () {
    await vad.stop()
    document.getElementById("VADLed").setAttribute('style', 'display:none;')
    vad.removeEventListener("speakingStatus", VADHandler)
}


// HTML Interface
document.getElementById('mic').value = JSON.stringify(webVoiceSDK.Mic.defaultOptions, false, 4)
document.getElementById('VAD').value = JSON.stringify(webVoiceSDK.Vad.defaultOptions, false, 4)
document.getElementById("start").onclick = async () => {
    start()
}
document.getElementById("stop").onclick = async () => {
    stop()
}


