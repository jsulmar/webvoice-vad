import Src from './src'

export default class Mic extends Src {
    static defaultOptions = {
        frameSize: 4096,
        constraints: {
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true,
            channelCount: 1,
        },
    };

    constructor(options = {}) {
        super({ ...Mic.defaultOptions, ...options });
    }
    async start() {
        await super.start();
        return Promise.resolve();
    }
    resume() {
        super.resume();
    }
    pause() {
        super.pause();
    }
    stop() {
        super.stop();
    }
}Mic