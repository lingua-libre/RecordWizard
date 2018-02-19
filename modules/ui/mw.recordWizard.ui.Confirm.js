( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Confirm step.
	 *
	 * @class rw.ui.Confirm
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Confirm = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'confirm'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Confirm, rw.ui.Step );

	rw.ui.Confirm.prototype.load = function ( metadatas, records ) {
		rw.ui.Step.prototype.load.call( this, metadatas, records );

		this.$container.prepend(
			$( '<div>' )
				.attr( 'id', 'mwe-recwiz-confirm' )
				.append(
					$( '<div>' ).text( '' )
				)
		);
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

