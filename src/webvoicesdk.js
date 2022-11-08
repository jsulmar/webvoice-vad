import Mic from './webvoicesdk/nodes/mic.js'
import Src from './webvoicesdk/nodes/src.js'
import Vad from './webvoicesdk/nodes/vad.js'

const vad = {
    Src,
    Mic,
    Vad,
}
window.vad = vad
module.exports = vad
