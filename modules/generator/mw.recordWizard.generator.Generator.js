'use strict';

( function ( mw, $, rw, OO ) {

	/**
	 * Represents a generic word list Generator.
	 *
	 * @class rw.ui.License
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.generator.Generator = function ( config ) {
		config.size = config.size || 'medium';
		rw.generator.Generator.parent.call( this, config );

		this.callback = config.callback;
		this.list = [];
		this.language = {};
		this.name = this.constructor.static.name;
		this.label = this.constructor.static.title;
		this.size = config.size;
		this.params = rw.metadatas.generator[ this.name ] || {};
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
	rw.generator.Generator.prototype.getReadyProcess = function ( data ) {
		this.language = rw.config.languages[ rw.metadatas.language ];
		this.pastRecords = rw.metadatas.locutor.languages[ rw.metadatas.language ].pastRecords;
		this.emit( 'open' );

		return rw.generator.Generator.parent.prototype.getReadyProcess.call( this, data );
	};
	rw.generator.Generator.prototype.getActionProcess = function ( action ) {
		if ( action === 'save' ) {
			return new OO.ui.Process( this.fetch, this ).next( this.finished, this );
		} else if ( action === 'cancel' ) {
			return new OO.ui.Process( this.canceled, this );
		}
		return rw.generator.Generator.parent.prototype.getActionProcess.call( this, action );
	};
	rw.generator.Generator.prototype.getBodyHeight = function () {
		var height = this.content.$element.outerHeight( true );
		return height > 210 ? height : 210;
	};

	rw.generator.Generator.prototype.isAlreadyRecorded = function ( word ) {
		return this.pastRecords.indexOf( word ) > -1;
	};

	rw.generator.Generator.prototype.fetch = function () {
		return true;
	};

	rw.generator.Generator.prototype.saveParams = function () {
		rw.metadatas.generator[ this.name ] = this.params;
	};

	rw.generator.Generator.prototype.finished = function () {
		this.callback( this.list );
		this.saveParams();
		this.close();
	};

	rw.generator.Generator.prototype.canceled = function () {
		this.saveParams();
		this.close();
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
