// TODO: cleaner state managment
( function ( mw, rw, $ ) {

	rw.Record = function ( textualElement ) {
		this.file = null;
		this.filename = null;
		this.filekey = null;
		this.textualElement = textualElement;

		this.state = 'null';
	};

	rw.Record.prototype.getTextualElement = function() {
	    return this.textualElement;
	};

	rw.Record.prototype.getBlob = function() {
	    return this.file;
	};

	rw.Record.prototype.getState = function() {
	    return this.state;
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
	        this.filename = mw.config.get( 'wgUserName' ) + '-' + this.textualElement + '.wav';
	    }
	    return this.filename;
	};

	rw.Record.prototype.getText = function() {
	    // TODO: generate real description based on metadatas and a configured template
	    return 'The word \'\'' + this.textualElement + '\'\' pronounced by ' + mw.config.get( 'wgUserName' );
	};

	rw.Record.prototype.getFilekey = function() {
	    return this.filekey;
	};

	rw.Record.prototype.setFilekey = function( filekey ) {
	    this.filekey = filekey;
	    this.state = 'stashed';
	};

	rw.Record.prototype.finished = function() {
	    this.file = null;
	    this.state = 'uploaded';
	};

	rw.Record.prototype.setBlob = function( audioBlob ) {
	    // Only allow re-recording an audio when it's not already uploaded
	    if ( this.state !== 'uploaded' ) {
	        this.state = 'waiting';
	        this.file = audioBlob;
	        return true;
	    }
	    return false;
	};

	rw.Record.prototype.remove = function () {};

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );

