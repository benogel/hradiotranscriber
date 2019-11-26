// playBtn
const playPauseBtn = document.querySelector('#startAudioContext');
const socket = new WebSocket("wss://127.0.0.1");

playPauseBtn.addEventListener('click', () => {
       // play or pause track depending on state
    if (playPauseBtn.dataset.playing === 'false') {
        //ediPlayer.audioCtx.resume();
        ediPlayer.startStream({url:'https://bredi.irt.de:443/services/21'})
    //    ediPlayer.startStream({url:'http://192.168.0.29:8187/services/22'})
        //ediPlayer.startStream({url:'http://192.168.0.29:8187/services/22?timeshiftToken=EF4dgVGDA5K40-5h1U4aog'})
        playPauseBtn.dataset.playing = 'true';
        playPauseBtn.firstChild.innerHTML = 'access_time';
        
    } else if (playPauseBtn.dataset.playing === 'true') {
        //ediPlayer.audioCtx.suspend();
        ediPlayer.stop();
        playPauseBtn.dataset.playing = 'false';
        playPauseBtn.firstChild.innerHTML = 'access_time';
    }
} , false);

ediPlayer.addEventListener('stateChange', (state) => {
    switch (state) {
        case 'running':
            playPauseBtn.dataset.playing = 'true'
            playPauseBtn.firstChild.innerHTML = 'stop';
        break;
    
        case 'stopped':
            playPauseBtn.dataset.playing = 'false'
            playPauseBtn.firstChild.innerHTML = 'play_arrow';
        break;
    }
});


ediPlayer.addEventListener('encodedAudioData', (pcm) => {
    console.log(pcm.length);
    exampleSocket.send(pcm);
});

const prettyPrintJson = (json) => {
    M.toast({html: '<pre>' + JSON.stringify(json, null, 10) + '</pre>'});
}

ediPlayer.addEventListener('sls', (obj) => {
    M.toast({html: '<img src="' + obj.url + '">'});
    prettyPrintJson(obj);
});

ediPlayer.addEventListener('msg', (obj) => {
    prettyPrintJson(obj);
});

ediPlayer.addEventListener('dls', (obj) => {
    prettyPrintJson(obj);
});
