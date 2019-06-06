'use strict';

( function ( mw, rw, $, OO ) {
	/**
	 * The VideoStudio step.
	 *
	 * @class rw.controller.VideoStudio
	 * @extends mw.recordWizard.controller.Step
	 * @constructor
	 * @param {mw.Api} api     API instance to perform requests
	 * @param {Object} config  RecordWizard config object.
	 */
	rw.controller.VideoStudio = function ( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Studio(),
			api,
			config
		);

		this.stepName = 'videostudio';
	};

	OO.inheritClass( rw.controller.VideoStudio, rw.controller.Step );

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.load = function () {
		// TODO: Initialize the recorder
		this.startVideoStream();

		this.mediaRecorder = null;
		this.durationToRecord = 8;
		this.durationToWait = 3;

		this.ui.on( 'studiobutton-click', function () {
			if ( this.isRecording ) {
				this.mediaRecorder.stop(); //TODO: cancel instead
				this.isRecording = false;
				this.ui.onStop();
			} else {
				if ( this.startNextRecord() ) {
					this.ui.onStart( this.currentWord );
				}
			}

		}.bind( this ) );
	};

	/**
	 * Start the video stream
	 */
	rw.controller.VideoStudio.prototype.startVideoStream = function () {
		navigator.mediaDevices.getUserMedia( { audio: true, video: true } )
			.then( this.onReady.bind( this ) )
			.catch( function ( err ) {
				console.log( err.name + ': ' + err.message );
			} );
	};

	/**
	 * Event handler called when the user has accepted to share his webcam.
	 *
	 * @private
	 * @param {MediaStream} stream audio and video stream given by the browser
	 */
	rw.controller.VideoStudio.prototype.onReady = function ( stream ) {
		this.stream = stream;

		this.mediaRecorder = new MediaRecorder( this.stream );
		this.mediaRecorder.ondataavailable = this.onDataAvailable.bind( this );
		this.mediaRecorder.onerror = console.log.bind( console );
		this.mediaRecorder.onstart = this.onStart.bind( this );
		this.mediaRecorder.onstop = this.onStop.bind( this )
		this.mediaRecorder.onwarning = console.log.bind( console );

		this.ui.onReady( stream );
	};

	/**
	 * Go to the next word in the list and start a new record for it.
	 *
	 * @return {boolean}  Whether a new record has started or not
	 */
	rw.controller.VideoStudio.prototype.startNextRecord = function () {
		var shouldStart = rw.controller.Studio.prototype.startNextRecord.call( this );

		if ( shouldStart ) {
			this.chunks = [];

			this.ui.setOverlay( '3' );
			setTimeout( function () { this.ui.setOverlay( '2' ); }.bind( this ), 1000 );
			setTimeout( function () { this.ui.setOverlay( '1' ); }.bind( this ), 2000 );
			setTimeout( function () {
				this.mediaRecorder.start();
				this.ui.setOverlay( this.currentWord );
			}.bind( this ), 3000 );

			// this.ui.setSelectedItem( this.currentWord );
		}

		return shouldStart;
	};

	/**
	 * Event handler called when the MediaRecorder has a chunk of data for us.
	 *
	 * @private
	 * @param {Object} event
	 */
	rw.controller.VideoStudio.prototype.onDataAvailable = function ( event ) {
		this.chunks.push( event.data );
	};

	/**
	 * Event handler called when the record is stopped.
	 *
	 * @private
	 * @param {Object} event
	 */
	rw.controller.VideoStudio.prototype.onStop = function () {
		var videoBlob = new Blob( this.chunks, { type: 'video/webm' } );
		this.chunks = []; // Empty the chunks directly to save a bit of memory

		this.upload( this.currentWord, 'webm', videoBlob );

		rw.controller.Studio.prototype.onStop.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.moveNext = function () {
		this.mediaRecorder.stop(); // TODO: cancel instead
		rw.controller.Step.prototype.moveNext.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.movePrevious = function () {
		this.mediaRecorder.stop(); // TODO: cancel instead
		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
