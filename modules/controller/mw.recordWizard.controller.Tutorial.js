'use strict';

( function ( mw, rw, $, OO ) {
	/**
	 * The Tutorial step.
	 *
	 * @class rw.controller.Tutorial
	 * @extends mw.recordWizard.controller.Step
	 * @constructor
	 * @param {mw.Api} api     API instance to perform requests
	 * @param {Object} config  RecordWizard config object.
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

	/**
	 * @inheritDoc
	 */
	rw.controller.Tutorial.prototype.load = function () {
		rw.controller.Step.prototype.load.call( this );

		// XXX do stuff
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.Tutorial.prototype.moveNext = function () {
		// XXX do stuff

		rw.controller.Step.prototype.moveNext.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.Tutorial.prototype.movePrevious = function () {
		// XXX do stuff

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
