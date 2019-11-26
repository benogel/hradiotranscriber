/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-unreachable */
import  bitwise from 'bitwise';
//import  butils from 'butils';
import {appendBuffer} from './utilitis.js'
import {getEventBus} from './eventBus';
const eventBus = getEventBus();

let pendingAf = new Uint8Array(),
response,
reader,
lastSeqCounter,
config,
streaming,
lastChunk = false,
signal,
lastTimeReceivedChunk = +new Date(),
lastHide = 0,
lastToast = [],
timeoutIds = [],
fetchAbortControllers = [],
emscriptenInitDone = false,
handeledChunks = 0;


const stream = async (url) => {
	const handleError = (e1, e2) => {
		const retryingInSeconds = 1;
		console.log({e1}, {e2})
		if(e1.message === "network error"){
			eventBus.fireEvent('msg', {msg: 'network error. Retrying to connect in ' + retryingInSeconds + 'Seconds', code: 'networkError'})
			timeoutIds.push(setTimeout(() => {
				stream(url)
			},retryingInSeconds))
		}
	}

	const fetchAbortController = new AbortController()
	fetchAbortControllers.push(fetchAbortController);
	signal = fetchAbortController.signal;

	response = await fetch(url, {signal}).catch(handleError);
	// fixes strange error
	if(!response){
		timeoutIds.push(setTimeout(() => stream(url),200));
		return;
	}
	let headers = {};
	
	for(const v of response.headers.entries()){
		headers[v[0]] = v[1] 
	}

	if(headers['timeshift-token']){
		const arg = {
			timeShiftToken: headers['timeshift-token'],
			timeShiftMax: headers['timeshift-max'],
			...headers,
		}
		eventBus.fireEvent('timeShiftControllerAvailable', arg)
	}
	/*
	if(headers['Timeshift-Max']){
		eventBus.fireEvent('timeShiftMax', headers)
	}
	*/
	reader = response.body.getReader();



	// reset last stream
	lastChunk = false;

	let result;
	while (true) {
		result = await reader.read().catch(handleError);
		if(!result) break;
		if(result.value){
			handleChunk(result.value);
		}
	}
};

const checkSeq = seq => {
	if(!lastSeqCounter){
		lastSeqCounter = seq;
		return;
	}
	if((lastSeqCounter + 1) != seq && seq != 0 && lastSeqCounter == 65535){
		eventBus.fireEvent('msg', {msg: 'af seq counter broken', seq, lastSeqCounter, code: 'afBroken'})
	}
	lastSeqCounter = seq;
};

// initialize JsTuner again, since with the new url new Data is comming in 
// Module.ccall('init', null); // return type // arguments

const check = () => {
	if(!streaming) return;
	const now = +new Date();
	if(now - lastTimeReceivedChunk > 5e3 && onlyEvery4Sec('asd45'))	
		eventBus.fireEvent('msg', {msg: 'No data has been received from the streaming server for a few seconds. Is there a problem?', code: 'noStreamData'})
}


const onlyEvery4Sec = (id) => {
	const now = +new Date()/1e3;
	const duration = now - ( lastToast[id] || 0 );
	if(duration > 4){
		lastToast[id] = now;
		return duration > 4;
	}
	return false;
}

