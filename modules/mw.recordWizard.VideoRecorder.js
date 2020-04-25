'use strict';

// events
// ------
// stoped (media)
// canceled (reason)
// saturated
// recording ([sample]
// ready

// cancel()
// start()
//

( function ( mw, rw, $ ) {

	/**
	 *
	 *
	 *
	 * @class rw.VideoRecorder
	 * @constructor
	 * @param {Object} [config] Configuration options
	 */
	rw.VideoRecorder = function ( config ) {
        config = config || {};

		this.mediaRecorder = null;
        this.timeoutID = null;
        this.videoBlob = null;
        this.beforeStart = config.beforeStart || 3;
        this.recordDuration = config.recordDuration || 2;

        // Mixin constructors
    	OO.EventEmitter.call( this );

        this.load();
	};

	OO.mixinClass( rw.VideoRecorder, OO.EventEmitter );

    rw.VideoRecorder.prototype.load = function () {
        navigator.mediaDevices.getUserMedia( { audio: true, video: true } )
            .then( this.onReady.bind( this ) )
            .catch( function ( err ) {
                console.error( '[VideoRecorder]', err.name, err.message );
            } );
    };

    rw.VideoRecorder.prototype.onReady = function ( stream ) {
        this.mediaRecorder = new MediaRecorder( stream );
		this.mediaRecorder.ondataavailable = this.onDataAvailable.bind( this );

        this.emit( 'ready', stream );
    };

    rw.VideoRecorder.prototype.start = function () {
        if ( this.mediaRecorder === null ) {
            return false;
        }

        this.timeoutID = setTimeout( this.startNow.bind( this ), this.beforeStart * 1000 );
    };

    rw.VideoRecorder.prototype.startNow = function () {
        if ( this.mediaRecorder === null ) {
            return false;
        }

        this.chunks = [];
        this.mediaRecorder.start();

        this.timeoutID = setTimeout( this.stop.bind( this ), this.recordDuration * 1000 );

        this.emit( 'started' );
    };

    rw.VideoRecorder.prototype.onDataAvailable = function ( event ) {
        this.videoBlob = event.data;
        this.chunks.push( event.data );
    };

    rw.VideoRecorder.prototype.stop = function () {
        clearTimeout( this.timeoutID );
        this.mediaRecorder.stop();
        var videoBlob = new Blob( this.chunks, { type: 'video/webm' } );
        this.chunks = []; // Empty the chunks directly to save a bit of memory
        this.emit( 'stoped', this.videoBlob );
    };

    rw.VideoRecorder.prototype.cancel = function () {
        clearTimeout( this.timeoutID );
        this.mediaRecorder.stop();
        this.emit( 'canceled' );
    };


}( mediaWiki, mediaWiki.recordWizard, jQuery ) );
