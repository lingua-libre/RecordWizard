'use strict';

( function ( mw, rw ) {
	/**
	 * @class StateStore
	 * @constructor
	 */
	var StateStore = function () {
		this.data = {
			step: 'tutorial',
			isFrozen: false,
			isBrowserReady: false,
			isPublishing: false
		};

		this.prevStep = {
			tutorial: 'tutorial',
			speaker: 'tutorial',
			details: 'speaker',
			studio: 'details',
			publish: 'studio'
		};
		this.nextStep = {
			tutorial: 'speaker',
			speaker: 'details',
			details: 'studio',
			studio: 'publish',
			publish: 'details'
		};
	};

	StateStore.prototype.movePrev = function () {
		this.data.step = this.prevStep[ this.data.step ];
	};

	StateStore.prototype.moveNext = function () {
		this.data.step = this.nextStep[ this.data.step ];
	};

	StateStore.prototype.freeze = function () {
		this.data.isFrozen = true;
	};

	StateStore.prototype.unfreeze = function () {
		this.data.isFrozen = false;
	};

	rw.store.state = new StateStore();

}( mediaWiki, mediaWiki.recordWizard ) );
