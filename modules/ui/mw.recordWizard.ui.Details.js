( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Details step.
	 *
	 * @class rw.ui.Details
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Details = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'details'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Details, rw.ui.Step );

	rw.ui.Details.prototype.load = function ( metadatas, records ) {
	    var ui = this;

		rw.ui.Step.prototype.load.call( this, metadatas, records );

		this.substeps = {};
		this.substeps.locutor = new rw.ui.DetailsLocutor();
		this.substeps.param = new rw.ui.DetailsParam();
		this.substeps.generator = new rw.ui.DetailsGenerator();


        this.substeps.locutor.on( 'expand', function() {
            ui.substeps.param.collapse();
            ui.substeps.generator.collapse();
        } );
        this.substeps.param.on( 'expand', function() {
            ui.substeps.locutor.collapse();
            ui.substeps.generator.collapse();
        } );
        this.substeps.generator.on( 'expand', function() {
            ui.substeps.locutor.collapse();
            ui.substeps.param.collapse();
        } );

		this.$container
		    .prepend( this.substeps.generator.$element )
		    .prepend( this.substeps.param.$element )
		    .prepend( this.substeps.locutor.$element );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

