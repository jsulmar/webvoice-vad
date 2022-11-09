/**
 * Src
 * generalizes original Mic class from linto-ai/WebVoiceSDK
 * 
 * 1. accepts optional source input { stream, context, node }
 * 2. exposes audio sample sequence
 *  
 */

import Node from './node.js'
import NodeError from './error.js'

export default class Src extends Node {
    static defaultOptions = {
        // optional source assets
        source: { stream: null, context: null, node: null },

        // optional handler exposes audio sample sequence
        onAudioFrame: () => { },

        // these micOptions are ignored if source.stream is truthy
        frameSize: 4096,
        constraints: {
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true,
            channelCount: 1,
        },
    }

    constructor(options = {}) {
        super()
        this.options = { ...Src.defaultOptions, ...options }

        this.hookableOnNodeTypes = [] //none, this node will connect to getUserMedia stream
        this.type = "mic"
        this.event = "srcFrame" //emitted
        this.hookedOn = null

    }

    async start(options = {}) {
        if (!this?.hookedOn) {
            console.log("Src start:", this.hookedOn);
            this.options = { ...this.options, ...options }

            if (this.hookedOn) throw new NodeError(`Source is already started, call stop() first`)

            // if provided, apply specified source resources, otherwise create microphone based resources
            const { stream, context, node } = this.options.source;

            this.stream = stream || await navigator.mediaDevices.getUserMedia({
                audio: this.options.constraints,
                video: false,
            });

            // use specified context, or create one if none was provided
            this.context = (stream && context) ? context : new (window.AudioContext || window.webkitAudioContext)();

            // use specified source node, or create one if none was provided
            this.mediaStreamSource = (stream && context && node) ? node : this.context.createMediaStreamSource(this.stream);

            this.hookedOn = true
            this.sampleRate = this.context.sampleRate
            this.scriptProcessor = this.context.createScriptProcessor(this.frameSize, 1, 1)
            if (this.status == "non-emitting" && this.hookedOn) {
                this.scriptProcessor.onaudioprocess = (audioFrame) => {
                    const srcFrame = audioFrame.inputBuffer.getChannelData(0)
                    this.dispatchEvent(new CustomEvent(this.event, {
                        "detail": srcFrame
                    }));
                    this.options.onAudioFrame(srcFrame);
                }
                this.mediaStreamSource.connect(this.scriptProcessor)
                this.scriptProcessor.connect(this.context.destination)
                this.status = "emitting"
            }

        }
        return Promise.resolve()
    }

    resume() {
        super.resume()
        this.mediaStreamSource.connect(this.scriptProcessor)
        this.scriptProcessor.connect(this.context.destination)
    }

    pause() {
        super.pause()
        this.mediaStreamSource.disconnect()
        this.scriptProcessor.disconnect()
    }

    stop() {
        if (this.hookedOn) {
            this.stream.getTracks().map((track) => {
                return track.readyState === 'live' && track.kind === 'audio' ? track.stop() : false
            })
            this.pause()
            delete this.mediaStreamSource
            delete this.scriptProcessor
            this.context.close().then(() => {
                delete this.stream
                delete this.context
            })
            this.hookedOn = null
        }
    }
}
