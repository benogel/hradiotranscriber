/* eslint-disable no-unused-vars */
import {getEventBus} from './eventBus';
const eventBus = getEventBus();

import './emscriptenInit';
import ediDecoder from './ediDecoder';
import './audioDataHandler';

import './slsHandler';
import './dlsHandler';
import './serviceInfo';
import './serviceMetaData';
import timeShiftController from './timeShiftController';
//import './checkSharredArrayBuffer';
import {mapState} from './utilitis';

//import {audioCtx} from './audioMediaSource';

const availableEvents = ['sls', 'dls', 'msg', 'serviceMetaData','slsMeta', 'slsUrl', 'stateChange', 
                        'encodedAudioData', 'audioType','serviceInfo', 'missingSharedArrayBuffer', 
                        'timeShiftControllerAvailable', 'items', 'liveItem', 'unhandeldEdiTag',
                        'dabTime']
                        /**
                         * timeShiftControllerAvailable  -> Timeshift-Max / Timeshift-Token
                         * 
                         */

                        /**
                          eventBus.fireEvent('unhandeldEdiTag', {tagName, payLoad});
                            payload: uint8Array
                         */


let config;
const start = (cfg) => {
    config = cfg ? cfg : config;
    // check if context is in suspended state (autoplay policy)
    /*
    if(audioCtx.state === 'suspended'){
        audioCtx.resume()
    }
    */
    ediDecoder.start(config);
    // set url on timeShiftController
    timeShiftController.config.setUrl(config.url);
}

const stop = () => {
    ediDecoder.stop();
    //audioCtx.suspend();
}

const ediPlayer = {
    // stream controlls
    startStream: start, 
    //state: mapState(audioCtx.state),
    start,
    stop,

    // timeShiftControlls
    seek: timeShiftController.seek,
    seekUts: timeShiftController.seekUts,
    pause: timeShiftController.pause,
    play: timeShiftController.play,
    toggleId: timeShiftController.toggleId,
    
    availableEvents,
    //audioCtx,
};

eventBus.addEventListener('stateChange', () => {
   ediPlayer.state = mapState(audioCtx.state);
})

Object.assign(ediPlayer, eventBus,);
window.ediPlayer = ediPlayer;
export default ediPlayer;