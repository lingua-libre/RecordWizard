( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's License step.
	 *
	 * @class rw.ui.License
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.License = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'license'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.License, rw.ui.Step );

	rw.ui.License.prototype.load = function () {
		rw.ui.Step.prototype.load.call( this );

		this.$container.prepend(
			$( '<div>' )
				.attr( 'id', 'mwe-recwiz-license' )
				.append(
					$( '<div>' ).text( '' )
				)
		);
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

