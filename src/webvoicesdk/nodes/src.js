/**
 * Src
 * generalizes Linto's original Mic class
 * 
 * 1. accepts optional source input { stream, context, node }
 * 2. exposes audio sample sequence
 *  
 */

import Node from './node.js'
import NodeError from './error.js'

export default class Src extends Node {
    static defaults = {
        source: null,   // optional { stream, context, node }

        // used to create source if none is specified
        micConstraints: {
                echoCancellation: true,
                autoGainControl: true,
                noiseSuppression: true,
                channelCount: 1,
        },
        processor: {
            frameSize: 4096,
        },

        // optional sample handler callback
        onAudioFrame: () => {},
    };


    constructor(  ) {
        super()
        this.hookableOnNodeTypes = [] //none, this node will connect to getUserMedia stream
        this.type = "mic"
        this.event = "srcFrame" //emitted
        this.hookedOn = null
     }


    async start( options = {}) {
        this.options = {...Src.defaults, ...options }
        
        console.log(`Src framesize=${this.options.processor.frameSize}, constraints:`, this.options.micConstraints);
        console.log("Src this.options:", this.options);

        if (this.hookedOn) throw new NodeError(`Source is already started, call stop() first`)

        // if provided, apply specified source resources, otherwise create microphone based resources
        const {stream, context, node} = this.options.source;

        this.stream = stream || await navigator.mediaDevices.getUserMedia({
            audio: this.options.micConstraints,
            video: false,
        });

        this.context = (stream && context) ? context : new (window.AudioContext || window.webkitAudioContext)();
        this.mediaStreamSource = (stream && context && node) ? node : this.context.createMediaStreamSource(this.stream);

        this.hookedOn = true
        this.sampleRate = this.context.sampleRate
        this.srcFrameGenerator = this.context.createScriptProcessor(this.frameSize, 1, 1)
        if (this.status == "non-emitting" && this.hookedOn) {
            this.srcFrameGenerator.onaudioprocess = (audioFrame) => {
                const srcFrame = audioFrame.inputBuffer.getChannelData(0)
                this.dispatchEvent(new CustomEvent(this.event, {
                    "detail": srcFrame
                }));
                this.options.onAudioFrame(srcFrame);
            }
            this.mediaStreamSource.connect(this.srcFrameGenerator)
            this.srcFrameGenerator.connect(this.context.destination)
            this.status = "emitting"
        }
        return Promise.resolve()
    }

    resume() {
        super.resume()
        this.mediaStreamSource.connect(this.srcFrameGenerator)
        this.srcFrameGenerator.connect(this.context.destination)
    }


    pause() {
        super.pause()
        this.mediaStreamSource.disconnect()
        this.srcFrameGenerator.disconnect()
    }

    stop() {
        if (this.hookedOn) {
            this.stream.getTracks().map((track) => {
                return track.readyState === 'live' && track.kind === 'audio' ? track.stop() : false
            })
            this.pause()
            delete this.mediaStreamSource
            delete this.srcFrameGenerator
            this.context.close().then(() => {
                delete this.stream
                delete this.context
            })
            this.hookedOn = null
        }
    }
}