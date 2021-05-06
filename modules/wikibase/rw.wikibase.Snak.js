'use strict';

( function ( mw, $, rw ) {

	var datamodel = require( 'wikibase.datamodel' );

	/*
	existing type and data structure it takes as value:
	commonsMedia            string
	geo-shape               string
	globe-coordinate        object{latitue:number, longitude:number, precision:number, [globe: string|null]}
	monolingualtext         object{languageCode:string, text:string}
	quantity                object{amount:number, unit:string|"1", [upperBound:number, lowerBound:number]}
	string                  string
	tabular-data            string
	time                    object{timestamp:string, [calendarModel:string, precision:number, before:number, after:number, timezone:number]}
	url                     string
	external-id             string
	wikibase-item           string
	wikibase-property       string
	math                    string
	*/

	rw.wikibase.Snak = function ( propertyId, type, value ) {
		this.propertyId = propertyId;
		this.type = type;
		this.value = value;
	};

	rw.wikibase.Snak.prototype.setPropertyId = function ( propertyId ) {
		this.propertyId = propertyId;
		return this;
	};

	rw.wikibase.Snak.prototype.setType = function ( type ) {
		this.type = type;

		if ( this.type === 'novalue' ) {
			this.value = null;
		}
		if ( this.type === 'somevalue' ) {
			this.value = undefined;
		}

		return this;
	};

	rw.wikibase.Snak.prototype.setValue = function ( value ) {
		this.value = value;
		return this;
	};

	rw.wikibase.Snak.prototype.getPropertyId = function () {
		return this.propertyId;
	};

	rw.wikibase.Snak.prototype.getType = function () {
		return this.type;
	};

	rw.wikibase.Snak.prototype.getValue = function () {
		return this.value;
	};

	rw.wikibase.Snak.prototype._build = function () {
		var value, coordinates;

		if ( this.value === null ) {
			return new datamodel.PropertyNoValueSnak( this.propertyId );
		}
		if ( this.value === undefined ) {
			return new datamodel.PropertySomeValueSnak( this.propertyId );
		}

		switch ( this.type ) {
			case 'novalue':
				return new datamodel.PropertyNoValueSnak( this.propertyId );
			case 'somevalue':
				return new datamodel.PropertySomeValueSnak( this.propertyId );
			case 'globe-coordinate':
				// TODO: calculate precision if not given
				this.value.precision = 0.0001;
				coordinates = new globeCoordinate.GlobeCoordinate( this.value );
				value = new dataValues.GlobeCoordinateValue( coordinates );
				break;
			case 'monolingualtext':
				value = new dataValues.MonolingualTextValue( this.value.language, this.value.text );
				break;
			case 'quantity':
				value = new dataValues.QuantityValue( this.value.amount, this.value.unit, this.value.upperbound || null, this.value.lowerbound || null );
				break;
			case 'string':
				value = new dataValues.StringValue( this.value );
				break;
			case 'time':
				// TODO: allow Date object and convert them with d.setUTCHours(0,0,0,0);timestamp = d.toISOString().slice(0,-5)+'Z';
				if ( this.value.calendarmodel !== undefined ) {
					this.value.calendarModel = this.value.calendarmodel;
				}
				value = new dataValues.TimeValue( this.value.time, this.value );
				break;
			case 'wikibase-item':
				value = new datamodel.EntityId( this.value );
				break;
			case 'wikibase-property':
				value = new datamodel.EntityId( this.value );
				break;

			// covers commonsMedia, geo-shape, tabular-data, url, external-id and math
			default:
				value = new dataValues.StringValue( this.value );
				break;
		}
		return new datamodel.PropertyValueSnak( this.propertyId, value );
	};

	rw.wikibase.Snak.deserialize = function ( data ) {
		var value,
			propertyId = data.property,
			type = data.snaktype;

		if ( type !== 'value' ) {
			return new rw.wikibase.Snak( propertyId, type );
		}

		type = data.datatype;
		value = data.datavalue.value;
		switch ( type ) {
			case 'wikibase-item':
				value = value.id;
				break;
			case 'wikibase-property':
				value = value.id;
				break;
		}

		return new rw.wikibase.Snak( propertyId, type, value );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard ) );
