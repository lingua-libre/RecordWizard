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

	rw.controller.Studio.prototype.load = function ( metadatas, records ) {
	    var controller = this;

		rw.controller.Step.prototype.load.call( this, metadatas, records );

        this.recorder = new rw.libs.LinguaRecorder( {
            'autoStart': true,
            'autoStop': true,
            'onSaturate': 'discard'
        } );
        console.log( this.recorder );
        this.isRecording = false;
        this.currentIndex = 0;

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

        this.ui.on( 'element-click', function( word ) {
            controller.recorder.cancel();

            controller.currentIndex = controller.metadatas.words.indexOf( word );

            if ( controller.isRecording ) {
                controller.isRecording = false;
                controller.startNextRecord();
            }
            else {
                controller.ui.setSelectedItem( word );
            }
        } );
	};

	rw.controller.Studio.prototype.onStop = function( audioRecord ) {
	    var record,
	        currentElement = this.metadatas.words[ this.currentIndex ],
	        controller = this;

        if ( this.records[ currentElement ] !== undefined ) {
            record = this.records[ currentElement ];
        }
        else {
            record = new rw.Record( currentElement );
	        this.records[ currentElement ] = record;
        }
        record.setBlob( audioRecord.getBlob() );

	    rw.uploadManager.uploadToStash( record )
	        .then( function() {
	            controller.ui.setItemState( currentElement, 'stashed' );
	        } )
	        .fail( function() {
	            controller.ui.setItemState( currentElement, 'error' );
	        } );
	    this.ui.setItemState( currentElement, 'uploading' );

        if ( ! this.startNextRecord() ) {
            this.isRecording = false;
	        this.ui.onStop();
	    }
	};

	rw.controller.Studio.prototype.startNextRecord = function () {
	    if ( this.isRecording ) {
	        this.currentIndex++;
	    }
	    if ( this.metadatas.words.length === 0 || this.currentIndex > this.metadatas.words.length-1 ) {
	        return false;
	    }

	    this.recorder.start();
	    this.isRecording = true;

	    this.ui.setSelectedItem( this.metadatas.words[ this.currentIndex ] );
	    return true;
	};

	rw.controller.Studio.prototype.moveNext = function () {
		// TODO: ask for confirmation if all words are not recorded
		this.recorder.cancel();

		rw.controller.Step.prototype.moveNext.call( this );
	};

	rw.controller.Studio.prototype.movePrevious = function () {
		// TODO: warning about a potential data loss

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );

