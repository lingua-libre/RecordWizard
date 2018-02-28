( function ( mw, $, rw, OO ) {

	rw.generator.Manual = function( metadatas ) {
		rw.generator.Generator.call( this, metadatas );

		this.textarea = new OO.ui.MultilineTextInputWidget( {
		    classes: [ 'mwe-recwiz-increment' ],
            rows: 10,
            autosize: true,
            value: ''
        } );

		this.$element = this.textarea.$element;

	};

	OO.inheritClass( rw.generator.Manual, rw.generator.Generator );
	rw.generator.Manual.static.name = 'manual';

	rw.generator.Manual.prototype.getList = function() {
	    this.list = [];
	    var rawList = this.textarea.getValue().split( '\n' );
	    for ( var i=0; i < rawList.length; i++ ) {
	        rawList[ i ] = rawList[ i ].trim();
	        if ( rawList[ i ] !== '' ) {
	            this.list.push( rawList[ i ] );
	        }
	    }
	    return this.list;
	};

	rw.generator.Generator.prototype.preload = function( metadatas ) {
	    this.textarea.setValue( metadatas.words.join( '\n' ) );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

