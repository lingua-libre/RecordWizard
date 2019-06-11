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
		this.$videoOverlay = $( '<div>' ).addClass( 'studio-video-overlay' );
		this.$videoOverlayLine1 = $( '<div>' ).addClass( 'studio-video-overlay-line1' );
		this.$videoOverlayLine2 = $( '<div>' ).addClass( 'studio-video-overlay-line2' );
		this.$videoOverlay.append( this.$videoOverlayLine1, this.$videoOverlayLine2 );
		this.$player = $( '<div>' ).addClass( 'studio-video-player' ).append( this.$video, this.$videoOverlay );

		this.$container.prepend( this.$player );

		this.setOverlay( mw.message( 'mwe-recwiz-videostudio-webcamaccess' ).text() );
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

		this.setOverlay( mw.message( 'mwe-recwiz-videostudio-ready' ).text(), mw.message( 'mwe-recwiz-videostudio-clicktostart' ).text() );
	};

	/**
	 * Change the state of a specific word
	 *
	 * @param  {string} line1 First line of text to display in the video overlay
	 * @param  {string} line2 Second line of text to display in the video overlay
	 */
	rw.ui.VideoStudio.prototype.setOverlay = function ( line1, line2 ) {
		this.$videoOverlayLine1.text( line1 );
		this.$videoOverlayLine2.text( line2 );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