const audioZeroWarning = (task) => {
	const now = +new Date()/1e3;
	if(task == 'hide')
		lastHide = +new Date()/1e3;
	
	const hideDuration = now - lastHide;

	if(hideDuration > 2 && onlyEvery4Sec('aret654'))
		eventBus.fireEvent('msg', {msg: 'streamed encoded audio data consists only of Zeros (pre decoding)', code: 'audioZero'})
}


	
setInterval(check, 4e3);
const handleChunk = (chunk) => {
	check();
	lastTimeReceivedChunk = +new Date();

	if(typeof chunk == 'undefined'){
		console.error('chunk is undefined, strange bug, have to fix this');
		return;
	}



	// make shure
	//    -  AF has the full length
	//    -  only one AF every call
	// console.log({text: new TextDecoder("utf-8").decode(chunk)});
	/*
	if(handeledChunks++ > 500){
		console.log('off');
		return;
	}
	console.log({handeledChunks});
	*/

	let afPos = 0;

	// !! one singel af could be streched over more than one chunk
	// if last chunk is not finished

	if(lastChunk) {
		chunk = appendBuffer(lastChunk, chunk);
		//console.error('last and current chunk concated');
	}

	while(chunk.length > afPos){

		//                        A                          F                             T
		if(chunk[afPos + 0] ==  0x41 && chunk[afPos + 1] == 0x46 &&  chunk[afPos + 9] == 0x54) {
			// maybe af is langer than chunk
			lastChunk = chunk.slice(afPos);
			afPos += 2;
			let afLength = chunk[afPos + 0] << 24 | chunk[afPos + 1] << 16 | chunk[afPos + 2] << 8 | chunk[afPos + 3];
			//	document.getElementById('size').innerText = afLength;
			afPos += 4; // length
			var seq = chunk[afPos] << 8 | chunk[afPos + 1 ];
			afPos += 2; // SEQ
			afPos += 1; // AR
			afPos += 1; // PT
			if((afPos + afLength) > chunk.length ) {
				// pendingAf = pendingAf.concat(chunk.slice(afPos));
				// lastChunk = chunk;
				/*
				console.error('seq: ' +( chunk[afPos] << 8 | chunk[afPos + 1 ]));
				console.error({lastSeqCounter});
				console.error('af is langer than chunk, concating...');
				*/
				return;
				
			} 
			checkSeq(seq);
			lastChunk = false;
			let afBuffer = chunk.slice(afPos, afPos + afLength);
			handleAF(afBuffer);
			afPos += afLength;
			afPos += 2; // crc 
		} else {
			afPos++;
		}
	}
};



const handleAF = (af) => {
	// console.log({af});
	// const af = data.buffer; // Uint8Array to ArrayBuffer
	// const afStr = new TextDecoder('iso-8859-2').decode(af);
	let currentPos = 0;
	while(af.length > currentPos){
		let tagValue = af.slice(currentPos, currentPos + 4);
		//4 byte tagValue
		currentPos += 4; 
		let tagLength = Math.floor((af[currentPos + 0] << 24 | af[currentPos + 1] << 16 | af[currentPos + 2] << 8 | af[currentPos + 3]) / 8);
		//4 byte tagLength
		currentPos += 4;
		if(currentPos + tagLength > af.length){
			lastChunk
			console.error('tagLength is larger than AF length');
			return;
		} 
		let payload = af.slice(currentPos, currentPos + tagLength);
			
		switch (tagValue.toString()) {
			case '100,108,112,116':// dlpt - dynamicLablePlusTag
				handleLiveItem(payload);
				break;
			case '100,101,116,105': // deti
				//get DETI data into buffer
				handleDeti(payload);
				break;
			case '101,115,116,1': // est1
				//get EST data into buffer
				handleEst(payload);
				break;
			case '42,112,116,114': // *ptr
				break;
			default:
				const name = new TextDecoder().decode(tagValue);
				console.log('no tag definition for: ' + name);
				unhandeldEdiTag(name, payload)
			}
		currentPos += tagLength;
	}
};


const unhandeldEdiTag = (tagName, payLoad) => {
	eventBus.fireEvent('unhandeldEdiTag', {tagName, payLoad});
}

const handleLiveItem = (uint8Array) => {
	const liveItem = JSON.parse(new TextDecoder("utf-8").decode(uint8Array));
	eventBus.fireEvent('liveItem', liveItem);
}


