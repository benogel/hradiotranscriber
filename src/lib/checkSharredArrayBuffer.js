if(typeof SharedArrayBuffer == 'undefined'){
    eventBus.fireEvent('msg', {msg:'sharredArrayBuffer not supported', code : 'sharredArrayBuffer'});
}