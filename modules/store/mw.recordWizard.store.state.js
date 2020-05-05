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
			isPublishing: false,
		};
	};

	StateStore.prototype.moveNext = function () {
		switch( this.data.step ) {
			case 'tutorial':
				this.data.step = 'locutor';
				break;
			case 'locutor':
				this.data.step = 'details';
				break;
			case 'details':
				this.data.step = 'studio';
				break;
			case 'studio':
				this.data.step = 'publish';
				break;
			case 'publish':
				this.data.step = 'details';
				break;
		}
	};

	StateStore.prototype.movePrev = function () {
		switch( this.data.step ) {
			case 'tutorial':
				this.data.step = 'tutorial';
				break;
			case 'locutor':
				this.data.step = 'tutorial';
				break;
			case 'details':
				this.data.step = 'locutor';
				break;
			case 'studio':
				this.data.step = 'details';
				break;
			case 'publish':
				this.data.step = 'studio';
				break;
		}
	};

	StateStore.prototype.freeze = function () {
		this.data.isFrozen = true;
	};

	StateStore.prototype.unfreeze = function () {
		this.data.isFrozen = false;
	};

	rw.store.state = new StateStore();

}( mediaWiki, mediaWiki.recordWizard ) );
