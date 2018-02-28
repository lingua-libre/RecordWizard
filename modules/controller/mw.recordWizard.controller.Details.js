( function ( mw, rw, $, OO ) {
	/**
	 * The Details step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Details = function( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Details(),
			api,
			config
		);

		this.stepName = 'details';
	};

	OO.inheritClass( rw.controller.Details, rw.controller.Step );

	rw.controller.Details.prototype.load = function ( metadatas, records ) {
		rw.controller.Step.prototype.load.call( this, metadatas, records );


        // XXX do stuff
	};

	rw.controller.Details.prototype.moveNext = function () {
		this.ui.collect();

		rw.controller.Step.prototype.moveNext.call( this );
	};

	rw.controller.Details.prototype.movePrevious = function () {
		// XXX do stuff

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );

