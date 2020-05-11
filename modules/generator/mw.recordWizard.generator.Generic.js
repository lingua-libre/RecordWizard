'use strict';

( function ( mw, $, rw, OO ) {

	/**
	 * Represents a generic word list Generator.
	 *
	 * @class GenericGenerator
	 * @constructor
	 */
	var GenericGenerator = function ( config ) {
		config = config || {};
		config.size = config.size || 'medium';
		GenericGenerator.parent.call( this, config );

		this.list = [];
		this.language = {};
		this.name = this.constructor.static.name;
		this.label = this.constructor.static.title;
		this.size = config.size;
		this.content = new OO.ui.PanelLayout( { padded: true, expanded: false } );
		this.params = {}; // rw.store.generator[ this.name ] || {};
	};
	OO.inheritClass( GenericGenerator, OO.ui.ProcessDialog );

	GenericGenerator.static.actions = [
		{ action: 'save', label: 'Done', flags: [ 'primary', 'progressive' ] },
		{ action: 'cancel', label: 'Cancel', flags: [ 'safe', 'back' ] }
	];

	GenericGenerator.prototype.initialize = function () {
		GenericGenerator.parent.prototype.initialize.apply( this, arguments );

		this.$body.append( this.content.$element );

		this.setSize( this.size );
		this.updateSize();
	};
	GenericGenerator.prototype.getReadyProcess = function ( data ) {
		this.language = rw.store.config.data.languages[ rw.store.record.data.metadata.language ];
		this.pastRecords = rw.store.config.data.pastRecords[ rw.store.record.data.metadata.language ];
		this.emit( 'open' );

		return GenericGenerator.parent.prototype.getReadyProcess.call( this, data );
	};
	GenericGenerator.prototype.getActionProcess = function ( action ) {
		if ( action === 'save' ) {
			return new OO.ui.Process( this.fetch, this ).next( this.finished, this );
		} else if ( action === 'cancel' ) {
			return new OO.ui.Process( this.canceled, this );
		}
		return GenericGenerator.parent.prototype.getActionProcess.call( this, action );
	};
	GenericGenerator.prototype.getBodyHeight = function () {
		var height = this.content.$element.outerHeight( true );
		return height > 210 ? height : 210;
	};

	GenericGenerator.prototype.isAlreadyRecorded = function ( word ) {
		return this.pastRecords.indexOf( word ) > -1;
	};

	GenericGenerator.prototype.fetch = function () {
		return true;
	};

	GenericGenerator.prototype.saveParams = function () {
		// rw.store.generator[ this.name ] = this.params;
	};

	GenericGenerator.prototype.finished = function () {
		rw.store.record.addWords( this.list );
		this.saveParams();
		this.close();
	};

	GenericGenerator.prototype.canceled = function () {
		this.saveParams();
		this.close();
	};

	rw.store.generator.generic = GenericGenerator;

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
