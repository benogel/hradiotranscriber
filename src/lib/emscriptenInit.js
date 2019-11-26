
import {getEventBus} from './eventBus';
const eventBus = getEventBus();

window.Module = {
  ...window.Module,
  preRun: [],
  postRun: [],
  internalCbs: {},
  setStatus: function(text) {
    return;
  },
  print: t => ()=>{},//t => console.log(t), //
  totalDependencies: 0
  /*
  onRuntimeInitialized:  () => {
    console.log('init done, calling cpp init');
    window.initDone = true;
    // Module.print = (t) => console.log(t);
    Module.ccall('init', null); // return type // arguments
    Module.print = t => {};
    // poll for data
    //setInterval(()=> {Module.ccall('getDabData', null)}, 5e3);
  }*/
};

if(typeof SharedArrayBuffer == 'undefined'){
  console.error('SharedArrayBuffer is not enabled. No Chance to run ediPlayer without it.');
  setTimeout(()=>{eventBus.fireEvent('missingSharedArrayBuffer');}, 0);
} else {
  const path = document.currentScript.src.substr(0,document.URL.lastIndexOf('/'));
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src =  path + "/irtdab.js";

  document.body.append(s);

  // <script type="text/javascript" src="irtdab.js"></script>
  
  // emscripten init done

  // Module['onRuntimeInitialized'] =
}