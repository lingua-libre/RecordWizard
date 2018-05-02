'use strict';

/**
 * Object that represents the entire multi-step Record Wizard
 */
( function ( mw, rw, $ ) {

	rw.RecordWizard = function ( config ) {

		// Shortcut for local references
		rw.config = config;
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
	    this.steps.locutor = new rw.controller.Locutor( this.api, this.config );
	    this.steps.details = new rw.controller.Details( this.api, this.config );
	    this.steps.studio = new rw.controller.Studio( this.api, this.config );
	    this.steps.publish = new rw.controller.Publish( this.api, this.config );

	    this.steps.tutorial.setNextStep( this.steps.locutor );

	    this.steps.locutor.setPreviousStep( this.steps.tutorial );
	    this.steps.locutor.setNextStep( this.steps.details );

	    this.steps.details.setPreviousStep( this.steps.locutor );
	    this.steps.details.setNextStep( this.steps.studio );

	    this.steps.studio.setPreviousStep( this.steps.details );
	    this.steps.studio.setNextStep( this.steps.publish );

	    this.steps.publish.setPreviousStep( this.steps.studio );
	    this.steps.publish.setNextStep( this.steps.details );
	};


	$( function () {
	    // show page.
	    rw.requestQueue = new rw.RequestQueue();
	    rw.recordWizard = new rw.RecordWizard( mw.config.get( 'RecordWizardConfig' ) );
	    $( '#mwe-recwiz-spinner' ).hide();
    } );


}( mediaWiki, mediaWiki.recordWizard, jQuery ) );

