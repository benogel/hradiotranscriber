import {getEventBus} from './eventBus';
import {appendBuffer} from './utilitis'
import {PCMPlayer} from './pcmPlayer'
import {mapState} from './utilitis';
const eventBus = getEventBus();

let mediaSource, 
    mediaSourceBuffer,
    codec,
    queue = [],
    running = false,
    lastAudioFrameReceived = Infinity,
    lastState = 'stopped',
    downloadBuffer = new Uint8Array(),
    downloaded = false,
    mediaSourceIsOpen = false,
    pcmPlayer = new PCMPlayer({
        encoding: '16bitInt',
        channels: 2,
        sampleRate: 48000,
        flushingTime: 1000
    });

if('MediaSource' in window){
    mediaSource = new MediaSource();
    mediaSource.addEventListener('sourceopen', function () {
        mediaSourceIsOpen = true;
    }, false);    
}
else
    throw "error: MediaSource ist not supported on this system";

    
    const downloadBlob = function(data, fileName, mimeType = 'data:application/octet-stream') {
        const downloadURL = (data, fileName) => {
            var a;
            a = document.createElement('a');
            a.href = data;
            a.download = fileName;
            document.body.appendChild(a);
            a.style = 'display: none';
            a.click();
            a.remove();
        };
        var blob, url;
        blob = new Blob([data], {
            type: mimeType
        });
        url = window.URL.createObjectURL(blob);
        downloadURL(url, fileName);
        setTimeout(function() {
            return window.URL.revokeObjectURL(url);
        }, 1000);
    };
 
    const addDataTodownloadBuffer = (data) => {
        downloadBuffer = appendBuffer(downloadBuffer, data)
        console.log(downloadBuffer.length/0.5e6)
        if(!downloaded && downloadBuffer.length > 0.5e6){
            downloaded = true;
            downloadBlob(downloadBuffer, 'aacFile.aac')
        }
    }


const check  = (received) => {
    let state;
    const now = +new Date();
    if(received){
        lastAudioFrameReceived = now;
        state = 'running';
    }
    const duration = now - lastAudioFrameReceived;
    if(duration > 500){
        state = 'stopped'
    }

    if(state && lastState != state){
        eventBus.fireEvent('stateChange', state);
        lastState = state;
    }
}

setInterval(check, 100);

const addDataToBuffer =  (audioData) => {

   // console.log({audioData})

    pcmPlayer.feed(audioData);
    check(true);

    return;

    console.log(audioData)
    // `data` comes from your Websocket, first convert it to Float32Array
    
    for(var i = 0; i < 1920; i++) {
        var cnt = 0;
        if(i % 2) {
            buffer.getChannelData(0)[cnt++] = audioData[i]
        } else {
            buffer.getChannelData(1)[cnt++] = audioData[i]
        }
    }
   
    

  




   // addDataTodownloadBuffer(audioData) return;
    //console.log(audioData)
    if(!mediaSource || !mediaSourceBuffer) return;
    /* if audioElment is not playing, buffer will maybe get very big... 
    how to solve this? 
    knowing & checking playState of audioElement?


    Uncaught DOMException: Failed to execute 'appendBuffer' on 'SourceBuffer': The SourceBuffer is full, and cannot free space to append

    */
    console.log("mediaSourceBuffer.updating: " + mediaSourceBuffer.updating);
    if(mediaSourceBuffer.updating ){
        queue.push(audioData);
    } else {
        // add init audio data to buffer
        if(mediaSource && mediaSourceBuffer && mediaSource.readyState === 'open'){
            mediaSourceBuffer.appendBuffer(audioData);
        }
        else{
            console.log('got audio data, but buffer is not ready.');
        }    
    }
};

const initMediaSourceBuffer = (type) => {


    return;
    const addUpdateEndListener =  () => {
        mediaSourceBuffer.onupdateend = () => {
            setTimeout(() => {
                if ( queue.length ) {
                    console.log("queue.length: " + queue.length)
                    try {
                        mediaSourceBuffer.appendBuffer(queue.shift());
                    } catch (e) {
                        console.log('onUpdateendListener error', e);
                        console.log("SourceBuffer.buffered: " + mediaSourceBuffer.buffered);
    
                    }
                }
            },0)
            //console.log("mediaSource: updateend");testaudio
        };
    };


    //codec = type == 'mpeg' ? 'audio/mpeg' : 'audio/aac';

    codec = 'pcm'



    console.info({codec});
        if (MediaSource.isTypeSupported(codec)) {
            if(mediaSourceIsOpen){
                mediaSourceBuffer = mediaSource.addSourceBuffer(codec);
                addUpdateEndListener();
            } else {
                mediaSource.addEventListener('sourceopen', function () {
                    mediaSourceBuffer = mediaSource.addSourceBuffer(codec);
                    addUpdateEndListener();
                }, false);    
            }
        } else {
            throw "error: MediaSource does not support the requested codec: " + codec;
        }
        //eventBus.removeEventListener('encodedAudioData', addDataToBuffer);
    }
    
eventBus.addEventListener('encodedAudioData', addDataToBuffer);
eventBus.addEventListener('audioType', initMediaSourceBuffer);

const audioUrl = mediaSource ? URL.createObjectURL(mediaSource) : false;
const audioCtx = pcmPlayer.audioCtx;

/*
audioCtx.onstatechange = () => {
    const newState = mapState(audioCtx.state);
    if(newState !== lastState){
        lastState = newState;
        console.log({lastState})
        eventBus.fireEvent('stateChange', newState)
    }
}
*/
    
export {audioCtx, audioUrl, initMediaSourceBuffer};

