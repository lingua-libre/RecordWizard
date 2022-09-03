'use strict';

( function ( mw, rw, OO ) {

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
		this.beforeStart = config.beforeStart === undefined ? 3 : config.beforeStart;
		this.recordDuration = config.recordDuration === undefined ? 2 : config.recordDuration;
		this.canceled = false;

		// Mixin constructors
		OO.EventEmitter.call( this );

		this.load();
	};

	OO.mixinClass( rw.VideoRecorder, OO.EventEmitter );

	rw.VideoRecorder.prototype.load = function () {
		navigator.mediaDevices.getUserMedia( {
			audio: true,
			video: true
		} )
			.then( this.onReady.bind( this ) )
			.catch( function ( err ) {
				console.error( '[VideoRecorder]', err.name, err.message );
			} );
	};

	rw.VideoRecorder.prototype.onReady = function ( stream ) {
		var mimeType = 'video/webm';
		if ( MediaRecorder.isTypeSupported( 'video/webm;codecs="vp9"' ) ) {
			// A WebM video with VP9 video in it.
			mimeType = 'video/webm;codecs="vp9"';
		} else if ( MediaRecorder.isTypeSupported( 'video/webm;codecs="vp8"' ) ) {
			// ! no audio is specified.
			mimeType = 'video/webm;codecs="vp8"';
		}
		this.mediaRecorder = new MediaRecorder( stream, {
			mimeType: mimeType
		} );
		this.mediaRecorder.ondataavailable = this.onDataAvailable.bind( this );
		this.mediaRecorder.onstop = this.onStop.bind( this );

		this.emit( 'ready', stream );
	};

	rw.VideoRecorder.prototype.start = function () {
		if ( this.mediaRecorder === null ) {
			return false;
		}

		this.canceled = false;
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

	rw.VideoRecorder.prototype.stop = function () {
		clearTimeout( this.timeoutID );
		this.canceled = false;
		if ( this.mediaRecorder.state === 'recording' ) {
			this.mediaRecorder.stop();
		}
	};

	rw.VideoRecorder.prototype.cancel = function () {
		clearTimeout( this.timeoutID );
		this.canceled = true;
		if ( this.mediaRecorder.state === 'recording' ) {
			this.mediaRecorder.stop();
		}
		this.emit( 'canceled' );
	};

	rw.VideoRecorder.prototype.onDataAvailable = function ( event ) {
		console.log( 'dataavailable' );
		this.videoBlob = event.data;
		this.chunks.push( event.data );
	};

	rw.VideoRecorder.prototype.onStop = function () {
		if ( this.canceled === true ) {
			return;
		}

		this.chunks = []; // Empty the chunks directly to save a bit of memory
		console.log( this.videoBlob );
		this.emit( 'stoped', this.videoBlob );
	};

}( mediaWiki, mediaWiki.recordWizard, OO ) );
