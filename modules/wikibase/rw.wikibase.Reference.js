'use strict';

( function ( mw, $, rw ) {

	var datamodel = require( 'wikibase.datamodel' );

	rw.wikibase.Reference = function ( hash ) {
		this.hash = hash || null;
		this.snaksOrder = [];
		this.snaks = {}; // TODO: use an object like { P31: [], P42: [], ...}
	};

	rw.wikibase.Reference.prototype.setHash = function ( hash ) {
		this.hash = hash;
		return this;
	};

	rw.wikibase.Reference.prototype.getHash = function () {
		return this.hash;
	};

	rw.wikibase.Reference.prototype.setSnaksOrder = function ( snaksOrder ) {
		this.snaksOrder = snaksOrder;
		return this;
	};

	rw.wikibase.Reference.prototype.getSnaksOrder = function () {
		return this.snaksOrder;
	};

	rw.wikibase.Reference.prototype.addSnak = function ( snak ) {
		var propertyId = snak.getPropertyId();

		if ( this.snaks[ propertyId ] === undefined ) {
			this.snaks[ propertyId ] = [];
		}
		this.snaks[ propertyId ].push( snak );
		return this;
	};

	rw.wikibase.Reference.prototype.addSnaks = function ( snaks ) {
		var i;
		for ( i = 0; i < snaks.length; i++ ) {
			this.addSnak( snaks[ i ] );
		}
		return this;
	};

	rw.wikibase.Reference.prototype.getSnaks = function ( propertyId ) {
		if ( propertyId !== undefined ) {
			return this.snaks[ propertyId ];
		}
		return this.snaks;
	};

	rw.wikibase.Reference.prototype.removeSnaks = function ( propertyId ) {
		if ( propertyId !== undefined ) {
			delete this.snaks[ propertyId ];
		} else {
			this.snaks = {};
		}

		return this;
	};

	rw.wikibase.Reference.prototype.removeSnak = function ( snak ) {
		var propertyId = snak.getPropertyId(),
			index = this.snaks[ propertyId ].indexOf( snak );

		if ( index > -1 ) {
			this.snaks[ propertyId ].splice( index, 1 );
		}

		return this;
	};

	rw.wikibase.Reference.prototype._build = function () {
		var i,
			referenceSnakList = new datamodel.SnakList();
		for ( i = 0; i < this.snaks.length; i++ ) {
			referenceSnakList.addItem( this.snaks[ i ]._build() );
		}
		return new datamodel.Reference( referenceSnakList, this.hash ); // TODO: manage snaksOrder
	};

	rw.wikibase.Reference.deserialize = function ( data ) {
		var i, propertyId, snak,
			reference = new rw.wikibase.Reference( data.hash );

		reference.setSnaksOrder( data[ 'snaks-order' ] );

		for ( propertyId in data.snaks ) {
			for ( i = 0; i < data.snaks[ propertyId ].length; i++ ) {
				snak = data.snaks[ propertyId ][ i ];
				reference.addSnak( rw.wikibase.Snak.deserialize( snak ) );
			}
		}

		return reference;
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard ) );
