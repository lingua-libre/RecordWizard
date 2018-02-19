( function ( mw, $, rw, OO ) {
	/**
	 * Represents a generic UI for a step.
	 *
	 * @class rw.ui.Step
	 * @mixins OO.EventEmitter
	 * @constructor
	 * @param {string} name The name of this step
	 */
	rw.ui.Step = function( name ) {
		OO.EventEmitter.call( this );

		this.name = name;

		this.$buttons = $( '<div>' ).addClass( 'mwe-recwiz-buttons' );

		this.$container = $( '<div>' )
			.attr( 'id', 'mwe-recwiz-stepdiv-' + this.name )
			.addClass( 'mwe-recwiz-stepdiv' )
			.hide();

	    this.$arrow = $( '<li>' )
	        .text( mw.message( 'mwe-recwiz-step-' + name ).text() )
	        .appendTo( '.mwe-recwiz-steps' );

		$( '#mwe-recwiz-content' ).append( this.$container );

		// this will make sure that buttons will only be added if they've been
		// set in the controller, otherwise there's nowhere to go...
		this.nextButtonPromise = $.Deferred();
		this.previousButtonPromise = $.Deferred();
	};

	OO.mixinClass( rw.ui.Step, OO.EventEmitter );

	/**
	 * Initialize this step.
	 *
	 * @param {mw.UploadWizardUpload[]} uploads
	 */
	rw.ui.Step.prototype.load = function ( metadatas, records ) {
		var offset = $( 'h1:first' ).offset();

		this.movedFrom = false;

		this.metadatas = metadatas;
		this.records = records;
		this.$container
			.append( this.$buttons )
		    .show();
		this.$arrow.addClass( 'mwe-recwiz-current' );

		$( 'html, body' ).animate( {
			scrollTop: offset.top,
			scrollLeft: offset.left
		}, 'slow' );
	};

	/**
	 * Cleanup this step.
	 */
	rw.ui.Step.prototype.unload = function () {
		this.movedFrom = true;

		this.$arrow.removeClass( 'mwe-recwiz-current' );
		this.$container.children().detach();
	};

	rw.ui.Step.prototype.enableNextButton = function () {
		this.nextButtonPromise.resolve();
	};

	rw.ui.Step.prototype.enablePreviousButton = function () {
		this.previousButtonPromise.resolve();
	};

	/**
	 * Add a 'next' button to the step's button container
	 */
	rw.ui.Step.prototype.addNextButton = function () {
		var ui = this;

		this.nextButton = new OO.ui.ButtonWidget( {
			classes: [ 'mwe-recwiz-button-next' ],
			label: mw.message( 'mwe-recwiz-next' ).text(),
			flags: [ 'progressive', 'primary' ]
		} ).on( 'click', function () {
			ui.emit( 'next-step' );
		} );

		this.nextButtonPromise.done( function () {
			ui.$buttons.append( ui.nextButton.$element );
		} );
	};

	/**
	 * Add a 'previous' button to the step's button container
	 */
	rw.ui.Step.prototype.addPreviousButton = function () {
		var ui = this;

		this.previousButton = new OO.ui.ButtonWidget( {
			classes: [ 'mwe-recwiz-button-previous' ],
			label: mw.message( 'mwe-recwiz-previous' ).text()
		} ).on( 'click', function () {
			ui.emit( 'previous-step' );
		} );

		this.previousButtonPromise.done( function () {
			ui.$buttons.append( ui.previousButton.$element );
		} );
	};
}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
