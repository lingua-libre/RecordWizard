( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Thanks step.
	 *
	 * @class rw.ui.Thanks
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Thanks = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'thanks'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Thanks, rw.ui.Step );

	rw.ui.Thanks.prototype.load = function ( metadatas, records ) {
		rw.ui.Step.prototype.load.call( this, metadatas, records );

		this.$container.prepend(
			$( '<div>' )
				.attr( 'id', 'mwe-recwiz-thanks' )
				.append(
					$( '<div>' ).text( '' )
				)
		);
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

