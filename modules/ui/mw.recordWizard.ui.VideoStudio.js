'use strict';

( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's VideoStudio step.
	 *
	 * @class rw.ui.VideoStudio
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.VideoStudio = function () {
		rw.ui.Step.call(
			this,
			'videostudio'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.VideoStudio, rw.ui.Step );

	/**
	 * @inheritDoc
	 */
	rw.ui.VideoStudio.prototype.load = function () {
		rw.ui.Step.prototype.load.call( this );
	};

	/**
	 * @inheritDoc
	 */
	rw.ui.VideoStudio.prototype.unload = function () {
		rw.ui.Step.prototype.unload.call( this );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
