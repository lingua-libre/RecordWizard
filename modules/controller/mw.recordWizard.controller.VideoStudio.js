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
		var word,
			controller = this;

		if ( rw.metadatas.statesCount === undefined ) {
			rw.metadatas.statesCount = {
				ready: 0,
				stashing: 0,
				stashed: 0,
				uploading: 0,
				uploaded: 0,
				finalizing: 0,
				done: 0,
				error: 0
			};
		}

		rw.controller.Step.prototype.load.call( this );

		// TODO: Initialize the recorder
		this.startVideoStream();

		this.isRecording = false;
		this.currentWord = rw.metadatas.words[ 0 ];

		for ( word in rw.records ) {
			rw.records[ word ].on( 'state-change', this.switchState.bind( this ) );
		}

		this.ui.on( 'studiobutton-click', function () {

			if ( controller.isRecording ) {
				controller.isRecording = false;
				controller.mediaRecorder.stop();
			} else {
				controller.startNextRecord();
			}

		} );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.unload = function () {
		this.ui.off( 'studiobutton-click' );

		rw.controller.Step.prototype.unload.call( this );
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
		var controller = this;
		this.isRecording = true;
		this.chunks = [];

		this.ui.setOverlay( '3' );
		setTimeout( function () { controller.ui.setOverlay( '2' ); }, 1000 );
		setTimeout( function () { controller.ui.setOverlay( '1' ); }, 2000 );
		setTimeout( function () { controller.mediaRecorder.start(); controller.ui.setOverlay( controller.currentWord ); }, 3000 );

		// this.ui.setSelectedItem( this.currentWord );
		return true;
	};

	/**
	 * Event handler called when the MediaRecorder has a chunk of data for us.
	 *
	 * @private
	 * @param {Object} event
	 */
	rw.controller.VideoStudio.prototype.onStart = function () {
		this.ui.onStart( this.currentWord );
		console.log( 'Started, state = ' + this.mediaRecorder.state );
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

		// Empty the chunks directly to save a bit of memory
		this.chunks = [];

		console.log( 'Stopped, state = ' + this.mediaRecorder.state );

		this.ui.onStop();
		this.upload( this.currentWord, 'webm', videoBlob );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.moveNext = function () {
		rw.controller.Step.prototype.moveNext.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.movePrevious = function () {
		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
