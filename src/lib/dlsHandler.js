import {getEventBus} from './eventBus';
const eventBus = getEventBus();
window.dlsAvailable = window.Module.internalCbs.dlsHandler = function (){
    /*
    const ptr = Module.ccall('getSls', 'number');
    var slsObject = new Module.DabSlideshow(ptr);
    */

    const dlsObject = Module.getDls(); //JSON.parse(JSON.stringify(Module.getDls()));
    const dls = dlsObject.dynamicLabel;
   // console.log({dlsObject});
    let dlsp = {};
    for(let i = 0; i <= dlsObject.dlPlusTags.size() - 1; i++){
        const dlp = dlsObject.dlPlusTags.get(i);
        const type = dlp.contentType.constructor.name.replace('DL_PLUS_CONTENT_TYPE_', '');
        const value = dlp.dlPlusTagText
        dlsp[type] = value;
    }

   eventBus.fireEvent('dls', {dlsObject, dls, dlsp});
}
