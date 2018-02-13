/**
 * Object that represents the entire multi-step Record Wizard
 */
( function ( mw, rw, $ ) {

	rw.Record = function ( audioBlob, textualElement ) {
		this.file = audioBlob;
		this.filename = null;
		this.filekey = null;
		this.textualElement = textualElement;

		this.state = 'waiting';
	};

	rw.Record.prototype.getBlob = function() {
	    return this.file;
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

}( mediaWiki, mediaWiki.recordWizard, jQuery ) );