const handleDeti = (deti) => {
	let detiPos = 0;
	// read deti header
	const detiHeaderBits = bitwise.byte.read(deti[detiPos]);
	//const detiHeaderBits = af.splice(currentPos, 16);
	const mks = (n) => detiHeaderBits[n] + '';
	const isATSTF = detiHeaderBits[0];
	const isFIC = detiHeaderBits[1];
	const isRFUDF = detiHeaderBits[2];
	const intStr = mks(3) + mks(4) + mks(5) + mks(6) + mks(7);
	const fcth = parseInt(intStr, 2);

	detiPos += 1;

	if (isFIC) {
		//console.log("deti tag contains FIC data");
		if(isATSTF) {
			detiPos = detiPos + 13; // deti + eti header + ATST header  2 + 4 + 8
		} else {
			detiPos = detiPos + 5; // deti + eti header 2 + 4
		}
		
		let buffer = deti.slice(detiPos, detiPos+96);
		send({type: 'fic', buffer});
	} 
};

const handleEst = (est) => {
	let estPos = 0;
	const scIdBits = bitwise.byte.read(est[estPos]);
	const mkSId = (n) => scIdBits[n] + '';
	const sIdStr = mkSId(0) + mkSId(1) + mkSId(2) + mkSId(3) + mkSId(4) + mkSId(5);
	const scid = parseInt(sIdStr, 2);
	estPos += 3; // Subchannel Stream Characterization Field
	const buffer = est.slice(estPos);
	const avg = Math.round(new Uint8Array(buffer).reduce((t,v) => t +v ) / buffer.byteLength);
	if(avg == 0)
		audioZeroWarning('show');
	else
		audioZeroWarning('hide');
	send({type: 'mst', scid, buffer}); 
};

// eslint-disable-next-line
/* eslint-disable no-undef */

const send = msg => {
	const {buffer, scid, type} = msg;
	const scId = type === 'mst' ? scid : 0x64;

	if(!emscriptenInitDone || !Module._getDls){
		console.log('tried to send mst to cpp but cpp was not init');
		return;
	}

	try {
	


		const bufferPtr = Module.ccall('malloc', // name of C function
			'int', // return type
			['int'], // argument types
			[buffer.byteLength] //argument
		);
		Module.HEAPU8.set(new Uint8Array(buffer), bufferPtr);
		
		Module.ccall('dataInput', // name of C function
			null, // return type
			['int', 'int', 'int'], // argument types
			[bufferPtr, buffer.byteLength, scId] //argument
		);

		Module._free(bufferPtr);

	} catch (e) {	
		console.log('tried to send data to dabLibJs, but failed while calling malloc and free...', e);
		console.log('restart streaming..');
		ediDecoder.stop();
		ediDecoder.start();
	}
};

const killAsycTasks = () => {
	// abort previos fetches
	fetchAbortControllers.map( c => c.abort());
	//fetchAbortControllers = [];
	// abort previos timeouts
	timeoutIds.map(id => clearTimeout(id));
	//timeoutIds = [];
}

const startStage2 = () => {
	try {

		Module.ccall('init', null);
		emscriptenInitDone = true;
		killAsycTasks();
		stream(config.url)
	} catch (e) {
		console.log("startStage2 failed", e)
		ediDecoder.stop();
		ediDecoder.start();
	}
}

const ediDecoder = {
	start: (cfg) => {
		if(streaming && cfg && cfg.url === config.url){
			console.log('already streaming url: ' + cfg.url);
			return;
		}
		config = cfg || config;
		streaming = true;
		/*
		const urlObj = new URL(window.location.href);
		let urlFromUrl = decodeURIComponent(urlObj.searchParams.get("url"));
		if(urlFromUrl){
			if(urlFromUrl.indexOf('http') != 0 ) urlFromUrl = 'http://' + urlFromUrl;
			config.url = urlFromUrl != "http://null" ? urlFromUrl : config.url;
		}
		*/
		console.log('started streaming from url: ' + config.url);
		if(Module.ccall){
			startStage2()
		} else {
			Module.onRuntimeInitialized	= startStage2;
		}
	},

	stop: () => {
		console.log('stopped streaming from url: ' + config.url);
		streaming = false;
		killAsycTasks();
		emscriptenInitDone = false;
	}
}

export default ediDecoder;