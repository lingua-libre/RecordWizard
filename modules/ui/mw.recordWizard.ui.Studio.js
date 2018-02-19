( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Studio step.
	 *
	 * @class rw.ui.Studio
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Studio = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'studio'
		);

		// Helpdesk link click
		$( '#mwe-upwiz-studio-helpdesk' ).click( function () {
			ui.emit( 'helpdesk-click' );
		} );

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Studio, rw.ui.Step );

	rw.ui.Studio.prototype.load = function ( metadatas, records ) {
		rw.ui.Step.prototype.load.call( this, metadatas, records );

		this.$container.prepend(
			$( '<div>' )
				.attr( 'id', 'mwe-recwiz-studio' )
				.append(
					$( '<div>' ).text( 'chou!' )
				)
		);
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

