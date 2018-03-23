( function ( mw, $, rw, OO ) {

	rw.layout.WordSelectorWidget = function( config ) {
	    config = config || {};
	    config.classes = config.classes || []
	    config.classes.push( 'mwe-recwiz-wordSelectorWidget' );
	    config.maxHeight = config.maxHeight || 250;
	    config.minHeight = config.minHeight || 150;

	    OO.ui.TagMultiselectWidget.call( this, config );

	    this.$handle.css( 'max-height', config.maxHeight  );
	    this.$handle.css( 'min-height', config.minHeight );
	    this.$handle.css( 'overflow-y', 'auto' );

        this.on( 'add', this.onAdd.bind( this ) )
	};

	OO.inheritClass( rw.layout.WordSelectorWidget, OO.ui.TagMultiselectWidget );

    rw.layout.WordSelectorWidget.prototype.onAdd = function( item, index ) {
        var height = this.$handle[ 0 ].scrollHeight;
        this.$handle.scrollTop( height );
    };

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

