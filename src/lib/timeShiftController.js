import {getEventBus} from './eventBus';
const eventBus = getEventBus();
let isTsCtrlMode = false; 
let ctrlUrl, timeshiftToken;

eventBus.addEventListener('timeShiftControllerAvailable', (headers) => {
    isTsCtrlMode = true;
    config.setToken(headers['timeshift-token']);
    config.tsbMax = headers['timeshift-max'];

    //tsMax = headers['Timeshift-Max'];
    send({action: 'items'}, (json) => {
        eventBus.fireEvent('items', json);
    })

})

window.dabTime = function() {
    const dabTime = Module.getDabTime();

    const log = (s) => console.log(s);
    /*
    const x = () => log("X".repeat(50));
    const xx = () => {x();x();}
    xx();
    xx(^);
    */
   const ms = dabTime.unixTimestampSeconds*1e3 + dabTime.milliseconds;
   const dt = new Date(ms);
   eventBus.fireEvent('dabTime', dt);
   //log({dabTime, dt});
}

const config = {
    setUrl: (url) => {
        ctrlUrl = url;
    },
    setToken: (token) => {
        timeshiftToken = token;
    }
}

const play = () => send({action:'play'});
const pause = () => send({action:'pause'});
const toggleId = (id) => send({action:'toggle', wantedPos: id});
const seek = (milliseconds) => {
    if(milliseconds < 0 || milliseconds > config.tsbMax)
        console.error("seek value out of range. just seek from 0 to " + config.tsbMax/1e3/60/60 + "h in ms. tried: " + milliseconds);
    else
        send({action: 'seek', wantedPos: milliseconds})
};
const seekUts = (d) => {
    /* unix time stamp */
    let seconds;
    if(typeof d === 'object'){
        seconds = +d/1e3;
    } else {
        seconds = d;
    }
    send({action: 'seek', wantedUts: seconds});
};

const send = async (data, cb) => {
    if(!isTsCtrlMode){
        console.error('tried to controll timeshiftServer, but no time shift info from server available');
        return
    }
    if(!ctrlUrl){
        console.error('tried to controll timeshiftServer but no time shift controll url was set');
        return;
    }
    data.timeshiftToken = timeshiftToken
    try {
        const response = await fetch(ctrlUrl, {
            method: 'POST',
           // mode: 'cors',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if(cb) {
            const json = await response.json();
            cb(json)
            //console.log('Success:', JSON.stringify(json));
        }
        //const json = await response.json();
        //console.log('Success:', JSON.stringify(json));
    } catch (error) {
        console.error('Fetch Error:', error, data);
    }
}

const timeShiftController = {seek, config, play, pause, toggleId, seekUts};
export default timeShiftController