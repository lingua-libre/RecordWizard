( function ( mw, $, rw, OO ) {

	/**
	 * Represents a generic word list Generator.
	 *
	 * @class rw.ui.License
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.generator.Generator = function( config ) {
	    config.size = config.size || 'medium';
	    rw.generator.Generator.parent.call( this, config );

        this.metadatas = config.metadatas;
        this.callback = config.callback;
	    this.list = [];
	    this.name = this.constructor.static.name;
	    this.label = this.constructor.static.title;
	    this.size = config.size;
	    this.params = this.metadatas.generator[ this.name ] || {};
        this.content = new OO.ui.PanelLayout( { padded: true, expanded: false } );
	};
    OO.inheritClass( rw.generator.Generator, OO.ui.ProcessDialog );

	rw.generator.Generator.static.name = '__generic__';
	rw.generator.Generator.static.title = '__generic__';
	rw.generator.Generator.static.actions = [
        { action: 'save', label: 'Done', flags: [ 'primary', 'progressive' ] },
        { action: 'cancel', label: 'Cancel', flags: [ 'safe', 'back' ] }
    ];


	rw.generator.Generator.prototype.initialize = function () {
	    rw.generator.Generator.parent.prototype.initialize.apply( this, arguments );

        this.$body.append( this.content.$element );

        this.setSize( this.size );
        this.updateSize();
    };
    rw.generator.Generator.prototype.getActionProcess = function ( action ) {
	    if ( action === 'save' ) {
		    return new OO.ui.Process( this.fetch, this ).next( this.finished, this );
	    }
	    else if ( action === 'cancel' ) {
		    return new OO.ui.Process( this.canceled, this );
	    }
	    return rw.generator.Generator.parent.prototype.getActionProcess.call( this, action );
    };
    rw.generator.Generator.prototype.getBodyHeight = function () {
	    return this.content.$element.outerHeight( true );
    };

	rw.generator.Generator.prototype.fetch = function() {
	    return true;
	};

	rw.generator.Generator.prototype.saveParams = function() {
	    this.metadatas.generator[ this.name ] = this.params;
	};

	rw.generator.Generator.prototype.finished = function() {
        this.callback( this.list );
        this.saveParams();
        this.close();
	};

	rw.generator.Generator.prototype.canceled = function() {
        this.saveParams();
        this.close();
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );




