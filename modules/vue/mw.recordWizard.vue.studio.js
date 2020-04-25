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
			vumeter: 0,
			countdown: 0,
			audioParams: {
			   autoStart: true,
			   autoStop: true,
			   onSaturate: 'discard',
			},
			videoParams: {
				beforeStart: 3,
				recordDuration: 2,
			},
			videoStream: null,
		 },

		 /* Hooks */
		 created: function() {
			 this.$audioPlayer = document.createElement( 'audio' );
			 this.$records = rw.store.record.data.records;
			 this.$startTime = 0;
		 },
		 computed: {
			 wordsRecorded: function() {
				 var i,
				 	recordedCounter = 0;

				 for ( i = 0; i < this.words.length; i++ ) {
					 if ( this.status[ this.words[ i ] ] !== 'up' && this.status[ this.words[ i ] ] !== 'ready' ) {
						 recordedCounter++;
					 }
				 }

				 return recordedCounter + ' / ' + this.words.length;
			 },
		 },

		 /* Methods */
		 watch: {
			 'state.step': function() {
				 if ( this.state.step === 'studio' ) {
					 // Select the first word in the list
					 this.selected = 0;

	 				 if ( this.metadata.media === 'audio' ) {
						 this.$recorder = new rw.libs.LinguaRecorder( this.audioParams );
					} else {
						this.$recorder = new rw.VideoRecorder( this.videoParams );
					}

					this.$recorder.on( 'ready', this.onReady.bind( this ) );
					this.$recorder.on( 'stoped', this.onStop.bind( this ) );
					this.$recorder.on( 'canceled', this.onCancel.bind( this ) );
					this.$recorder.on( 'saturated', this.onSaturate.bind( this ) );
					this.$recorder.on( 'recording', this.onRecord.bind( this ) );

					 // Bind keyboard shortcuts
					 $( document ).on( 'keydown.rw-studio', this.shortcuts.bind( this ) );
				 } else {
				 	$( document ).off( 'keydown.rw-studio' );
				 }
			 },
			 selected: function() {
				 var list = $( '#mwe-rws-list' ),
				 	itemNode = list.children().eq( this.selected ),
				 	container = list.parent();

				 container.animate( {
					 scrollTop: itemNode.offset().top - container.offset().top + container.scrollTop() - ( itemNode.innerHeight() - itemNode.height() )
				 } );
			 },
		 },
		 methods: {
			 shortcuts: function( event ) {
				 console.log( 'KEY: ', event.which );
				 switch ( event.which ) {
					 case 37: // left
					 case 38: // up
					 	 this.moveBackward();
						 break;

					 case 39: // right
 					 case 40: // down
					 	 this.moveForward();
						 break;

					 case 46: // del
					 case 8: // backspace
					 	this.removeRecord( this.words[ this.selected ] );
						if ( this.isRecording === true ) {
							this.cancelRecord();
							this.startRecord();
						}
						break;

					 case 32: // space bar
					 	this.toggleRecord();
						 break;

 					 case 13: // Enter
					 case 80: // P
					 	 this.playWord( this.words[ this.selected ] );
						 break;

					 default:
					 	return;
				 }
				 event.preventDefault();
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
				 if ( this.status[ word ] === 'stashed' ) {
					 // Make sure the recorder isn't running
					 if ( this.isRecording === true ) {
					 	this.cancelRecord();
					 }

					 // Play the stashed version of the record
				 	 this.$audioPlayer.pause();
					 this.$audioPlayer.src = this.$records[ word ].getMediaUrl();
					 this.$audioPlayer.play();
				 }
			 },
			 removeRecord: function( word ) {
				 // Reset the selected word
				 this.$records[ word ].reset();
				 this.status[ word ] = 'up';
				 this.errors[ word ] = false;
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
				 this.vumeter = 0;
				 this.countdown = 0;
			 },
			 startRecord: function() {
		 		if ( this.selected < 0 || this.selected >= this.words.length ) {
		 			return false;
		 		}

				 this.isRecording = true;
				 this.saturated = false;
				 this.$recorder.start();

				 if ( this.metadata.media === 'video' ) {
				 	this.countdown = this.videoParams.beforeStart + 1;
					 this.runCountdown();
				 }

				 return true;
			 },
			 onReady: function ( stream ) {
				 var videoNode;

				 if ( this.metadata.media === 'video' ) {
					 this.videoStream = stream;

					 videoNode = $( '#mwe-rws-videoplayer' )[ 0 ]; // get the HTMLnode of the video tag

					 // Older browsers may not have srcObject
					 if ( 'srcObject' in videoNode ) {
						 videoNode.srcObject = stream;
					 } else {
						 // Avoid using this in new browsers, as it is going away.
						 videoNode.src = window.URL.createObjectURL( stream );
					 }
					 videoNode.onloadedmetadata = function () {
						 videoNode.play();
						 videoNode.muted = true;
					 };
				 }
			 },
			 onRecord: function ( samples ) {
		 		var i, amplitude,
		 			amplitudeMax = 0;

		 		for ( i = 0; i < samples.length; i++ ) {
		 			amplitude = Math.abs( samples[ i ] );
		 			if ( amplitude > amplitudeMax ) {
		 				amplitudeMax = amplitude;
		 			}
		 		}

				// Display the amplitude on the vu-meter following a
				// parabolic transfer function v(x) = -p*x^2 + (p+15)*x
				// with p=10

				this.vumeter = Math.floor( ( -10 * amplitudeMax * amplitudeMax ) + 25 * amplitudeMax );
				//this.vumeter = Math.floor( amplitudeMax * 15 ); //if we want a linear vumeter
			},
			 onStop: function ( record ) {
				 var blob,
				 	 word = this.words[ this.selected ];

				if ( this.metadata.media === 'audio' ) {
					blob = record.getBlob();
				} else {
					blob = record;
				}

				 this.upload( word, blob );

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
						( this.metadata.media === 'audio' ? 'wav' : 'webm' )
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
			runCountdown: function() {
				if ( this.isRecording === true ) {
					this.countdown--;
					if ( this.countdown > 0 ) {
						setTimeout( this.runCountdown.bind( this ), 1000 );
					} else {
						this.$startTime = new Date();
						this.runTimer();
					}
				}
			},
			runTimer: function() {
				var elapsedTime;

				if ( this.isRecording === true ) {
					elapsedTime = ( new Date() - this.$startTime ) / 1000;
					this.vumeter = Math.floor( elapsedTime * 15 / this.videoParams.recordDuration );

					if ( this.vumeter < 15 ) {
						setTimeout( this.runTimer.bind( this ), 200 );
					}
				}
			},
		 }
	 } );

}( mediaWiki, mediaWiki.recordWizard ) );
