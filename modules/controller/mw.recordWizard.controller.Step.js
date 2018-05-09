'use strict';

( function ( mw, rw, OO, $ ) {
	/**
	 * Represents a step in the wizard.
	 *
	 * @class rw.controller.Step
	 * @mixins OO.EventEmitter
	 * @abstract
	 * @constructor
	 * @param {mw.recorWizard.ui.Step} ui The UI object that controls this step
	 * @param {mw.Api} api                API instance to perform requests
	 * @param {Object} config             RecordWizard config object
	 */
	rw.controller.Step = function ( ui, api, config ) {
		var step = this;

		OO.EventEmitter.call( this );

		/**
		 * @property {mw.Api} api
		 */
		this.api = api;

		this.ui = ui;

		this.config = config;

		this.ui.on( 'next-step', function () {
			step.moveNext();
		} );

		this.ui.on( 'previous-step', function () {
			step.movePrevious();
		} );

		/**
		 * @property {rw.controller.Step} nextStep
		 * The next step in the process.
		 */
		this.nextStep = null;

		/**
		 * @property {rw.controller.Step} previousStep
		 * The previous step in the process.
		 */
		this.previousStep = null;
	};

	OO.mixinClass( rw.controller.Step, OO.EventEmitter );

	/**
	 * Set the next step in the process.
	 *
	 * @param {rw.controller.Step} step
	 */
	rw.controller.Step.prototype.setNextStep = function ( step ) {
		this.nextStep = step;
		this.ui.enableNextButton();
	};

	/**
	 * Set the previous step in the process.
	 *
	 * @param {rw.controller.Step} step
	 */
	rw.controller.Step.prototype.setPreviousStep = function ( step ) {
		this.previousStep = step;
		this.ui.enablePreviousButton();
	};

	/**
	 * Initialize this step.
	 */
	rw.controller.Step.prototype.load = function () {
		var step = this;

		this.emit( 'load' );

		rw.records = rw.records || {};
		rw.metadatas = rw.metadatas || {};

		// prevent the window from being closed as long as we have data
		this.allowCloseWindow = mw.confirmCloseWindow( {
			message: mw.message( 'mwe-recwiz-prevent-close' ).text(),
			test: step.hasData.bind( this )
		} );

		this.ui.load();
	};

	/**
	 * Cleanup this step.
	 */
	rw.controller.Step.prototype.unload = function () {
		this.allowCloseWindow.release();
		this.ui.unload();

		this.emit( 'unload' );
	};

	/**
	 * Move to the next step.
	 */
	rw.controller.Step.prototype.moveNext = function () {
		this.unload();

		if ( this.nextStep ) {
			this.nextStep.load();
		}
	};

	/**
	 * Move to the previous step.
	 */
	rw.controller.Step.prototype.movePrevious = function () {
		this.unload();

		if ( this.previousStep ) {
			this.previousStep.load();
		}
	};

	/**
	 * Check if this step has data, to test if the window can be close (i.e. if
	 * content is going to be lost)
	 *
	 * @return {boolean} Wether the step has data or not
	 */
	rw.controller.Step.prototype.hasData = function () {
		var word;

		for ( word in rw.records ) {
			if ( rw.records[ word ].hasData() ) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Remove all the records objects from the list that has no audio file.
	 */
	rw.controller.Step.prototype.removeWaitingRecords = function () {
		var word, state;

		for ( word in rw.records ) {
			state = rw.records[ word ].getState();
			if ( state === 'up' ) {
				rw.records[ word ].remove();
				delete rw.records[ word ];
			}
		}
	};

	/**
	 * Remove all the records objects from the list whose requests are pending.
	 */
	rw.controller.Step.prototype.removePendingRecords = function () {
		var word, state;

		for ( word in rw.records ) {
			state = rw.records[ word ].getState();
			if ( [ 'stashing', 'uploading', 'finalizing' ].indexOf( state ) > -1 ) {
				rw.records[ word ].remove();
				delete rw.records[ word ];
			}
		}
	};

	/**
	 * Remove all records objects from the list that has encountered an error.
	 */
	rw.controller.Step.prototype.removeFailedRecords = function () {
		var word;

		for ( word in rw.records ) {
			if ( rw.records[ word ].hasFailed() ) {
				rw.records[ word ].remove();
				delete rw.records[ word ];
			}
		}
	};

	/**
	 * Change the state of a specific word and track this change.
	 *
	 * @param  {string} word      textual transcription of the word to change state
	 * @param  {string} state     new state to switch the word to
	 * @param  {string} prevState previous state of the word, for tracking purpose
	 */
	rw.controller.Step.prototype.switchState = function ( word, state, prevState ) {
		if ( prevState !== 'up' ) {
			rw.metadatas.statesCount[ prevState ]--;
		}
		rw.metadatas.statesCount[ state ]++;
		this.ui.setItemState( word, state );
	};

}( mediaWiki, mediaWiki.recordWizard, OO, jQuery ) );
