'use strict';

( function ( mw, rw ) {
	/**
	 * The Details step.
	 */
	rw.vue.details = new Vue( {
		mixins: [ rw.vue.step ],

		/* Data */
		data: {
			metadata: rw.store.record.data.metadata,
			words: rw.store.record.data.words,
			generators: rw.store.generator.data,
			wordInputed: '',
			availableLanguages: [],
			randomise: false
		},

		/* Hooks */
		created: function () {
			var i;

			this.$windowManager = new OO.ui.WindowManager();
			$( document.body ).append( this.$windowManager.$element );

			for ( i = 0; i < this.generators.length; i++ ) {
				this.$windowManager.addWindows( [ rw.store.generator.dialogs[ i ] ] );
			}
		},

		/* Methods */
		watch: {
			'state.step': function () {
				var qid, defaultLanguage;

				if ( this.state.step === 'details' ) {
					/* Update available languages on step load */
					this.availableLanguages = [];
					for ( qid in this.metadata.speaker.languages ) {
						this.availableLanguages.push( {
							data: qid,
							label: this.config.languages[ qid ].localname
						} );
					}

					/* Ensure Language is correctly set */
					if ( this.metadata.language === undefined || this.metadata.language === '' || this.metadata.speaker.languages[ this.metadata.language ] === undefined ) {
						this.metadata.language = this.availableLanguages[ 0 ].data;
					}

					/* Setup everything language-related with the default language */
					this.setupCurrentLanguage();
				}
			}
		},
		methods: {
			clearAll: function () {
				rw.store.record.clearAllRecords();
			},
			clear: function ( word ) {
				rw.store.record.clearRecord( word );
			},
			deduplicate: function () {
				var i,
					pastRecords = this.config.pastRecords[ this.metadata.language ] || [];

				for ( i = 0; i < this.words.length; i++ ) {
					if ( pastRecords.indexOf( this.words[ i ] ) > -1 ) {
						this.words.splice( i, 1 );
						i--; // to compensate the removal of an item
					}
				}
			},
			addWordFromInput: function () {
				rw.store.record.addWords( this.wordInputed.split( '#' ) );
				this.wordInputed = '';
			},
			onLanguageChange: function () {
				this.clearAll();
				this.setupCurrentLanguage();
			},
			setupCurrentLanguage: function () {
				/* Update the media property */
				rw.store.record.updateMediaType();

				/* Async load of past data for current language */
				rw.store.config.fetchPastRecords( this.metadata.language, this.metadata.speaker.qid );
			},
			canMoveNext: function () {
				if ( this.words.length === 0 ) {
					OO.ui.alert( mw.msg( 'mwe-recwiz-error-emptylist' ) );
					return false;
				}

				if ( this.randomise === true ) {
					rw.store.record.randomiseList();
				}

				this.$api.saveOptions( {
					'recwiz-lang': this.metadata.language
				} );

				return true;
			}
		}
	} );

}( mediaWiki, mediaWiki.recordWizard ) );
