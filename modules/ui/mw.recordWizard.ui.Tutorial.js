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
		rw.ui.Step.prototype.load.call( this );

		this.$container.prepend(
			$( '<div>' )
				.attr( 'id', 'mwe-recwiz-tutorial' ).css( 'text-align', 'center' )
				.append( $( '<img>' ).attr( 'src', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/LinguaLibre_LOGO-04_%28cropped%29.png/450px-LinguaLibre_LOGO-04_%28cropped%29.png' ) )
				.append( mw.message( 'mwe-recwiz-tutorial' ).parse() )
		);
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
