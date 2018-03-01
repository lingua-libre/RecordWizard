( function ( mw, $, rw, OO ) {

	rw.generator.Manual = function( config ) {
		rw.generator.Generator.call( this, config );
	};

	OO.inheritClass( rw.generator.Manual, rw.generator.Generator );
	rw.generator.Manual.static.name = 'manual';
	rw.generator.Manual.static.title = 'manual';


	rw.generator.Manual.prototype.initialize = function() {
	    rw.generator.Generator.prototype.initialize.call( this );

		this.textarea = new OO.ui.MultilineTextInputWidget( {
		    classes: [ 'mwe-recwiz-increment' ],
            rows: 10,
            autosize: true,
            value: ''
        } );

        if ( this.metadatas.words !== undefined ) {
	        this.textarea.setValue( this.metadatas.words.join( '\n' ) );
	    }
		this.content.$element.append( this.textarea.$element );
	};

	rw.generator.Manual.prototype.fetch = function() {
	    this.list = [];
	    var rawList = this.textarea.getValue().split( '\n' );
	    for ( var i=0; i < rawList.length; i++ ) {
	        rawList[ i ] = rawList[ i ].trim();
	        if ( rawList[ i ] !== '' ) {
	            this.list.push( rawList[ i ] );
	        }
	    }
	    return true;
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

