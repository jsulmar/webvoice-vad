# webvoice-vad

A Node.js voice activity detector. 

Derived from <a href="https://www.npmjs.com/package/@linto-ai/webvoicesdk" target="_blank">WebVoice SDK</a> but retaining only the voice activity detection (VAD) function. Added capabilities include a) option to accept a MediaStream input, and b) audio sample sequence is exposed. 

## Functionalities 
- Voice activity detection : Detect when someone's speaking (even at very low signal-to-noise ratio)
- Takes microphone input by default, or accepts application's MediaStream/AudioContext input  

### Online demo

(TBD)


## Highlights

- Wide cross-platform compatibility for modern-browsers, O/S, and devices.
- Can process RTCPeerConnection remote streams.

(TBD)

## Usage

```
(TBD)
import { Mic, Src, Vad } from 'webvoice-vad';

const mic = new Mic();
const vad = new Vad();
const handleVadEvent = e => console.log(e.detail);

const start = async () => {
    await mic.start();
    await vad.start(mic);
    vad.addEventListener("speakingStatus", handleVadEvent );
}

const stop = async () => {
    vad.removeEventListener("speakingStatus", handleVadEvent);
    await vad.stop();
    await mic.stop();
}


```



## License
* MIT License
* This library includes modified bits from :
  * [Jitsi](https://github.com/jitsi/jitsi-meet) Apache License 2.0
  * WebVoiceSDK (https://www.npmjs.com/package/@linto-ai/webvoicesdk)
