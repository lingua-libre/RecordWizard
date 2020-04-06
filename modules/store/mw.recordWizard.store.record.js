'use strict';

( function ( mw, rw ) {
	/**
	 * @class StateStore
	 * @constructor
	 */
	var RecordStore = function () {
		this.data = {
			metadata: {
				language: rw.store.config.savedLanguage,
				license: rw.store.config.savedLicense,
				locutor: {
					gender: '',
					languages: {},
					location: '',
					name: '',
					qid: '',
					main: false,
					new: false,
				},
			},
		};
	};

	RecordStore.prototype.setLocutor = function ( locutor ) {
		this.data.metadata.locutor.gender = locutor.gender;
		Vue.set( this.data.metadata.locutor, 'languages', locutor.languages );
		this.data.metadata.locutor.location = locutor.location;
		this.data.metadata.locutor.name = locutor.name;
		this.data.metadata.locutor.qid = locutor.qid;
		this.data.metadata.locutor.main = locutor.main || false;
		this.data.metadata.locutor.new = locutor.new || locutor.qid === null;
	};


	rw.store.record = new RecordStore();

}( mediaWiki, mediaWiki.recordWizard ) );
