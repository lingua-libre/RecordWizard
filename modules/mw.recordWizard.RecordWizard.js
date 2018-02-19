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
	    this.steps.details = new rw.controller.Details( this.api, this.config );
	    this.steps.license = new rw.controller.License( this.api, this.config );
	    this.steps.studio = new rw.controller.Studio( this.api, this.config );
	    this.steps.confirm = new rw.controller.Confirm( this.api, this.config );
	    this.steps.thanks = new rw.controller.Thanks( this.api, this.config );

	    this.steps.tutorial.setNextStep( this.steps.details );

	    this.steps.details.setPreviousStep( this.steps.tutorial );
	    this.steps.details.setNextStep( this.steps.license );

	    this.steps.license.setPreviousStep( this.steps.details );
	    this.steps.license.setNextStep( this.steps.studio );

	    this.steps.studio.setPreviousStep( this.steps.license );
	    this.steps.studio.setNextStep( this.steps.confirm );

	    this.steps.confirm.setPreviousStep( this.steps.studio );
	    this.steps.confirm.setNextStep( this.steps.thanks );

	    this.steps.thanks.setPreviousStep( this.steps.confirm );
	};


	$( function () {
	    // show page.
	    new rw.RecordWizard( mw.config.get( 'RecordWizardConfig' ) );
    } );


}( mediaWiki, mediaWiki.recordWizard, jQuery ) );

