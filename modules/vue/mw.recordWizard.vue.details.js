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
			 generators: rw.store.generator.data,
			 wordInputed: '',
			 availableLanguages: [],
		 },

		 /* Hooks */
		 created: function() {
			 var i;

	 		this.$windowManager = new OO.ui.WindowManager();
			$( 'body' ).append( this.$windowManager.$element );

			for( i = 0; i < this.generators.length; i++ ) {
	 			this.$windowManager.addWindows( [ this.generators[ i ].dialog ] );
			}
		 },
		 mounted: function() {

		 },
		 beforeUpdate: function() {

		 },
		 updated: function() {

		 },

		 /* Methods */
		 watch: {
			 'state.step': function() {
				 if ( this.state.step !== 'details' ) {
					 return;
				 }

				 /* Update available languages on step load */
				 var qid,
				 	languages = [];

				for ( qid in this.metadata.locutor.languages ) {
					languages.push( {
						data: qid,
						label: this.config.languages[ qid ].localname,
					} );
				}

				this.availableLanguages = languages;

				/* Async load of past data for current language */
				rw.store.config.fetchPastRecords( this.metadata.language || this.availableLanguages[ 0 ].data, this.metadata.locutor.qid );
			 },
		 },
		 methods: {
			 clear: function() {
				 this.words.splice( 0, this.words.length ); //to preserve the reference
			 },
			 deduplicate: function() {
				var i,
					pastRecords = this.config.pastRecords[ this.metadata.language ] || [];

				for ( i = 0; i < this.words.length; i++ ) {
					if ( pastRecords.indexOf( this.words[ i ] ) > -1 ) {
						this.words.splice( i, 1 );
						i--; // to compensate the removal of an item
					}
				}
			 },
			 addWordFromInput: function() {
				 rw.store.record.addWords( this.wordInputed.split( '#' ) );
				 this.wordInputed = '';
			 },
			 onLanguageChange: function() {
				 /* Clear all items from list */
				 this.clear();

				 /* Async load of past data for current language */
				 rw.store.config.fetchPastRecords( this.metadata.language, this.metadata.locutor.qid );
			 },
		 }
	 } );

}( mediaWiki, mediaWiki.recordWizard ) );
