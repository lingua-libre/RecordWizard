'use strict';

( function ( mw, rw ) {
	/**
	 * The Details step.
	 */
	 rw.vue.details = new Vue( {
		 mixins: [rw.vue.step],

		 /* Data */
		 data: {
			 metadata: rw.store.record.data.metadata,
			 words: rw.store.record.data.words,
			 wordInputed: '',
		 },

		 /* Hooks */
		 created: function() {

		 },
		 mounted: function() {

		 },
		 beforeUpdate: function() {

		 },
		 updated: function() {

		 },

		 /* Methods */
		 computed: {
			 availableLanguages: function() {
				 var qid,
				 	languages = [];

				for ( qid in this.metadata.locutor.languages ) {
					languages.push( {
						data: qid,
						label: this.config.languages[ qid ].localname,
					} );
				}

				return languages;
			 },
		 },
		 methods: {
			 clear: function() {
				 this.words.splice( 0, this.words.length ); //to preserve the reference
			 },

			 addWordFromInput: function() {
				 var i,
				 	words = this.wordInputed.split( '#' );

				 for ( i = 0; i < words.length; i++ ) {
					 this.words.push( words[ i ] );
				 }

				 this.wordInputed = '';
			 },
		 }
	 } );

}( mediaWiki, mediaWiki.recordWizard ) );
