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
				 var i,
				 	counter = 0,
					total = 0;

				 for ( i = 0; i < this.words.length; i++ ) {
					 if ( this.status[ this.words[ i ] ] === 'done' ) {
						 counter++;
					 }
				 }

				 for ( i = 0; i < this.words.length; i++ ) {
					 if ( this.isPublishable( this.words[ i ] ) === true ) {
						 total++;
					 }
				 }

				 return counter + ' / ' + total;
			 },
			 progress: function() {
				 var i,
				 	counter = 0,
					total = 0;

				 for ( i = 0; i < this.words.length; i++ ) {
					 if ( this.status[ this.words[ i ] ] === 'done' ) {
						 counter++;
					 }
				 }

				 for ( i = 0; i < this.words.length; i++ ) {
					 if ( this.isPublishable( this.words[ i ] ) === true ) {
						 total++;
					 }
				 }

				 return (100 * counter / total).toString();
			 },
			 nbErrors: function() {
				 var i,
				 	counter = 0;

				 for ( i = 0; i < this.words.length; i++ ) {
					 if ( this.errors[ this.words[ i ] ] !== false ) {
						 counter++;
					 }
				 }

				 return counter;
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
		 }
	 } );

}( mediaWiki, mediaWiki.recordWizard ) );
