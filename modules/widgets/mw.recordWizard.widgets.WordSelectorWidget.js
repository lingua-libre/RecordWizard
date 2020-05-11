'use strict';

( function ( mw, $, rw, OO ) {

	rw.widgets.WordSelectorWidget = function ( config ) {
		config = config || {};
		config.classes = config.classes || [];
		config.classes.push( 'mwe-recwiz-wordSelectorWidget' );
		config.maxHeight = config.maxHeight || 250;
		config.minHeight = config.minHeight || 150;

		OO.ui.TagMultiselectWidget.call( this, config );

		this.$handle.css( 'max-height', config.maxHeight );
		this.$handle.css( 'min-height', config.minHeight );
		this.$handle.css( 'overflow-y', 'auto' );

		this.on( 'add', this.onAdd.bind( this ) );
	};

	OO.inheritClass( rw.widgets.WordSelectorWidget, OO.ui.TagMultiselectWidget );

	rw.widgets.WordSelectorWidget.prototype.onAdd = function ( item ) {
		var i,
			texts = item.getData().split( '#' ),
			height = this.$handle[ 0 ].scrollHeight;

		// Cut the text into several texts using the ";" character as separator
		if ( texts.length > 1 ) {
			this.removeItems( [ item ] );
			for ( i = 0; i < texts.length; i++ ) {
				if ( texts[ i ].trim() !== '' ) {
					this.addTag( texts[ i ].trim() );
				}
			}
		}

		// Scroll the textarea to show the newly added items
		this.$handle.scrollTop( height );
	};

	rw.widgets.WordSelectorWidget.prototype.getValue = function () {
		var i,
			value = OO.ui.TagMultiselectWidget.prototype.getValue.call( this );

		for ( i = 0; i < value.length; i++ ) {
			value[ i ] = value[ i ].trim();
		}

		return value;
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
