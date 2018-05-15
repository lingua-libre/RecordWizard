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

		this.getAudioStream();
		this.ui.on( 'reopen-audiostream-popup', this.getAudioStream.bind( this ) );
	};

	/**
	 *
	 */
	rw.controller.Tutorial.prototype.getAudioStream = function () {
		var controller = this;

		// Cleanup previous recorder instance when we click on the button
		// to reopen the popup
		this.unloadRecorder();

		this.recorder = new rw.libs.LinguaRecorder();

		this.recorder.on( 'ready', function () {
			controller.ui.switchMessage();
			controller.recorder.start();
			controller.recorder.on( 'recording', controller.ui.animateVolumeBar.bind( controller.ui ) );
		} );
		this.recorder.on( 'readyFail', this.ui.showError.bind( this.ui ) );
	};

	/**
	 *
	 */
	rw.controller.Tutorial.prototype.unloadRecorder = function () {
		if ( this.recorder === undefined || this.recorder === null ) {
			return;
		}

		this.recorder.stop();
		this.recorder.off( 'ready' );
		this.recorder.off( 'recording' );
		this.recorder = null;
	};

	/**
	 * @inheritDoc
	 */
	rw.controller.Tutorial.prototype.unload = function () {
		rw.controller.Step.prototype.unload.call( this );

		this.unloadRecorder();
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
