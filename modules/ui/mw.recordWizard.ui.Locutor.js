( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Locutor step.
	 *
	 * @class rw.ui.Locutor
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Locutor = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'locutor'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Locutor, rw.ui.Step );

	rw.ui.Locutor.prototype.load = function () {
	    var ui = this;

		rw.ui.Step.prototype.load.call( this );

		this.substeps = {
		    locutor: new rw.ui.DetailsLocutor(),
		};

		this.accordion = new rw.layout.AccordionLayout( {
		    items: [
		        this.substeps.locutor,
		    ],
		} );

		this.$container.prepend( this.accordion.$element );
	};

	rw.ui.Locutor.prototype.collect = function() {
	    for ( substep in this.substeps ) {
	        this.substeps[ substep ].collect();
	    }
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

