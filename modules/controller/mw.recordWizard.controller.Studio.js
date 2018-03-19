( function ( mw, rw, $, OO ) {
	/**
	 * The Studio step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Studio = function( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Studio(),
			api,
			config
		);

		this.stepName = 'studio';
	};

	OO.inheritClass( rw.controller.Studio, rw.controller.Step );

	rw.controller.Studio.prototype.load = function () {
	    var controller = this;

        if ( rw.metadatas.statesCount === undefined ) {
            rw.metadatas.statesCount = {
                'ready': 0,
                'uploading': 0,
                'stashed': 0,
                'finalizing': 0,
                'uploaded': 0,
                'error': 0,
            };
        }

		rw.controller.Step.prototype.load.call( this );

	    for( var word in rw.records ) {
            rw.records[ word ].on( 'state-change', this.switchState.bind( this ) );
	    }

        this.recorder = new rw.libs.LinguaRecorder( {
            'autoStart': true,
            'autoStop': true,
            'onSaturate': 'discard'
        } );
        this.isRecording = false;
        this.currentWord = rw.metadatas.words[ 0 ];

        this.recorder.on( 'ready', this.ui.onReady.bind( this.ui ) );
        this.recorder.on( 'started', this.ui.onStart.bind( this.ui ) );
        this.recorder.on( 'recording', this.ui.onRecord.bind( this.ui ) );
        this.recorder.on( 'stoped', this.onStop.bind( this ) );
        this.recorder.on( 'canceled', this.ui.onCancel.bind( this.ui ) );
        this.recorder.on( 'saturated', this.ui.onSaturate.bind( this.ui ) );

        this.ui.on( 'studiobutton-click', function() {

            if ( controller.isRecording ) {
                controller.recorder.cancel();
                controller.isRecording = false;
                controller.ui.onStop();
            }
            else {
                if ( controller.startNextRecord() ) {
                    controller.ui.onStart();
                }
            }

        } );

        this.ui.on( 'item-click', this.selectWord.bind( this ) );

        this.ui.on( 'previous-item-click', function() {
            var index = rw.metadatas.words.indexOf( controller.currentWord );
            if ( index > 0 ) {
                controller.selectWord( rw.metadatas.words[ index - 1 ] );
            }
        } );

        this.ui.on( 'next-item-click', function() {
            var index = rw.metadatas.words.indexOf( controller.currentWord );
            if ( index > -1 && index < rw.metadatas.words.length - 1 ) {
                controller.selectWord( rw.metadatas.words[ index + 1 ] );
            }
        } );

        this.ui.on( 'wordinput-validate', function( word ) {
            if ( rw.metadatas.words.indexOf( word ) !== -1 ) {
                return;
            }

	        rw.records[ currentWord ] = new rw.Record( currentWord, rw.metadatas );
	        rw.records[ currentWord ].on( 'state-change', this.switchState.bind( this ) );

            rw.metadatas.words.push( word );
            controller.ui.addWord( word );

            // Move the cursor to the new item only if all the items (except the
            // last one, the one we've just added) have already been recorded
            for ( var i=0; i < rw.metadatas.words.length-1; i++ ) {
                if ( rw.records[ rw.metadatas.words[ i ] ] === undefined ) {
                    return;
                }
            }
            controller.currentWord = word;
            controller.ui.setSelectedItem( word );

        } );

        this.ui.on( 'retry-click', function( word ) {
            for ( word in rw.records ) {
                if ( rw.records[ word ].hasFailed() ) {
                    controller.upload( word );
                }
            }
        } );
	};

	rw.controller.Studio.prototype.unload = function () {
		this.ui.off( 'studiobutton-click' );
		this.ui.off( 'item-click' );
		this.ui.off( 'previous-item-click' );
		this.ui.off( 'next-item-click' );
		this.ui.off( 'wordinput-validate' );
		this.ui.off( 'retry-click' );
		for ( word in rw.records ) {
		    rw.records[ word ].off( 'state-change' );
		}
		rw.controller.Step.prototype.unload.call( this );
	};

	rw.controller.Studio.prototype.onStop = function( audioRecord ) {
	    var currentWord = this.currentWord;

	    this.upload( currentWord, audioRecord.getBlob() );

        if ( ! this.startNextRecord() ) {
            this.isRecording = false;
	        this.ui.onStop();
	    }
	};

	rw.controller.Studio.prototype.upload = function( word, blob ) {
        if ( blob !== undefined ) {
            rw.records[ word ].setBlob( blob );
        }

        rw.requestQueue.push( rw.records[ word ], 'uploadToStash' );
	};

	rw.controller.Studio.prototype.startNextRecord = function () {
	    var index = rw.metadatas.words.indexOf( this.currentWord );
	    if ( index < 0 ) {
	        return false;
	    }

	    if ( this.isRecording ) {
	        var newWordAvailable = false;
	        for( var i=index+1; i < rw.metadatas.words.length; i++ ) {
	            if ( rw.records[ rw.metadatas.words[ i ] ].getState() === 'up' ) {
	                newWordAvailable = true;
	                this.currentWord = rw.metadatas.words[ i ];
	                break;
	            }
	        }
	        if ( !newWordAvailable ) {
	            return false;
	        }
	    }

	    this.recorder.start();
	    this.isRecording = true;

	    this.ui.setSelectedItem( this.currentWord );
	    return true;
	};

	rw.controller.Studio.prototype.selectWord = function( word ) {
        this.recorder.cancel();

        this.currentWord = word;

        if ( this.isRecording ) {
            this.isRecording = false;
            this.startNextRecord();
        }
        else {
            this.ui.setSelectedItem( word );
        }
	};

	rw.controller.Studio.prototype.moveNext = function ( skipFirstWarning ) {
	    var controller = this,
	        total = rw.metadatas.statesCount.error + rw.metadatas.statesCount.stashed + rw.metadatas.statesCount.uploading;
	    skipFirstWarning = skipFirstWarning || false;

		this.recorder.cancel();
		this.ui.onStop();
        console.log( rw.metadatas.statesCount );
		if ( total < rw.metadatas.words.length && ! skipFirstWarning ) {
		    OO.ui.confirm( mw.message( 'mwe-recwiz-warning-wordsleft' ).text() ).done( function( confirmed ) {
		        if ( confirmed ) {
		            controller.moveNext( true );
		        }
		    } );
		    return;
		}

		if ( rw.metadatas.statesCount.uploading > 0 ) {
		    OO.ui.confirm( mw.message( 'mwe-recwiz-warning-pendinguploads' ).text() ).done( function( confirmed ) {
		        if ( confirmed ) {
		            controller.removePendingRecords();
		            rw.metadatas.statesCount.uploading = 0;
                    controller.ui.updateCounter();
		            controller.moveNext( true );
		        }
		    } );
		    return;
		}

		if ( rw.metadatas.statesCount.error > 0 ) {
		    OO.ui.confirm( mw.message( 'mwe-recwiz-warning-faileduploads' ).text() ).done( function( confirmed ) {
		        if ( confirmed ) {
		            controller.removeFailedRecords();
		            rw.metadatas.statesCount.error = 0;
                    controller.ui.updateCounter();
		            controller.moveNext( true );
		        }
		    } );
		    return;
		}

		rw.controller.Step.prototype.moveNext.call( this );
	};

	rw.controller.Studio.prototype.movePrevious = function () {
		// TODO: warning about a potential data loss

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );

