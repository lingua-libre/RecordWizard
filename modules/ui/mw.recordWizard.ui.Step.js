'use strict';

( function ( mw, $, rw, OO ) {
	/**
	 * Represents a generic UI for a step.
	 *
	 * @class rw.ui.Step
	 * @mixins OO.EventEmitter
	 * @abstract
	 * @constructor
	 * @param {string} name The name of this step
	 * @param {bool} isVirtual Set this to true to hide this step from the arrow bar
	 */
	rw.ui.Step = function ( name, isVirtual ) {
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

		if ( isVirtual !== true ) {
			$( '#mwe-recwiz-content' ).append( this.$container );
		}

		// this will make sure that buttons will only be added if they've been
		// set in the controller, otherwise there's nowhere to go...
		this.nextButtonPromise = $.Deferred();
		this.previousButtonPromise = $.Deferred();
	};

	OO.mixinClass( rw.ui.Step, OO.EventEmitter );

	/**
	 * Initialize this step.
	 */
	rw.ui.Step.prototype.load = function () {
		var offset = $( 'h1:first' ).offset();

		this.movedFrom = false;

		this.$container
			.append( this.$buttons )
			.show();
		this.$arrow.addClass( 'mwe-recwiz-current' );

		this.$buttons.show();
		$( '#mwe-recwiz-spinner' ).hide();

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

	/**
	 * Enable the 'next' button, whenever it is added to the UI.
	 */
	rw.ui.Step.prototype.enableNextButton = function () {
		this.nextButtonPromise.resolve();
	};

	/**
	 * Enable the 'previous' button, whenever it is added to the UI.
	 */
	rw.ui.Step.prototype.enablePreviousButton = function () {
		this.previousButtonPromise.resolve();
	};

	/**
	 * Add a 'next' button to the step's button container
	 */
	rw.ui.Step.prototype.addNextButton = function () {
		var ui = this;

		this.stateLabel = new OO.ui.LabelWidget( { label: '' } ).toggle();

		this.retryButton = new OO.ui.ButtonWidget( {
			label: mw.message( 'mwe-recwiz-retry' ).text(),
			flags: [ 'progressive' ]
		} ).on( 'click', function () {
			ui.emit( 'retry-click' );
		} ).toggle();

		this.nextButton = new OO.ui.ButtonWidget( {
			label: mw.message( 'mwe-recwiz-next' ).text(),
			flags: [ 'progressive', 'primary' ]
		} ).on( 'click', function () {
			ui.emit( 'next-step' );
		} );

		this.nextLayout = new OO.ui.HorizontalLayout( {
			classes: [ 'mwe-recwiz-button-next', 'mwe-recwiz-right' ],
			items: [
				this.stateLabel,
				this.retryButton,
				this.nextButton
			]
		} );

		this.nextButtonPromise.done( function () {
			ui.$buttons.append( ui.nextLayout.$element );
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

	/**
	 * Replace the current step's UI with a spinner.
	 */
	rw.ui.Step.prototype.lockUI = function () {
		this.$container.children().hide();
		$( '#mwe-recwiz-spinner' ).show();
	};

	/**
	 * Replace the spinner with the current step's UI.
	 */
	rw.ui.Step.prototype.unlockUI = function () {
		$( '#mwe-recwiz-spinner' ).hide();
		this.$container.children().show();
	};
}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
