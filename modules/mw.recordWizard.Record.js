// TODO: cleaner state managment
( function ( mw, rw, $ ) {

	rw.Record = function ( word ) {
		OO.EventEmitter.call( this );

		this.file = null;
		this.filename = null;
		this.filekey = null;
		this.word = word;

        this.inQueue = false;
        this.error = false;
		this.state = 'up';
	};

	OO.mixinClass( rw.Record, OO.EventEmitter );

	rw.Record.prototype.getWord = function() {
	    return this.word;
	};

	rw.Record.prototype.getBlob = function() {
	    return this.file;
	};

	rw.Record.prototype.getState = function() {
	    return this.state;
	};

	rw.Record.prototype.setState = function( newState ) {
	    this.emit( 'state-change', this.getWord(), newState, this.state );
	    this.state = newState;
	};

	rw.Record.prototype.getStashedFileUrl = function() {
	    if ( this.filekey !== null && ( this.state === 'stashed' || this.state === 'uploaded' ) ) {
	        return mw.util.getUrl( 'Special:UploadStash/file/' + this.filekey );
	    }
	    return null;
	};

	rw.Record.prototype.getFilename = function() {
	    if ( this.filename === null ) {
	        // TODO: add language name/code
	        this.filename = mw.config.get( 'wgUserName' ) + '-' + this.word + '.wav';
	    }
	    return this.filename;
	};

	rw.Record.prototype.getText = function() {
	    // TODO: generate real description based on metadatas and a configured template
	    return 'The word \'\'' + this.word + '\'\' pronounced by ' + mw.config.get( 'wgUserName' );
	};

	rw.Record.prototype.getFilekey = function() {
	    return this.filekey;
	};

	rw.Record.prototype.setFilekey = function( filekey ) {
	    this.filekey = filekey;
	    this.file = null;
	    this.setState( 'stashed' );
	};

	rw.Record.prototype.finished = function( imageinfo ) {
	    this.imageInfo = imageinfo;
	    this.setState( 'uploaded' );
	};

	rw.Record.prototype.setError = function( error ) {
	    this.error = error;
	    this.setState( 'error' );
	};

	rw.Record.prototype.hasFailed = function() {
	    if ( this.state === 'error' ) {
	        return true;
	    }
	    return false;
	};

	rw.Record.prototype.setBlob = function( audioBlob ) {
	    // Only allow re-recording an audio when it's not already uploaded
	    if ( this.state !== 'uploaded' && this.state !== 'finalizing' ) {
	        this.setState( 'ready' );
		    this.filekey = null;
	        this.error = false;

	        this.file = audioBlob;

	        return true;
	    }
	    return false;
	};

	rw.Record.prototype.isInQueue = function ( inQueue ) {
	    if ( inQueue !== undefined ) {
	        this.inQueue = inQueue;
	    }
	    return this.inQueue;
	};

	rw.Record.prototype.remove = function () {
	    // TODO: abort request if uploading
	    this.offStateChange();
        this.file = null;
	};

    rw.Record.prototype.uploadToStash = function( api, deferred ) {
        var record = this;
        if ( this.state === 'ready' || this.state === 'error' ) {
            this.setState( 'uploading' );

	        api.upload( this.file, {
	            stash: true,
	            filename: this.getFilename()
	        } ).then( function( result ) {
                record.setFilekey( result.upload.filekey );
                deferred.notify( 1 );
                deferred.resolve( result );
            } ).fail( function( errorCode, result ) {
                deferred.notify( 1 );
                deferred.reject( errorCode, result );
                record.setError( errorCode );
            } );
        }
        else {

        }
	};

	rw.Record.prototype.finishUpload = function( api, deferred ) {
        var record = this;
        this.setState( 'finalizing' );

        // TODO: switch from upload to upload-to-commons, if available
        // use the config to detect it
        api.postWithToken( 'csrf', {
            action: 'upload-to-commons',
            format: 'json',
            filekey: this.getFilekey(),
            filename: this.getFilename(),
            text: this.getText(),
            removeafterupload: true,
            ignorewarnings: true, //TODO: manage warnings
        } ).then( function( result ) {
            record.finished( result['upload-to-commons'].oauth.upload.imageinfo );
            deferred.notify( 1 );
            deferred.resolve( result );
        } ).fail( function( errorCode, result ) {
            deferred.notify( 1 );
            deferred.reject( errorCode, result );
            record.setError( errorCode );
        } );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );

