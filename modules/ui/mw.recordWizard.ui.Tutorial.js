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

		this.microphoneTesterStart = new OO.ui.ButtonWidget( {
			label: mw.msg( 'mwe-recwiz-tutorial-mictester-start' )
		} );

		this.$microphoneTesterRecording = $( '<div>' )
			.addClass( 'mwe-recwiz-tutorial-mictester-state' )
			.append( mw.msg( 'mwe-recwiz-tutorial-mictester-recording' ) )
			.hide();

		this.$microphoneTesterPlaying = $( '<div>' )
			.addClass( 'mwe-recwiz-tutorial-mictester-state' )
			.append( mw.msg( 'mwe-recwiz-tutorial-mictester-playing' ) )
			.hide();

		this.$microphoneTesterWaiting = $( '<div>' )
			.addClass( 'mwe-recwiz-tutorial-mictester-state' )
			.append( $( '<img src="' + mw.config.get( 'wgExtensionAssetsPath' ) + '/RecordWizard/modules/images/Spinner_font_awesome.svg" width="40" height="40" class="mwe-recwiz-spinner" />' ) )
			.append( mw.msg( 'mwe-recwiz-tutorial-mictester-waiting' ) )
			.hide();

		this.$microphoneTester = $( '<div>' )
			.attr( 'id', 'mwe-recwiz-tutorial-mictester' )
			.append( this.microphoneTesterStart.$element )
			.append( this.$microphoneTesterRecording )
			.append( this.$microphoneTesterPlaying )
			.append( this.$microphoneTesterWaiting )
			.append(
				$( '<div>' )
					.addClass( 'mwe-recwiz-tutorial-mictester-help' )
					.append( mw.msg( 'mwe-recwiz-tutorial-mictester-help1' ) )
					.append(
						$( '<ol>' )
							.append( $( '<li>' ).text( mw.msg( 'mwe-recwiz-tutorial-mictester-help2' ) ) )
							.append( $( '<li>' ).text( mw.msg( 'mwe-recwiz-tutorial-mictester-help3' ) ) )
							.append( $( '<li>' ).text( mw.msg( 'mwe-recwiz-tutorial-mictester-help4' ) ) )
					)
					.append( mw.msg( 'mwe-recwiz-tutorial-mictester-help5' ) )
			);

		this.$activateMessage = $( '<div>' )
			.attr( 'id', 'mwe-recwiz-tutorial-activate' )
			.append( $( '<img src="' + mw.config.get( 'wgExtensionAssetsPath' ) + '/RecordWizard/modules/images/microphone_slash_font_awesome.svg" width="40" height="40" class="mwe-recwiz-no-microphone" />' ) )
			.append( mw.message( 'mwe-recwiz-tutorial-activate' ).parse() );
		this.$buttons.append( this.reopenPopupButton.$element );

		this.$configureMessage = $( '<div>' )
			.attr( 'id', 'mwe-recwiz-tutorial-configure' )
			.append( $( '<h3>' ).text( mw.msg( 'mwe-recwiz-tutorial-configure-top' ) ) )
			.append( this.$microphoneTester )
			.append( mw.message( 'mwe-recwiz-tutorial-configure-bottom' ).parse() )
			.hide();
		this.nextButton.$element.hide();

		this.$container.prepend( this.$activateMessage );
		this.$container.prepend( this.$configureMessage );

		this.reopenPopupButton.on( 'click', this.emit.bind( this, 'reopen-audiostream-popup' ) );
		this.microphoneTesterStart.on( 'click', this.emit.bind( this, 'mictester-start' ) );
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
	 */
	rw.ui.Tutorial.prototype.mictesterSwitchState = function ( state ) {
		this.microphoneTesterStart.toggle( false );
		this.$microphoneTesterRecording.hide();
		this.$microphoneTesterPlaying.hide();
		this.$microphoneTesterWaiting.hide();
		switch( state ) {
			case 1:
				this.$microphoneTesterRecording.show();
				break;
			case 2:
				this.$microphoneTesterPlaying.show();
				break;
			case 3:
				this.$microphoneTesterWaiting.show();
				break;
			default:
				this.microphoneTesterStart.toggle( true );
		}
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
