( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's Confirm step.
	 *
	 * @class rw.ui.Confirm
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.Confirm = function() {
		var ui = this;

		rw.ui.Step.call(
			this,
			'confirm'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.Confirm, rw.ui.Step );

	rw.ui.Confirm.prototype.load = function ( metadatas, records ) {
		rw.ui.Step.prototype.load.call( this, metadatas, records );

		this.$list = $( '<ul>' );
		for( var i=0; i < this.records.length; i++ ) {
		    var $audio = $( '<audio>' )
		        .attr( 'src', this.records[ i ].getStashedFileUrl() )
		        .attr( 'controls', true );
		    var $li = $( '<li>' ).text( this.records[ i ].getTextualElement() )
		    this.$list.append( $li.prepend( $audio ) );
		}

        this.$container.prepend( this.$list );
	};

	rw.ui.Confirm.prototype.setItemState = function( index, state ) {
	    // We use here the text as reference instead of the index, as this callback
	    // can be called after a long time, some changes in the words order
	    // could have taken place in between
	    // TODO: use a correlation table to asociate state and HTML class
	    this.$list.children().eq( index ).removeClass();
	    this.$list.children().eq( index ).addClass( 'mwe-recwiz-' + state );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

