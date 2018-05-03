'use strict';

( function ( mw, rw, $, OO ) {
	/**
	 * The Tutorial step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Tutorial = function ( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Tutorial(),
			api,
			config
		);

		this.stepName = 'tutorial';
	};

	OO.inheritClass( rw.controller.Tutorial, rw.controller.Step );

	rw.controller.Tutorial.prototype.load = function () {
		rw.controller.Step.prototype.load.call( this );

		// XXX do stuff
	};

	rw.controller.Tutorial.prototype.moveNext = function () {
		// XXX do stuff

		rw.controller.Step.prototype.moveNext.call( this );
	};

	rw.controller.Tutorial.prototype.movePrevious = function () {
		// XXX do stuff

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
