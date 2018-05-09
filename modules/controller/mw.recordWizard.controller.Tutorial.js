'use strict';

( function ( mw, rw, $, OO ) {
	/**
	 * The Tutorial step.
	 *
	 * @class rw.controller.Tutorial
	 * @extends mw.recordWizard.controller.Step
	 * @constructor
	 */
	rw.controller.Tutorial = function () {
		rw.controller.Step.call(
			this,
			new rw.ui.Tutorial()
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
