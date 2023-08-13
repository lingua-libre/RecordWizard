'use strict';

( function ( mw, rw ) {
	/**
	 * The Studio step.
	 */
	rw.vue.studio = new Vue( {
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
			isRecording: false,
			saturated: false,
			vumeter: 0,
			countdown: 0,
			audioParams: {
				autoStart: true,
				autoStop: true,
				onSaturate: 'discard',
				startThreshold: 0.1,
				stopThreshold: 0.05,
				stopDuration: 0.3,
				marginBefore: 0.25,
				marginAfter: 0.25,
				saturationThreshold: 0.99
			},
			videoParams: {
				beforeStart: '5',
				recordDuration: '3'
			},
			videoStream: null,
			options: {
				beforeStart: [
					{ data: '0', label: '0' },
					{ data: '1', label: '1' },
					{ data: '2', label: '2' },
					{ data: '3', label: '3' },
					{ data: '5', label: '5' },
					{ data: '8', label: '8' },
					{ data: '10', label: '10' }
				],
				recordDuration: [
					{ data: '2', label: '2' },
					{ data: '3', label: '3' },
					{ data: '5', label: '5' },
					{ data: '8', label: '8' },
					{ data: '12', label: '12' },
					{ data: '20', label: '20' }
				]
			}
		},

		/* Hooks */
		created: function () {
			this.$audioPlayer = document.createElement( 'audio' );
			this.$records = rw.store.record.data.records;
			this.$startTime = 0;
		},

		/* Methods */
		watch: {
			'state.step': function () {
				if ( this.state.step === 'studio' ) {
					// Select the first word in the list
					this.initSelection();

					// Instantiate the recorder with all it's events
					this.initRecorder();

					// Bind keyboard shortcuts
					$( document ).on( 'keydown.rw-studio', this.shortcutsHandler.bind( this ) );
				} else if ( this.$recorder !== undefined ) {
					this.delRecorder();
					$( document ).off( 'keydown.rw-studio' );
				}
			},
			audioParams: {
				deep: true,
				handler: function () {
					if ( this.metadata.media === 'audio' ) {
						this.cancelRecord();
						$.extend( this.$recorder, this.audioParams );
					}
				}
			},
			videoParams: {
				deep: true,
				handler: function () {
					if ( this.metadata.media === 'video' ) {
						this.cancelRecord();
						$.extend( this.$recorder, this.videoParams );
					}
				}
			}
		},
		methods: {
			initRecorder: function () {
				if ( this.metadata.media === 'audio' ) {
					this.$recorder = new rw.libs.LinguaRecorder( this.audioParams );
				} else {
					this.$recorder = new rw.VideoRecorder( this.videoParams );
				}

				this.$recorder.on( 'ready', this.onReady.bind( this ) );
				this.$recorder.on( 'stoped', this.onStop.bind( this ) );
				this.$recorder.on( 'canceled', this.onCancel.bind( this ) );
				this.$recorder.on( 'saturated', this.onSaturate.bind( this ) );
				this.$recorder.on( 'recording', this.onDataAvailable.bind( this ) );
			},
			delRecorder: function () {
				this.$recorder.off( 'ready' );
				this.$recorder.off( 'stoped' );
				this.$recorder.off( 'canceled' );
				this.$recorder.off( 'saturated' );
				this.$recorder.off( 'recording' );

				if ( this.metadata.media === 'audio' ) {
					this.$recorder.close();
				}

				this.$recorder = undefined;
			},
			shortcutsHandler: function ( event ) {
				// Do not trigger those events when the user is focusing an input
				if ( event.target.nodeName === 'INPUT' || event.target.nodeName === 'BUTTON' ) {
					return;
				}

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
						this.playRecord( this.words[ this.selected ] );
						break;

					default:
						return;
				}
				event.preventDefault();
			},
			beforeSelectionChange: function () {
				if ( this.isRecording === true ) {
					this.cancelRecord();
					return true;
				}
				return false;
			},
			afterSelectionChange: function ( wasRecording ) {
				if ( wasRecording === true ) {
					this.startRecord();
				}
			},
			startRecord: function () {
				if ( this.isRecording === false ) {
					if ( this.selected < 0 || this.selected >= this.words.length ) {
						return false;
					}

					this.isRecording = true;
					this.saturated = false;
					this.$recorder.start();

					if ( this.metadata.media === 'video' ) {
						this.countdown = parseInt( this.videoParams.beforeStart ) + 1;
						this.runCountdown();
					}

					return true;
				}
			},
			cancelRecord: function () {
				if ( this.isRecording === true ) {
					this.$recorder.cancel();
					this.isRecording = false;
					this.saturated = false;
					this.vumeter = 0;
					this.countdown = 0;
				}
			},
			toggleRecord: function () {
				if ( this.isRecording ) {
					this.cancelRecord();
				} else {
					this.startRecord();
				}
			},
			playRecord: function ( word ) {
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
			removeRecord: function ( word ) {
				// Reset the selected word
				rw.store.record.resetRecord( word );
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
			onDataAvailable: function ( samples ) {
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
				// with a factor p=10

				this.vumeter = Math.floor( ( -10 * amplitudeMax * amplitudeMax ) + 25 * amplitudeMax );
				// this.vumeter = Math.floor( amplitudeMax * 15 ); //if we want a linear vumeter
			},
			onSaturate: function () {
				this.saturated = true;
			},
			onStop: function ( record ) {
				var blob,
					word = this.words[ this.selected ];

				if ( this.metadata.media === 'audio' ) {
					blob = record.getBlob();
				} else {
					blob = record;
				}

				rw.store.record.doStash( word, blob );

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
			runCountdown: function () {
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
			runTimer: function () {
				var elapsedTime;

				if ( this.isRecording === true ) {
					elapsedTime = ( new Date() - this.$startTime ) / 1000;
					this.vumeter = Math.floor( elapsedTime * 15 / parseInt( this.videoParams.recordDuration ) );

					if ( this.vumeter < 15 ) {
						setTimeout( this.runTimer.bind( this ), 200 );
					}
				}
			},
			canMovePrev: function () {
				this.cancelRecord();

				return true;
			},
			canMoveNext: function () {
				var process = new OO.ui.Process();

				// Make sure the recorder is stopped when we move to the next step
				this.cancelRecord();

				// Do some checks, and eventually alert the user on some strange things
				// before moving to the next step
				process.next( this.checkWordsLeft, this );
				process.next( this.checkStashingRecords, this );
				process.next( this.checkErrors, this );

				return process.execute();
			},
			checkWordsLeft: function () {
				var deferred = $.Deferred();

				if ( rw.store.record.countStatus( [ 'up', 'ready' ] ) > 0 ) {
					OO.ui.confirm( mw.msg( 'mwe-recwiz-warning-wordsleft' ) ).done( function ( confirmed ) {
						if ( confirmed ) {
							deferred.resolve();
						} else {
							deferred.reject();
						}
					} );
					return deferred;
				} else {
					return true;
				}
			},
			checkStashingRecords: function () {
				var deferred = $.Deferred();

				if ( this.statusCount.stashing > 0 ) {
					OO.ui.confirm( mw.msg( 'mwe-recwiz-warning-pendinguploads' ) ).done( function ( confirmed ) {
						if ( confirmed ) {
							rw.requestQueue.clearQueue();
							rw.store.record.resetStashingRecords();
							deferred.resolve();
						} else {
							deferred.reject();
						}
					} );
					return deferred;
				} else {
					return true;
				}
			},
			checkErrors: function () {
				var deferred = $.Deferred();

				if ( this.statusCount.error > 0 ) {
					OO.ui.confirm( mw.msg( 'mwe-recwiz-warning-faileduploads' ) ).done( function ( confirmed ) {
						if ( confirmed ) {
							rw.store.record.resetFaultyRecords();
							deferred.resolve();
						} else {
							deferred.reject();
						}
					} );
					return deferred;
				} else {
					return true;
				}
			}
		}
	} );

}( mediaWiki, mediaWiki.recordWizard ) );
