import {getEventBus} from './eventBus';
const eventBus = getEventBus();
window.serviceInfoReady = window.Module.internalCbs.serviceInfoReady = function (){
    const serviceInfo = Module.getServiceInfo();
    const serviceLabel = serviceInfo.name.replace(/\0/g, '');
    const ensembleLabel =  serviceInfo.ensemble.replace(/\0/g, '');
    const ensembleId =  serviceInfo.ensembleId;
    eventBus.fireEvent('serviceInfo', {ensembleLabel, serviceLabel, ensembleId});
}
