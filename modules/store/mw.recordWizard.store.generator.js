'use strict';

( function ( mw, rw ) {
	/**
	 * @class GeneratorStore
	 * @constructor
	 */
	var GeneratorStore = function () {
		this.data = [];
		this.generic = null;
	};

	GeneratorStore.prototype.register = function ( name, title, icon, dialog ) {
		this.data.push( {
			name: name,
			title: title,
			icon: icon || 'add',
			dialog: dialog,
		} );
	};

	rw.store.generator = new GeneratorStore();

}( mediaWiki, mediaWiki.recordWizard ) );
