( function ( mw, rw, $, OO ) {
	/**
	 * The Confirm step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Confirm = function( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Confirm(),
			api,
			config
		);

		this.stepName = 'confirm';
	};

	OO.inheritClass( rw.controller.Confirm, rw.controller.Step );

	rw.controller.Confirm.prototype.load = function ( metadatas, records ) {
		rw.controller.Step.prototype.load.call( this, metadatas, records );

        // XXX do stuff
	};

	rw.controller.Confirm.prototype.moveNext = function () {
		// XXX do stuff

		rw.controller.Step.prototype.moveNext.call( this );
	};

	rw.controller.Confirm.prototype.movePrevious = function () {
		// XXX do stuff

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
