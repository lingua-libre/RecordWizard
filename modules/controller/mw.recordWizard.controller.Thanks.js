( function ( mw, rw, $, OO ) {
	/**
	 * The Thanks step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Thanks = function( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Thanks(),
			api,
			config
		);

		this.stepName = 'thanks';
	};

	OO.inheritClass( rw.controller.Thanks, rw.controller.Step );

	rw.controller.Thanks.prototype.load = function ( metadatas, records ) {
		rw.controller.Step.prototype.load.call( this, metadatas, records );

        // XXX do stuff
	};

	rw.controller.Thanks.prototype.moveNext = function () {
		// XXX do stuff

		rw.controller.Step.prototype.moveNext.call( this );
	};

	rw.controller.Thanks.prototype.movePrevious = function () {
		// XXX do stuff

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );

