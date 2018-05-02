'use strict';

( function ( mw, rw, OO, $ ) {
	/**
	 * Represents a step in the wizard.
	 *
	 * @class
	 * @mixins OO.EventEmitter
	 * @abstract
	 * @param {mw;recorWizard.ui.Step} ui The UI object that controls this step.
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Step = function( ui, api, config ) {
		var step = this;

		OO.EventEmitter.call( this );

		/**
		 * @property {mw.Api} api
		 */
		this.api = api;

		this.ui = ui;

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
		var step = this;

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
	 * Check if upload is able to be put through this step's changes.
	 *
	 * @return {boolean}
	 */
	rw.controller.Step.prototype.canTransition = function () {
		return true;
	};

	/**
	 * Check if this step has data, to test if the window can be close (i.e. if
	 * content is going to be lost)
	 *
	 * @return {boolean}
	 */
	rw.controller.Step.prototype.hasData = function () {
		for ( var word in rw.records ) {
			if ( rw.records[ word ].hasData() ) {
				return true;
			}
		}
		return false;
	};

	rw.controller.Step.prototype.removeWaitingRecords = function() {
	    for ( var word in rw.records ) {
	        var state = rw.records[ word ].getState();
	        if ( state === 'up' ) {
	            rw.records[ word ].remove();
	            delete rw.records[ word ];
	        }
	    }
	};

	rw.controller.Step.prototype.removePendingRecords = function() {
	    for ( var word in rw.records ) {
	        var state = rw.records[ word ].getState();
	        if ( [ 'stashing', 'uploading', 'finalizing' ].indexOf( state ) > -1 ) {
	            rw.records[ word ].remove();
	            delete rw.records[ word ];
	        }
	    }
	};

	rw.controller.Step.prototype.removeFailedRecords = function() {
	    for ( var word in rw.records ) {
	        if ( rw.records[ word ].hasFailed() ) {
	            rw.records[ word ].remove();
	            delete rw.records[ word ];
	        }
	    }
	};

    rw.controller.Step.prototype.switchState = function( word, state, prevState ) {
        console.log( prevState + '-' + state );
        if ( prevState !== 'up' ) {
            rw.metadatas.statesCount[ prevState ]--;
        }
        rw.metadatas.statesCount[ state ]++;
        this.ui.setItemState( word, state );
    };

}( mediaWiki, mediaWiki.recordWizard, OO, jQuery ) );
