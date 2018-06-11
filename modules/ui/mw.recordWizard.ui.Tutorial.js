'use strict';

( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Tutorial step.
	 *
	 * @class rw.ui.Tutorial
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Tutorial = function () {
		var ui = this;

		rw.ui.Step.call(
			this,
			'tutorial'
		);

		// Helpdesk link click
		$( '#mwe-upwiz-tutorial-helpdesk' ).click( function () {
			ui.emit( 'helpdesk-click' );
		} );

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Tutorial, rw.ui.Step );

	/**
	 * @inheritDoc
	 */
	rw.ui.Tutorial.prototype.load = function () {
		var $volumeBar;

		rw.ui.Step.prototype.load.call( this );

		this.reopenPopupButton = new OO.ui.ButtonWidget( {
			label: mw.msg( 'mwe-recwiz-tutorial-reopenpopup' ),
		} );

		this.volumeMeter = new OO.ui.ProgressBarWidget( {
			progress: 4
		} );

		this.$activateMessage = $( '<div>' )
			.attr( 'id', 'mwe-recwiz-tutorial-activate' )
			.append( this.parseMessage( mw.message( 'mwe-recwiz-tutorial-activate' ).parse() ) );
		this.$buttons.append( this.reopenPopupButton.$element );

		this.$configureMessage = $( '<div>' )
			.attr( 'id', 'mwe-recwiz-tutorial-configure' )
			.append( this.parseMessage( mw.message( 'mwe-recwiz-tutorial-configure' ).parse() ) )
			.hide();
		this.nextButton.$element.hide();

		$volumeBar = this.$configureMessage.find( '#mwe-recwiz-tutorial-volumebar' );
		if ( $volumeBar.length > 0 ) {
			$volumeBar.append( this.volumeMeter.$element );
		} else {
			this.$configureMessage.append( this.volumeMeter.$element );
		}

		this.$container.prepend( this.$activateMessage );
		this.$container.prepend( this.$configureMessage );

		this.reopenPopupButton.on( 'click', this.emit.bind( this, 'reopen-audiostream-popup' ) );
	};

	/**
	 *
	 */
	rw.ui.Tutorial.prototype.parseMessage = function ( wikicode ) {
		return wikicode
			.replace( /&lt;/g, '<' )
			.replace( /&gt;/g, '>' )
			.replace( /<volumebar\/ ?>/g, '<div id="mwe-recwiz-tutorial-volumebar"></div>' );
	};

	/**
	 *
	 */
	rw.ui.Tutorial.prototype.switchMessage = function () {
		this.$activateMessage.hide();
		this.reopenPopupButton.$element.hide();
		this.$configureMessage.show();
		this.nextButton.$element.show();
	};

	/**
	 *
	 *
	 * @private
	 * @param  {Float32Array} samples Sound samples of the audio recorded since
	 *                                last call
	 */
	rw.ui.Tutorial.prototype.animateVolumeBar = function ( samples ) {
		var i, amplitude, progress, barClass,
			amplitudeMax = 0;
		for ( i = 0; i < samples.length; i++ ) {
			amplitude = Math.abs( samples[ i ] );
			if ( amplitude > amplitudeMax ) {
				amplitudeMax = amplitude;
			}
		}

		if ( amplitudeMax <= 0.05 ) {
			barClass = 'mwe-recwiz-volumeMetter-silent';
		} else if ( amplitudeMax <= 0.9 ) {
			barClass = 'mwe-recwiz-volumeMetter-active';
		} else {
			barClass = 'mwe-recwiz-volumeMetter-saturate';
		}

		progress = amplitudeMax * 100 + 4; // +4 to avoid empty bar
		this.volumeMeter.setProgress( progress );

		this.volumeMeter.$element.find( '.oo-ui-progressBarWidget-bar' )
			.removeClass( 'mwe-recwiz-volumeMetter-silent mwe-recwiz-volumeMetter-active mwe-recwiz-volumeMetter-saturate' )
			.addClass( barClass );
	};

	/**
	 * Show a alert popup when we can't access to the microphone.
	 *
	 * @param  {DOMException} mediaStreamError error Object
	 */

	rw.ui.Tutorial.prototype.showError = function ( mediaStreamError ) {
		var message = mw.msg( 'mwe-recwiz-error-mediastream-unknow' ),
			errorMessageAssociation = {
				AbortError: 'mwe-recwiz-error-mediastream-technical',
				NotAllowedError: 'mwe-recwiz-error-mediastream-notallowed',
				NotFoundError: 'mwe-recwiz-error-mediastream-notfound',
				NotReadableError: 'mwe-recwiz-error-mediastream-technical',
				OverconstrainedError: 'mwe-recwiz-error-mediastream-notfound',
				SecurityError: 'mwe-recwiz-error-mediastream-technical'
			};

		if ( typeof mediaStreamError.name === 'string' ) {
			if ( errorMessageAssociation[ mediaStreamError.name ] !== undefined ) {
				message = mw.msg( errorMessageAssociation[ mediaStreamError.name ] );
			}
		}

		if ( typeof mediaStreamError.message === 'string' ) {
			message = message.replace( /\$1/g, mediaStreamError.message );
		}

		OO.ui.alert( message );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
