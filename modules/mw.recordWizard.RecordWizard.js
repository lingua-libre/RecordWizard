/**
 * Object that represents the entire multi-step Record Wizard
 */
( function ( mw, rw, $ ) {

	rw.RecordWizard = function ( config ) {

		// Shortcut for local references
		this.config = config;
        this.steps = {};
        this.api = new mw.Api();
        this.createInterface();
	};

	rw.RecordWizard.prototype.createInterface = function() {
	    this.initialiseSteps();
	    this.steps.tutorial.load( null, null );
	};

	rw.RecordWizard.prototype.initialiseSteps = function() {
	    this.steps.tutorial = new rw.controller.Tutorial( this.api, this.config );
	    this.steps.studio = new rw.controller.Studio( this.api, this.config );

	    this.steps.tutorial.setNextStep( this.steps.studio );
	    this.steps.studio.setPreviousStep( this.steps.tutorial );
	};


	$( function () {
	    // show page.
	    new rw.RecordWizard( mw.config.get( 'RecordWizardConfig' ) );
    } );


}( mediaWiki, mediaWiki.recordWizard, jQuery ) );

