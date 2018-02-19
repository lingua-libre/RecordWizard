( function ( mw, rw, $, OO ) {
	/**
	 * The Studio step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Studio = function( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Studio(),
			api,
			config
		);

		this.stepName = 'studio';
	};

	OO.inheritClass( rw.controller.Studio, rw.controller.Step );

	rw.controller.Studio.prototype.load = function ( metadatas, records ) {
		rw.controller.Step.prototype.load.call( this, metadatas, records );

        // XXX do stuff
	};

	rw.controller.Studio.prototype.moveNext = function () {
		// XXX do stuff

		rw.controller.Step.prototype.moveNext.call( this );
	};

	rw.controller.Studio.prototype.movePrevious = function () {
		// XXX do stuff

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );

