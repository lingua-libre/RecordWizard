'use strict';

( function ( mw, rw ) {
	/**
	 * The Studio step.
	 */
	 rw.vue.studio = new Vue( {
		 mixins: [rw.vue.step],

		 /* Data */
		 data: {
			metadata: rw.store.record.data.metadata,
		 	words: rw.store.record.data.words,
   		 	status: rw.store.record.data.status,
   		 	errors: rw.store.record.data.errors,
			selected: 0,
			isRecording: false,
			saturated: false,
		 },

		 /* Hooks */
		 created: function() {
			 this.$audioPlayer = document.createElement( 'audio' );
			 this.$records = rw.store.record.data.records;
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
				 if ( this.state.step === 'studio' ) {
					 // Select the first word in the list
					 this.selected = 0;

	 				 // TODO: switch between audio and video
					 this.$recorder = new rw.libs.LinguaRecorder( {
						autoStart: true,
						autoStop: true,
						onSaturate: 'discard'
					} );

					this.$recorder.on( 'stoped', this.onStop.bind( this ) );
					this.$recorder.on( 'canceled', this.onCancel.bind( this ) );
					this.$recorder.on( 'saturated', this.onSaturate.bind( this ) );

					 // Bind keyboard shortcuts
					 this.bindShortcuts();
				 } else {
				 	this.unbindShortcuts();
				 }
			 },
		 },
		 computed: {

		 },
		 methods: {
			 bindShortcuts: function() {
				 // TODO keyboard binding
			 },
			 unbindShortcuts: function() {
				 // TODO
			 },
			 itemClass: function( word ) {
				 var text = 'mwe-rws-' + this.status[ word ];
				 if ( this.errors[ word ] !== false ) {
					 text += ' mwe-rws-error';
				 }
				 if ( word === this.words[ this.selected ] ) {
					 text += ' mwe-rws-selected';
				 }

				 return text;
			 },
			 selectWord: function( index ) {
				 var wasRecording = this.isRecording;

				 if ( this.isRecording === true ) {
					 this.cancelRecord();
				 }

				 this.selected = index;

				 if ( wasRecording === true ) {
					 this.startRecord();
				 }

				 return true;
			 },
			 moveBackward: function() {
				 var wasRecording = this.isRecording;

				 if ( this.selected > 0 ) {
					 if ( this.isRecording === true ) {
						 this.cancelRecord();
					 }

					 this.selected--;

					 if ( wasRecording === true ) {
						 this.startRecord();
					 }
					 return true;
				 }
				 return false;
			 },
			 moveForward: function() {
				 var wasRecording = this.isRecording;

				 if ( this.selected < this.words.length - 1 ) {
					 if ( this.isRecording === true ) {
						 this.cancelRecord();
					 }

					 this.selected++;

					 if ( wasRecording === true ) {
						 this.startRecord();
					 }
					 return true;
				 }
				 return false;
			 },
			 playWord: function( word ) {
				 // this.$audioPlayer.src = ...;
				 // this.$audioPlayer.play();
			 },
			 removeRecord: function( word ) {
				 word = word || this.words[ this.selected ];

				 // Reset the selected word
				 this.records[ word ].reset();
				 this.status[ word ] = 'up';

				 // If a record is pending, cancel it
				 this.cancelRecord();
			 },
			 toggleRecord: function() {
			 	if ( this.isRecording ) {
					this.cancelRecord();
			 	} else {
			 		this.startRecord();
			 	}
			 },
			 cancelRecord: function() {
				 this.$recorder.cancel();
				 this.isRecording = false;
				 this.saturated = false;
			 },
			 startRecord: function() {
		 		if ( this.selected < 0 || this.selected >= this.words.length ) {
		 			return false;
		 		}

				 this.isRecording = true;
				 this.saturated = false;
				 this.$recorder.start();

				 return true;
			 },
			 onStop: function ( audioRecord ) {
				 var word = this.words[ this.selected ];

				 this.upload( word, audioRecord.getBlob() );

				// Auto start next record, if any, or stop the recorder
				if ( this.moveForward() === false ) {
					this.cancelRecord();
				}
			 },
			 onCancel: function ( reason ) {
				 this.isRecording = false;
				 if ( reason === 'saturated' ) {
					 this.startRecord();
				 }
			 },
			 onSaturate: function () {
				 this.saturated = true;
			 },
			 upload: function ( word, blob ) {
			 	this.status[ word ] = 'ready';

		 		if ( blob !== undefined ) {
		 			this.$records[ word ].setBlob(
						blob,
						( this.metadata.media === 'audio' ? 'wav' : 'mpeg' )
					);
		 		}

				this.status[ word ] = 'stashing';
		 		rw.requestQueue.push( this.$records[ word ].uploadToStash.bind( this.$records[ word ], this.$api ) ).then(
					this.uploadSuccess.bind( this, word ),
					this.uploadError.bind( this, word )
				);
		 	},
			uploadSuccess: function( word ) {
				console.log( 'uploadSuccess' );
				this.status[ word ] = 'stashed';
			},
			uploadError: function( word, error ) {
				console.log( 'uploadError' );
				this.status[ word ] = 'ready';
				this.errors[ word ] = error;
			},
		 }
	 } );

}( mediaWiki, mediaWiki.recordWizard ) );
