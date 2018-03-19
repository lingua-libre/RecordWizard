( function ( mw, rw, $, OO ) {
	/**
	 * The License step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.License = function( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.License(),
			api,
			config
		);

		this.stepName = 'license';
	};

	OO.inheritClass( rw.controller.License, rw.controller.Step );

	rw.controller.License.prototype.load = function () {
		rw.controller.Step.prototype.load.call( this );

        rw.metadatas.license = '{{cc-by-sa-4.0}}';
	};

	rw.controller.License.prototype.moveNext = function () {
		// XXX do stuff

		rw.controller.Step.prototype.moveNext.call( this );
	};

	rw.controller.License.prototype.movePrevious = function () {
		// XXX do stuff

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );

