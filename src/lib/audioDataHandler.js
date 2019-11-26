import {getEventBus} from './eventBus';
const eventBus = getEventBus();
let audioType;
const audioDataHandler = function (type) {
	if(audioType != type) {
		audioType = type;
		eventBus.fireEvent('audioType', audioType);
	}
	const ptr = Module.ccall('getAudioData', 'number');
	var audioData = new Module.VectorAudioData2(ptr);
	const audioDataArray = [];
	for(let i = 0; i < audioData.size(); i++){
		audioDataArray.push(audioData.get(i));
	}

	
	//console.log(audioDataArray);
	//const audioDataArrayBuffer = new Float32Array(audioDataArray);
	const audioDataArrayBuffer = new Uint16Array(audioDataArray);
	/*
	console.log("js audio data:");
	for(let i = 0; i < 10; i++){
		console.log(audioDataArrayBuffer[i] + ' ');
	}
	console.log("js audio data end");
	*/
	eventBus.fireEvent('encodedAudioData', audioDataArrayBuffer);
};

window.audioDataAvailable = window.Module.internalCbs.audioDataAvailable = audioDataHandler;