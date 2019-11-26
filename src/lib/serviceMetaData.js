import {getEventBus} from './eventBus';
const eventBus = getEventBus();
window.Module.internalCbs.serviceHandler = function (){
    /*
    const ptr = Module.ccall('getSls', 'number');
    var slsObject = new Module.DabSlideshow(ptr);
    */

    const serviceMetaData = Module.getServiceMetaData(); //JSON.parse(JSON.stringify(Module.getDls()));
    

   eventBus.fireEvent('serviceMetaData', serviceMetaData);
}
