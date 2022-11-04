import Mic from './webvoicesdk/nodes/mic.js'
import Vad from './webvoicesdk/nodes/vad.js'

const vad = {
    Mic,
    Vad,
}
window.vad = vad
module.exports = vad