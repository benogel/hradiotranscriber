
import {getEventBus} from './eventBus';
const eventBus = getEventBus();
eventBus.fireEvent('test', {test:12})
window.slsAvailable = window.Module.internalCbs.slsHandler = function (){
    /*
    const ptr = Module.ccall('getSls', 'number');
    var slsObject = new Module.DabSlideshow(ptr);
    */

    const sls = Module.getSls();
    const imageDataArray = [];
    for (let i = 0; i <= sls.slideshowData.size(); i++){
        imageDataArray.push(sls.slideshowData.get(i));
    }

    var blob = new Blob([new Uint8Array(imageDataArray)], {'type': sls.mimeType});
    var url = URL.createObjectURL(blob); //possibly `webkitURL` or another vendor prefix for old browsers

    
    const meta = {
        contentName: sls.contentName,
        clickThroughUrl: sls.clickThroughUrl,
        contentSubType: sls.contentSubType,
        triggerTime: (sls.triggerTime == 0 ? 'now' : sls.triggerTime),
        categoryId: sls.categoryId,
        categoryTitle: sls.categoryTitle,
        isCategorized: sls.isCategorized,
        slideId: sls.slideId,
        url
    }
    
    eventBus.fireEvent('slsMeta', meta);
    eventBus.fireEvent('slsUrl', url);
    eventBus.fireEvent('sls', meta);

            
 
    /*

        constSubType 
        mimeType
        if(cat) slideId /catId /cat titel
        beide urls
        triggerTime = 0 => now
        contentName

    */
};

