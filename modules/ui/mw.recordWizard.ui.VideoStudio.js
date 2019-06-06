'use strict';

( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's VideoStudio step.
	 *
	 * @class rw.ui.VideoStudio
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.VideoStudio = function () {
		rw.ui.Step.call(
			this,
			'videostudio'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.VideoStudio, rw.ui.Step );

	/**
	 * @inheritDoc
	 */
	rw.ui.VideoStudio.prototype.load = function () {
		var word;
		rw.ui.Step.prototype.load.call( this );

		this.isRecording = false;
		this.generateUI();
		this.showNextButton();
		this.updateCounter();

		for ( word in rw.records ) {
			this.setItemState( word, rw.records[ word ].getState() );
		}
	};

	/**
	 * @inheritDoc
	 */
	rw.ui.VideoStudio.prototype.unload = function () {
		$( document ).off( 'keydown' );
		rw.ui.Step.prototype.unload.call( this );
	};

	/**
	 * Build all the needed HTML nodes and add them to the DOM.
	 */
	rw.ui.VideoStudio.prototype.generateUI = function () {
		var i, record;

		this.$video = $( '<video>' );
		this.$videoOverlay = $( '<div>' ).addClass( 'studio-video-overlay' ).text( 'Please allow Lingua Libre to access your webcam' );
		this.$player = $( '<div>' ).addClass( 'studio-video-player' ).append( this.$video ).append( this.$videoOverlay );

		this.$container.prepend( this.$player );
	};

	/**
	 * Event handler called when the user has accepted to share his webcam.
	 *
	 * @private
	 * @param {MediaStream} stream audio and video stream given by the browser
	 */
	rw.ui.VideoStudio.prototype.onReady = function ( stream ) {
		var ui = this,
			video = this.$video[ 0 ]; // get the HTMLnode of the video tag
		// Older browsers may not have srcObject
		if ( 'srcObject' in video ) {
			video.srcObject = stream;
		} else {
			// Avoid using this in new browsers, as it is going away.
			video.src = window.URL.createObjectURL( stream );
		}
		video.onloadedmetadata = function ( e ) {
			video.play();
		};

		this.$studioButton.click( function () {
			ui.emit( 'studiobutton-click' );
		} );

		$( document ).keydown( function ( event ) {
			switch ( event.which ) {
				case 32: // space
					ui.emit( 'studiobutton-click' );
					break;

				default: return;
			}
			event.preventDefault();
		} );

		this.$videoOverlay.text( 'Ready! Clic the button below.' );
		this.$head.addClass( 'studio-ready' );
	};

	rw.ui.VideoStudio.prototype.onStart = function ( word ) {
		this.$head.addClass( 'studio-rec' );
	};

	/**
	 * Event handler called when an video record has just ended.
	 *
	 * @private
	 */
	rw.ui.VideoStudio.prototype.onStop = function () {
		this.$head.removeClass( 'studio-rec' );
	};

	/**
	 * Change the state of a specific word
	 *
	 * @param  {string} word      textual transcription, must match an existing
	 *                            listed record object
	 * @param  {string} state     new state to switch the word to
	 * @param  {string} prevState previous state of the word
	 */
	rw.ui.VideoStudio.prototype.setItemState = function ( word, state, prevState ) {
		this.showNextButton();
		this.updateCounter();
	};

	/**
	 * Change the state of a specific word
	 *
	 * @param  {string} text
	 */
	rw.ui.VideoStudio.prototype.setOverlay = function ( text ) {
		this.$videoOverlay.text( text );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
