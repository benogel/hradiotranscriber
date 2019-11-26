export function appendBuffer( buffer1, buffer2 ) {
	var tmp = new Uint8Array( buffer1.byteLength + buffer2.byteLength );
	tmp.set( new Uint8Array( buffer1 ), 0 );
	tmp.set( new Uint8Array( buffer2 ), buffer1.byteLength );
	return tmp;
};

// normalize web audio states
export function mapState(state) {
    const states = {
        running: 'running',
        closed: 'stopped',
        suspended:'stopped'
    }
    return states[state];
};