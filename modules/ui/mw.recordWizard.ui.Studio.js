( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Studio step.
	 *
	 * @class rw.ui.Studio
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Studio = function() {
		rw.ui.Step.call(
			this,
			'studio'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Studio, rw.ui.Step );

	rw.ui.Studio.prototype.load = function ( metadatas, records ) {
		rw.ui.Step.prototype.load.call( this, metadatas, records );

        this.generateUI();

        for ( word in this.records ) {
            this.setItemState = function( word, this.records.getState() )
        }
	};

	rw.ui.Studio.prototype.generateUI = function() {
	    this.$studio = $( '<div>' ).addClass( 'studio' )

        this.$studioButton = $( '<button>' ).addClass( 'studio-rbutton-inner' );
        this.$head = $( '<div>' ).addClass( 'studio-head' )
            .append( $( '<div>' ).addClass( 'studio-rbutton' ).append( this.$studioButton ) )
            .append( $( '<canvas>' ).addClass( 'studio-canvas' ).attr( 'height', '150' ) );

		this.$list = $( '<ul>' ).addClass( 'studio-wordlist' );
		this.recordItems = {};
		for( var i=0; i < this.metadatas.words.length; i++ ) {
		    this.recordItems[ this.metadatas.words[ i ] ] = $( '<li>' ).text( this.metadatas.words[ i ] );
		    this.$list.append( this.recordItems[ this.metadatas.words[ i ] ] );
		}

        this.$studio.append( this.$head ).append( this.$list );
        this.$container.prepend( this.$studio );
	};

	rw.ui.Studio.prototype.onReady = function() {
	    var ui = this;

        this.$studioButton.click( function() {
            ui.emit( 'studiobutton-click' );
        } );

		this.$list.children().click( function() {
		    var word = $( this ).text();
		    ui.emit( 'element-click', word );
		} );

        this.$head.addClass( 'studio-ready' );
	};

	rw.ui.Studio.prototype.onStart = function() {
	    this.$head.addClass( 'studio-rec' );
	};

	rw.ui.Studio.prototype.onRecord = function() {

	};

	rw.ui.Studio.prototype.onStop = function() {
	    this.$head.removeClass( 'studio-rec' );
	};

	rw.ui.Studio.prototype.onCancel = function() {

	};

	rw.ui.Studio.prototype.onSaturate = function() {

	};

	rw.ui.Studio.prototype.setSelectedItem = function( element ) {
	    $( '.studio-wordlist-selected' ).removeClass( 'studio-wordlist-selected' );
	    if ( this.recordItems[ element ] !== undefined ) {
	        this.recordItems[ element ].addClass( 'studio-wordlist-selected' );
	    }
	};

	rw.ui.Studio.prototype.setItemState = function( element, state ) {
	    // TODO: use a correlation table to asociate state and HTML class
	    if ( this.recordItems[ element ] !== undefined ) {
	        this.recordItems[ element ].removeClass();
	        this.recordItems[ element ].addClass( 'studio-wordlist-'+state );
	    }
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

