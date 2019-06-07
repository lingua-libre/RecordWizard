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
		navigator.mediaDevices.getUserMedia( { audio: true, video: true } )
			.then( this.onReady.bind( this ) )
			.catch( function ( err ) {
				console.log( err.name + ': ' + err.message );
			} );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.unload = function () {
		// close the recording stream, if it was running
		if ( this.mediaRecorder !== undefined ) {
			if ( this.mediaRecorder.state === 'recording' ) {
				this.mediaRecorder.stop();
			}
		}

		rw.controller.Studio.prototype.unload.call( this );
	};

	/**
	 * Event handler called when the user has accepted to share his webcam.
	 *
	 * @private
	 * @param {MediaStream} stream audio and video stream given by the browser
	 */
	rw.controller.VideoStudio.prototype.onReady = function ( stream ) {
		this.stream = stream;

		this.durationToRecord = 4;
		this.durationToWait = 3;
		this.timeoutId = 0;
		this.isCanceled = false;
		this.isWaitingToRecord = false;

		this.ui.on( 'studiobutton-click', function () {
			console.log( 'STATE:', 'isRecording', this.isRecording, 'isWaitingToRecord', this.isWaitingToRecord )
			if ( this.isRecording || this.isWaitingToRecord ) {
				this.cancelRecord();
			} else {
				this.startNextRecord();
				this.onStart();
				// TODO: delete the following if the above works
				// if ( this.startNextRecord() ) {
				//	this.ui.onStart( this.currentWord );
				// }
			}

		}.bind( this ) );

		this.ui.onReady( stream );
	};

	/**
	 * Go to the next word in the list and start a new record for it.
	 *
	 * @return {boolean}  Whether a new record has started or not
	 */
	rw.controller.VideoStudio.prototype.startNextRecord = function () {
		var shouldStart = rw.controller.Studio.prototype.startNextRecord.call( this );
		console.info( 'shouldStart', shouldStart );

		if ( shouldStart ) {
			this.differedStart( this.durationToWait );
			this.ui.onStart( this.currentWord );
		}

		return shouldStart;
	};

	rw.controller.VideoStudio.prototype.differedStart = function ( remainingTime ) {
		if ( remainingTime > 0 ) {
			this.isWaitingToRecord = true;
			this.ui.setOverlay( remainingTime );
			this.timeoutId = setTimeout( this.differedStart.bind( this, remainingTime - 1 ), 1000 );
		} else {
			this.ui.setOverlay( this.currentWord );
			this.startRecord();
			this.isWaitingToRecord = false;
			this.timeoutId = setTimeout( this.mediaRecorder.stop.bind( this.mediaRecorder ), this.durationToRecord * 1000 );
		}
	};

	/**
	 * Go to the next word in the list and start a new record for it.
	 *
	 * @return {boolean}  Whether a new record has started or not
	 */
	rw.controller.VideoStudio.prototype.startRecord = function () {
		this.chunks = [];
		this.isCanceled = false;
		this.isRecording = true;

		this.mediaRecorder = new MediaRecorder( this.stream );
		this.mediaRecorder.ondataavailable = this.onDataAvailable.bind( this );
		this.mediaRecorder.onerror = console.log.bind( console );
		this.mediaRecorder.onstart = this.onStart.bind( this );
		this.mediaRecorder.onstop = this.onStop.bind( this );
		this.mediaRecorder.onwarning = console.log.bind( console );
		this.mediaRecorder.start();
	};

	/**
	 * Go to the next word in the list and start a new record for it.
	 *
	 * @return {boolean}  Whether a new record has started or not
	 */
	rw.controller.VideoStudio.prototype.cancelRecord = function () {
		console.warn( 'CANCEL', this.timeoutId );
		this.isCanceled = true;
		this.isWaitingToRecord = false;
		clearTimeout( this.timeoutId );
		if ( this.mediaRecorder !== undefined && this.mediaRecorder.state === 'recording' ) {
			this.mediaRecorder.stop();
		}
		this.isRecording = false;
		this.chunks = [];
		this.ui.onStop();
		this.ui.setOverlay( 'Cancelled' );
	};

	/**
	 * Change the selected word.
	 *
	 * @param  {string} word textual transcription, must match an existing
	 *                       listed record object
	 */
	rw.controller.Studio.prototype.selectWord = function ( word ) {
		this.currentWord = word;

		if ( this.isRecording || this.isWaitingToRecord ) {
			this.cancelRecord();
			this.startNextRecord();
		} else {
			this.ui.setSelectedItem( word );
		}
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
		if ( this.isCanceled === true ) {
			this.onCancel();
			return;
		}

		var videoBlob = new Blob( this.chunks, { type: 'video/webm' } );
		this.chunks = []; // Empty the chunks directly to save a bit of memory

		this.upload( this.currentWord, 'webm', videoBlob );

		rw.controller.Studio.prototype.onStop.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.moveNext = function () {
		this.cancelRecord();
		rw.controller.Step.prototype.moveNext.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.movePrevious = function () {
		this.cancelRecord();
		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
