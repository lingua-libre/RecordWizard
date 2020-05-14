'use strict';

( function ( mw, rw ) {
	/**
	 * The Publish step.
	 */
	rw.vue.publish = new Vue( {
		mixins: [
			rw.vue.step,
			rw.vue.list
		],

		/* Data */
		data: {
			metadata: rw.store.record.data.metadata,
			status: rw.store.record.data.status,
			errors: rw.store.record.data.errors,
			statusCount: rw.store.record.data.statusCount,
			checkboxes: rw.store.record.data.checkboxes,
			forceUpdate: 0
		},

		/* Hooks */
		created: function () {
			this.$records = rw.store.record.data.records;
			this.autoScroll = false;
			this.$wordsShortlist = [];
		},

		/* Methods */
		watch: {
			'state.step': function () {
				var i;

				if ( this.state.step === 'publish' ) {
					// Ugly hack to force Vue.js to recompute some computed properties
					// otherwise the total property is not recomputed when
					// navigating back and forth between steps
					this.forceUpdate++;

					// Chose the right media player (this has to be done before selecting the first item)
					if ( this.metadata.media === 'audio' ) {
						this.$selector = '#mwe-rwp-core audio';
					} else {
						this.$selector = '#mwe-rwp-core video';
					}

					// Compute the shortlist
					this.$wordsShortlist = [];
					for ( i = 0; i < this.words.length; i++ ) {
						if ( this.isSelectable( this.words[ i ] ) === true ) {
							this.$wordsShortlist.push( this.words[ i ] );
						}
					}

					// Select the first word in the list
					this.initSelection();
				}
			}
		},
		computed: {
			mediaUrl: function () {
				return this.$records[ this.words[ this.selected ] ].getMediaUrl();
			},
			total: function () {
				var i,
					total = 0;

				this.forceUpdate++;

				for ( i = 0; i < this.$wordsShortlist.length; i++ ) {
					if ( this.checkboxes[ this.$wordsShortlist[ i ] ] === true ) {
						total++;
					}
				}

				return total;
			}
		},
		methods: {
			isSelectable: function ( word ) {
				if ( [ 'up', 'ready', 'stashing' ].indexOf( this.status[ word ] ) > -1 ) {
					return false;
				}

				return true;
			},
			beforeSelectionChange: function () {
				this.stopPlaying();
			},
			startPlaying: function () {
				$( this.$selector )[ 0 ].play();
			},
			stopPlaying: function () {
				if ( $( this.$selector ).length > 0 ) {
					$( this.$selector )[ 0 ].pause();
				}
			},
			canMovePrev: function () {
				this.stopPlaying();
				return true;
			},
			canMoveNext: function () {
				var i, oldRecords;

				this.stopPlaying();

				if ( this.state.isPublishing === false ) {
					this.state.isPublishing = true;

					for ( i = 0; i < this.$wordsShortlist.length; i++ ) {
						if ( this.checkboxes[ this.$wordsShortlist[ i ] ] === true ) {
							rw.store.record.doPublish( this.$wordsShortlist[ i ] );
						}
					}

					return false;
				} else {
					this.state.isPublishing = false;
					oldRecords = rw.store.record.clearAllPublishedRecords();
					rw.store.config.pushPastRecords( this.metadata.language, this.metadata.speaker.qid, oldRecords );
					return true;
				}
			}
		}
	} );

}( mediaWiki, mediaWiki.recordWizard ) );
