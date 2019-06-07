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
		return;
	};

	/**
	 * Build all the needed HTML nodes and add them to the DOM.
	 */
	rw.ui.VideoStudio.prototype.generateUI = function () {
		var i, record;

		rw.ui.Studio.prototype.generateUI.call( this );

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
		var video = this.$video[ 0 ]; // get the HTMLnode of the video tag

		// Older browsers may not have srcObject
		if ( 'srcObject' in video ) {
			video.srcObject = stream;
		} else {
			// Avoid using this in new browsers, as it is going away.
			video.src = window.URL.createObjectURL( stream );
		}
		video.onloadedmetadata = function () {
			console.log('onloadmetadata')
			video.play();
			video.muted = true;
		};

		rw.ui.Studio.prototype.onReady.call( this, stream );

		this.$videoOverlay.text( 'Ready! Clic the button below.' );
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
