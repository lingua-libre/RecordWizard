'use strict';

( function ( mw, rw ) {
	/**
	 * The Tutorial step.
	 */
	rw.vue.tutorial = new Vue( {
		mixins: [ rw.vue.step ],

		/* Data */
		data: {
			mictesterState: 'init' // init -> wait -> record -> wait -> play ⟲
		},

		/* Hooks */
		mounted: function () {
			this.$errorMessageAssociation = {
				AbortError: 'mwe-recwiz-error-mediastream-technical',
				NotAllowedError: 'mwe-recwiz-error-mediastream-notallowed',
				NotFoundError: 'mwe-recwiz-error-mediastream-notfound',
				NotReadableError: 'mwe-recwiz-error-mediastream-technical',
				OverconstrainedError: 'mwe-recwiz-error-mediastream-notfound',
				SecurityError: 'mwe-recwiz-error-mediastream-technical'
			};
			this.getAudioStream();
		},

		/* Methods */
		watch: {
			'state.step': function () {
				if ( this.state.step === 'tutorial' ) {
					this.getAudioStream();
				} else if ( this.$recorder !== undefined && this.$recorder !== null ) {
					this.unloadRecorder();
				}
			}
		},
		methods: {
			getAudioStream: function () {
				// Cleanup previous recorder instance when we click on the button
				// to reopen the popup
				this.unloadRecorder();

				this.$recorder = new rw.libs.LinguaRecorder( {
					autoStart: true,
					autoStop: true
				} );

				this.$recorder.on( 'readyFail', this.showError.bind( this ) );
				this.$recorder.on( 'ready', function () {
					this.state.isBrowserReady = true;
					this.$recorder.on( 'stoped', this.mictesterPlay.bind( this ) );
				}.bind( this ) );
			},
			unloadRecorder: function () {
				if ( this.$recorder === undefined || this.$recorder === null ) {
					return;
				}

				this.$recorder.stop();
				this.$recorder.off( 'readyFail' );
				this.$recorder.off( 'ready' );
				this.$recorder.off( 'stoped' );
				this.$recorder.close();
				this.$recorder = null;
			},
			showError: function ( mediaStreamError ) {
				var message = mw.msg( 'mwe-recwiz-error-mediastream-unknow' );

				if ( typeof mediaStreamError.name === 'string' ) {
					if ( this.$errorMessageAssociation[ mediaStreamError.name ] !== undefined ) {
						message = mw.msg( this.$errorMessageAssociation[ mediaStreamError.name ] );
					}
				}

				if ( typeof mediaStreamError.message === 'string' ) {
					message = message.replace( /\$1/g, mediaStreamError.message );
				}

				OO.ui.alert( message );
			},
			mictesterRecord: function () {
				this.mictesterState = 'wait';

				setTimeout( function () {
					this.mictesterState = 'record';
					this.$recorder.start();
					this.$timer = setTimeout(
						this.$recorder.stop.bind( this.$recorder ),
						8000
					);
				}.bind( this ), 1100 );
			},
			mictesterPlay: function ( record ) {
				this.mictesterState = 'wait';

				setTimeout( function () {
					var audioNode;

					this.mictesterState = 'play';
					clearTimeout( this.$timer );
					audioNode = record.getAudioElement();
					audioNode.play();
					setTimeout( function () {
						this.mictesterState = 'init';
					}.bind( this ), record.getDuration() * 1000 + 300 );
				}.bind( this ), 1100 );
			}
		}
	} );

}( mediaWiki, mediaWiki.recordWizard ) );
