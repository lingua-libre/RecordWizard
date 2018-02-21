/**
 *
 */
( function ( mw, rw, $ ) {

	rw.UploadManager = function () {
        this.maxConcurentUploads = 3;
        this.uploadQueue = [];
        this.currentUploads = 0;
        this.api = new mw.Api();
	};

	rw.UploadManager.prototype.uploadToStash = function( record ) {
	    var deferred = $.Deferred();

        this.uploadQueue.push( { 'type': '_doUploadToStash', 'record': record, 'deferred': deferred } );
        if ( this.currentUploads < this.maxConcurentUploads ) {
            this.currentUploads++;
            this.next();
        }

        return deferred.promise();
	};

	rw.UploadManager.prototype.finishUpload = function( record ) {
	    var deferred = $.Deferred();

        this.uploadQueue.push( { 'type': '_doFinishUpload', 'record': record, 'deferred': deferred } );
        if ( this.currentUploads < this.maxConcurentUploads ) {
            this.currentUploads++;
            this.next();
        }

        return deferred.promise();
	};

    rw.UploadManager.prototype.next = function() {
        console.log( '--> file in queue: '+this.uploadQueue.length );
        if ( this.uploadQueue.length > 0 ) {
            var param = this.uploadQueue.shift();
            this[param.type]( param.deferred, param.record );
        }
        else {
            this.currentUploads--;
        }
    };

	rw.UploadManager.prototype._doUploadToStash = function( deferred, record ) {
        var uploadManager = this;
        record.setState( 'uploading' );

	    this.api.upload( record.getBlob(), { stash: true, filename: record.getFilename() } )
	        .then( function( result ) {
	            record.setFilekey( result.upload.filekey );
	            deferred.notify( 1 );
	            deferred.resolve( result );

	            uploadManager.next();

	        } ).fail( function( errorCode, result ) {
	            deferred.notify( 1 );
	            deferred.reject( errorCode, result );

	            uploadManager.next();
	        } );
	};

	rw.UploadManager.prototype._doFinishUpload = function( deferred, record ) {
        var uploadManager = this;
        record.setState( 'finalizing' );

        // TODO: switch from upload to upload-to-commons, if available
        // use the config to detect it
        this.api.postWithToken( 'csrf', {
            action: 'upload-to-commons',
            format: 'json',
            filekey: record.getFilekey(),
            filename: record.getFilename(),
            text: record.getText(),
            removeafterupload: true,
            ignorewarnings: true, //TODO: manage warnings
        } )
            .then( function( result ) {
	            console.log( 'success' );
	            console.log( result );
	            record.finished( result['upload-to-commons'].oauth.upload.imageinfo );
	            deferred.notify( 1 );
	            deferred.resolve( result );

	            uploadManager.next();
            } ).fail( function( errorCode, result ) {
	            console.log( 'fail' );
	            console.log( result );
	            deferred.notify( 1 );
	            deferred.reject( errorCode, result );

	            uploadManager.next();
            } );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );

