( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Tutorial step.
	 *
	 * @class rw.ui.Tutorial
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Tutorial = function() {
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

	rw.ui.Tutorial.prototype.load = function () {
		rw.ui.Step.prototype.load.call( this );

		this.$container.prepend(
			$( '<div>' )
				.attr( 'id', 'mwe-recwiz-tutorial' )
				.append(
					$( '<div>' ).text( 'patate!' )
				)
		);
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

