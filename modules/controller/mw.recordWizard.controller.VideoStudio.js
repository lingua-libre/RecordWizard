'use strict';

( function ( mw, rw, $, OO ) {
	/**
	 * The VideoStudio step.
	 *
	 * @class rw.controller.VideoStudio
	 * @extends mw.recordWizard.controller.Step
	 * @constructor
	 * @param {mw.Api} api     API instance to perform requests
	 * @param {Object} config  RecordWizard config object.
	 */
	rw.controller.VideoStudio = function ( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Studio(),
			api,
			config
		);

		this.stepName = 'videostudio';
	};

	OO.inheritClass( rw.controller.VideoStudio, rw.controller.Step );

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.load = function () {
		rw.controller.Step.prototype.load.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.unload = function () {
		rw.controller.Step.prototype.unload.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.moveNext = function ( skipFirstWarning ) {
		rw.controller.Step.prototype.moveNext.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.VideoStudio.prototype.movePrevious = function () {
		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
