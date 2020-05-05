'use strict';

( function ( mw, rw ) {
	/**
	 * The Publish step.
	 */
	 rw.vue.publish = new Vue( {
		 mixins: [rw.vue.step],

		 /* Data */
		 data: {
			metadata: rw.store.record.data.metadata,
		 	words: rw.store.record.data.words,
   		 	status: rw.store.record.data.status,
   		 	errors: rw.store.record.data.errors,
			checkboxes: rw.store.record.data.checkboxes,
			selected: 0,
			forceUpdate: 0,
		 },

		 /* Hooks */
		 created: function() {
			 this.$records = rw.store.record.data.records;
		 },

		 /* Methods */
		 watch: {
			 'state.step': function() {
				 var i;

				 if ( this.state.step === 'publish' ) {
					 // Ugly hack to force Vue.js to recompute some computed properties
					 // This would not be needed if we used a fixed counter property somewhere
					 this.forceUpdate++;

					 // Select the first word in the list
	 				 for ( i = 0; i < this.words.length; i++ ) {
	 					 if ( this.isPublishable( this.words[ i ] ) === true ) {
	 						 this.selected = i;
							 break;
	 					 }
	 				 }

					 if ( this.metadata.media === 'audio' ) {
						 this.$selector = '#mwe-rwp-core audio';
					 } else {
						 this.$selector = '#mwe-rwp-core video';
					 }
				 }
			 },
		 },
		 computed: {
			 mediaUrl: function() {
				 return this.$records[ this.words[ this.selected ] ].getMediaUrl();
			 },
			 // TODO: Maybe a refactoring is possible here, a single method (in the recordStore?)
			 // including analoguous methods in the studio view
			 nbWordsUploaded: function() {
				 var done = rw.store.record.countStatus( [ 'done' ] ),
				 	total = rw.store.record.countStatus( [ 'stashed', 'uploading', 'uploaded', 'finalizing', 'done' ], true );

				 this.forceUpdate;
				 return done + ' / ' + total;
			 },
			 nbWordsUploading: function () {
				 this.forceUpdate;
			 	return rw.store.record.countStatus( [ 'uploading', 'finalizing' ] );
			},
			 progress: function() {
				 var done = rw.store.record.countStatus( [ 'done' ] ),
				 	total = rw.store.record.countStatus( [ 'stashed', 'uploading', 'uploaded', 'finalizing', 'done' ], true );

				 this.forceUpdate;
				 return (100 * done / total).toString();
			 },
			 nbErrors: function() {
				 this.forceUpdate;
				 return rw.store.record.countErrors();
			 },
		 },
		 methods: {
			 isPublishable: function( word ) {
				 if ( [ 'up', 'ready', 'stashing' ].indexOf( this.status[ word ] ) > -1 ) {
					 return false;
				 }

				 return true;
			 },
			 itemClass: function( word ) {
				 var text = 'mwe-rwp-' + this.status[ word ];
				 if ( this.errors[ word ] !== false ) {
					 text += ' mwe-rw-error';
				 }
				 if ( word === this.words[ this.selected ] ) {
					 text += ' mwe-rw-selected';
				 }

				 return text;
			 },
			 selectWord: function( index ) {
				 this.stopPlaying();
			 	 this.selected = index;
			 },
			 moveBackward: function() {
				 var i;

				 for ( i = this.selected - 1; i >= 0; i-- ) {
					 if ( this.isPublishable( this.words[ i ] ) === true ) {
						 this.selectWord( i );
						 return true;
					 }
				 }

				 return false;
			 },
			 moveForward: function() {
				 var i;

				 for ( i = this.selected + 1; i < this.words.length; i++ ) {
					 if ( this.isPublishable( this.words[ i ] ) === true ) {
						 this.selectWord( i );
						 return true;
					 }
				 }

				 return false;
			 },
			 startPlaying: function() {
				 $( this.$selector )[ 0 ].play();
			 },
			 stopPlaying: function() {
				 $( this.$selector )[ 0 ].pause();
			 },
			 canMoveNext: function () {
				 var i;

				 this.stopPlaying();

				 if ( this.state.isPublishing === false ) {
					 this.state.isPublishing = true;

					 for ( i = 0; i < this.words.length; i++ ) {
						 if ( this.checkboxes[ this.words[ i ] ] === true && this.isPublishable( this.words[ i ] ) === true ) {
							 rw.store.record.doPublish( this.words[ i ] );
						 }
					 }

					 return false;
				 } else {
					 this.state.isPublishing = false;
					 rw.store.record.clearAllRecords();
					 return true;
				 }
			 },
			 canMovePrev: function () {
				 this.stopPlaying();
				 return true;
			 },
		 }
	 } );

}( mediaWiki, mediaWiki.recordWizard ) );
