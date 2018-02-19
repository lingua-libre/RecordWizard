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

		this.records = [];

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
	 *
	 * @param {object} metadatas Metadatas concerning the records.
	 * @param {rw.Record[]} records List of records being carried forward.
	 */
	rw.controller.Step.prototype.load = function ( metadatas, records ) {
		var step = this;

		this.emit( 'load' );

		this.records = records || [];
		this.metadatas = metadatas || [];

		// prevent the window from being closed as long as we have data
		this.allowCloseWindow = mw.confirmCloseWindow( {
			message: mw.message( 'mwe-recwiz-prevent-close' ).text(),
			test: step.hasData.bind( this )
		} );

		this.ui.load( metadatas, records );
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
			this.nextStep.load( this.metadatas, this.records );
		}
	};

	/**
	 * Move to the previous step.
	 */
	rw.controller.Step.prototype.movePrevious = function () {
		this.unload();

		if ( this.previousStep ) {
			this.previousStep.load( this.metadatas, this.records );
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
		return this.records.length !== 0;
	};

	/**
	 * Add an upload.
	 *
	 * @param {mw.UploadWizardUpload} upload
	 */
	rw.controller.Step.prototype.addRecord = function ( record ) {
		this.records.push( record );
	};

	/**
	 * Remove a record.
	 *
	 * @param {mw.recordWizard.Record} record
	 */
	rw.controller.Step.prototype.removeUpload = function ( record ) {
		// remove the record from the records array
		var index = this.records.indexOf( record );
		if ( index !== -1 ) {
			this.uploads.splice( index, 1 );
		}

		// let the record object cleanup itself!
		record.remove();
	};

}( mediaWiki, mediaWiki.recordWizard, OO, jQuery ) );
