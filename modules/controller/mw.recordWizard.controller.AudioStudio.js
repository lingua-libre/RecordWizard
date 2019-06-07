'use strict';

( function ( mw, rw, $, OO ) {
	/**
	 * The AudioStudio step.
	 *
	 * @class rw.controller.AudioStudio
	 * @extends mw.recordWizard.controller.Step
	 * @constructor
	 * @param {mw.Api} api     API instance to perform requests
	 * @param {Object} config  RecordWizard config object.
	 */
	rw.controller.AudioStudio = function ( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Studio(),
			api,
			config
		);

		this.stepName = 'audiostudio';
	};

	OO.inheritClass( rw.controller.AudioStudio, rw.controller.Step );

	/**
	 * @inheritDoc
	 */
	rw.controller.AudioStudio.prototype.load = function () {
		var controller = this;

		this.recorder = new rw.libs.LinguaRecorder( {
			autoStart: true,
			autoStop: true,
			onSaturate: 'discard'
		} );

		this.recorder.on( 'ready', this.ui.onReady.bind( this.ui ) );
		this.recorder.on( 'started', this.onStart.bind( this ) );
		this.recorder.on( 'recording', this.ui.onRecord.bind( this.ui ) );
		this.recorder.on( 'stoped', this.onStop.bind( this ) );
		this.recorder.on( 'canceled', this.onCancel.bind( this ) );
		this.recorder.on( 'saturated', this.onSaturate.bind( this ) );

		this.ui.on( 'studiobutton-click', function () {
			if ( controller.isRecording ) {
				controller.recorder.cancel();
				controller.isRecording = false;
				controller.ui.onStop();
			} else {
				if ( controller.startNextRecord() ) {
					controller.ui.onStart( controller.currentWord );
				}
			}

		} );
	};

	/**
	 * Event handler called when an audio record has just ended.
	 *
	 * @param  {rw.libs.AudioRecord} audioRecord Object containing the audio datas
	 */
	rw.controller.AudioStudio.prototype.onStop = function ( audioRecord ) {
		var currentWord = this.currentWord;

		this.upload( currentWord, 'wav', audioRecord.getBlob() );

		rw.controller.Studio.prototype.onStop.call( this );
	};

	/**
	 * Go to the next word in the list and start a new record for it.
	 *
	 * @return {boolean}  Whether a new record has started or not
	 */
	rw.controller.AudioStudio.prototype.startNextRecord = function () {
		var shouldStart = rw.controller.Studio.prototype.startNextRecord.call( this );

		if ( shouldStart === true ) {
			this.isRecording = true;
			this.recorder.start();
		}

		return shouldStart;
	};

	/**
	 * Change the selected word.
	 *
	 * @param  {string} word textual transcription, must match an existing
	 *                       listed record object
	 */
	rw.controller.AudioStudio.prototype.selectWord = function ( word ) {
		this.recorder.cancel();

		rw.controller.Studio.prototype.selectWord.call( this, word );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.AudioStudio.prototype.moveNext = function ( skipFirstWarning ) {
		this.recorder.cancel();
		rw.controller.Studio.prototype.moveNext.call( this, skipFirstWarning );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.AudioStudio.prototype.movePrevious = function () {
		// TODO: warning about a potential data loss
		this.recorder.cancel();
		rw.controller.Studio.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
