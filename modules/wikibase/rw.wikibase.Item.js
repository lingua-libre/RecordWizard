'use strict';

( function ( mw, $, rw, wb ) {

	var serialization = require( 'ext.recordWizard.wikibase.serialization' );
	var datamodel = require( 'wikibase.datamodel' );

	rw.wikibase.Item = function ( itemId ) {
		this.itemId = itemId || '';
		this.statementGroups = {};
		this.labels = {};
		this.descriptions = {};
		this.aliases = {};
	};

	rw.wikibase.Item.prototype.getId = function () {
		return this.itemId;
	};

	rw.wikibase.Item.prototype.setId = function ( itemId ) {
		this.itemId = itemId;
		return this;
	};

	rw.wikibase.Item.prototype.getStatement = function ( guid ) {
		var i, propertyId, statements;
		for ( propertyId in this.statementGroups ) {
			statements = this.statementGroups[ propertyId ];
			for ( i = 0; i < statements.length; i++ ) {
				if ( statements[ i ].getGUID() === guid ) {
					return statements[ i ];
				}
			}
		}
		return null;
	};

	rw.wikibase.Item.prototype.getStatements = function ( propertyId ) {
		var statements = [];

		if ( propertyId !== undefined ) {
			return this.statementGroups[ propertyId ] || null;
		}

		for ( propertyId in this.statementGroups ) {
			statements.push.apply( statements, this.statementGroups[ propertyId ] );
		}
		if ( statements.length > 0 ) {
			return statements;
		}
		return null;
	};

	rw.wikibase.Item.prototype.addStatement = function ( statement ) {
		var propertyId = statement.getPropertyId();
		if ( this.statementGroups[ propertyId ] === undefined ) {
			this.statementGroups[ propertyId ] = [];
		}
		this.statementGroups[ propertyId ].push( statement );

		return this;
	};

	rw.wikibase.Item.prototype.addStatements = function ( statements ) {
		var i,
			length = statements.length;

		for ( i = 0; i < length; i++ ) {
			this.addStatement( statements[ i ] );
		}

		return this;
	};

	// all statements MUST have the same propertyId
	rw.wikibase.Item.prototype.addOrReplaceStatements = function ( statements, removeExcess ) {
		var i, propertyId;

		if ( !Array.isArray( statements ) ) {
			statements = [ statements ];
		}
		propertyId = statements[ 0 ].getPropertyId();

		for ( i = 0; i < statements.length; i++ ) {
			this.addOrReplaceStatement( statements[ i ], i );
		}

		if ( removeExcess === true ) {
			this.statementGroups[ propertyId ].splice( i, this.statementGroups[ propertyId ].length - i );
		}

		return this;
	};

	rw.wikibase.Item.prototype.addOrReplaceStatement = function ( statement, index ) {
		var propertyId = statement.getPropertyId();
		index = index || 0;

		if ( this.statementGroups[ propertyId ] !== undefined ) {
			if ( this.statementGroups[ propertyId ].length > index ) {
				statement.setGUID( this.statementGroups[ propertyId ][ index ].getGUID() );
				this.statementGroups[ propertyId ][ index ] = statement;
				return this;
			}
		}

		this.addStatement( statement );
		return this;
	};

	rw.wikibase.Item.prototype.replaceStatement = function ( statement, GUID ) {
		var i,
			propertyId = statement.getPropertyId();

		for ( i = 0; i < this.statementGroups[ propertyId ].length; i++ ) {
			if ( this.statementGroups[ propertyId ][ i ].getGUID() === GUID ) {
				statement.setGUID( GUID );
				this.statementGroups[ propertyId ][ i ] = statement;
				break;
			}
		}

		return this;
	};

	rw.wikibase.Item.prototype.removeStatement = function ( guid ) {
		var i, propertyId, statements;

		for ( propertyId in this.statementGroups ) {
			statements = this.statementGroups[ propertyId ];
			for ( i = 0; i < statements.length; i++ ) {
				if ( statements[ i ].getGUID() === guid ) {
					statements.splice( i, 1 );
					return true;
				}
			}
		}
		return false;
	};

	rw.wikibase.Item.prototype.removeStatements = function ( propertyId ) {
		if ( propertyId !== undefined ) {
			if ( this.statementGroups[ propertyId ] !== undefined ) {
				delete this.statementGroups[ propertyId ];
				return true;
			}
			return false;
		}

		this.statementGroups = {};
		return true;
	};

	rw.wikibase.Item.prototype.getPropertyIds = function () {
		return Object.keys( this.statementGroups );
	};

	rw.wikibase.Item.prototype.countStatements = function ( propertyId ) {
		var length = 0;

		if ( propertyId !== undefined ) {
			return this.statementGroups[ propertyId ].length;
		}

		for ( propertyId in this.statementGroups ) {
			length += this.statementGroups[ propertyId ].length;
		}

		return length;
	};

	rw.wikibase.Item.prototype.getLabel = function ( lang ) {
		return this.labels[ lang ];
	};

	rw.wikibase.Item.prototype.getLabels = function () {
		return this.labels;
	};

	rw.wikibase.Item.prototype.setLabel = function ( lang, label ) {
		this.labels[ lang ] = label;
		return this;
	};

	rw.wikibase.Item.prototype.getDescription = function ( lang ) {
		return this.descriptions[ lang ];
	};

	rw.wikibase.Item.prototype.getDescriptions = function () {
		return this.descriptions;
	};

	rw.wikibase.Item.prototype.setDescription = function ( lang, description ) {
		this.descriptions[ lang ] = description;
		return this;
	};

	rw.wikibase.Item.prototype.getAlias = function ( lang ) {
		return this.aliases[ lang ];
	};

	rw.wikibase.Item.prototype.getAliases = function () {
		return this.aliases;
	};

	rw.wikibase.Item.prototype.addAlias = function ( lang, alias ) {
		if ( this.aliases[ lang ] === undefined ) {
			this.aliases[ lang ] = [];
		}
		this.aliases[ lang ].push( alias );
		return this;
	};

	rw.wikibase.Item.prototype.setAlias = function ( lang, alias ) {
		if ( typeof alias === 'string' ) {
			alias = [ alias ];
		}
		this.aliases[ lang ] = alias;
		return this;
	};

	rw.wikibase.Item.prototype._build = function () {
		var statementGroupSet = this._buildStatements(),
			fingerprint = this._buildFingerprint();

		return new datamodel.Item( this.itemId, fingerprint, statementGroupSet );
	};

	rw.wikibase.Item.prototype._buildStatements = function () {
		var i, propertyId, statements, statementList, statementGroup,
			statementGroupSet = new datamodel.StatementGroupSet();

		for ( propertyId in this.statementGroups ) {
			if ( this.statementGroups[ propertyId ].length > 0 ) {
				statements = [];
				for ( i = 0; i < this.statementGroups[ propertyId ].length; i++ ) {
					statements.push( this.statementGroups[ propertyId ][ i ]._build() );
				}
				statementList = new datamodel.StatementList( statements );
				statementGroup = new datamodel.StatementGroup( propertyId, statementList );
				statementGroupSet.addItem( statementGroup );
			}
		}

		return statementGroupSet;
	};

	rw.wikibase.Item.prototype._buildFingerprint = function () {
		var langCode, labelsTermMap, descriptionsTermMap, aliasesMultiTermMap,
			labelsMap = {},
			descriptionsMap = {},
			aliasesMap = {};

		for ( langCode in this.labels ) {
			labelsMap[ langCode ] = new datamodel.Term( langCode, this.labels[ langCode ] );
		}

		for ( langCode in this.descriptions ) {
			descriptionsMap[ langCode ] = new datamodel.Term( langCode, this.descriptions[ langCode ] );
		}

		for ( langCode in this.aliases ) {
			aliasesMap[ langCode ] = new datamodel.MultiTerm( langCode, this.aliases[ langCode ] );
		}

		labelsTermMap = new datamodel.TermMap( labelsMap );
		descriptionsTermMap = new datamodel.TermMap( descriptionsMap );
		aliasesMultiTermMap = new datamodel.MultiTermMap( aliasesMap );

		return new datamodel.Fingerprint( labelsTermMap, descriptionsTermMap, aliasesMultiTermMap );
	};

	rw.wikibase.Item.prototype.serialize = function () {
		var data = new serialization.ItemSerializer().serialize( this._build() );
		if ( this.itemId === '' ) {
			delete data.id;
		}
		return data;
	};

	rw.wikibase.Item.prototype.serializeStatements = function () {
		return new serialization.StatementGroupSerializer().serialize( this._buildStatements() );
	};

	rw.wikibase.Item.prototype.deserialize = function ( data ) {
		if ( data.type === 'item' ) {
			this.itemId = data.id;
			this.deserializeStatements( data.claims );
			this.deserializeFingerprint( data );
		}

		return this;
	};

	rw.wikibase.Item.prototype.deserializeStatements = function ( claims ) {
		var propertyId, i, statement;

		for ( propertyId in claims ) {
			for ( i = 0; i < claims[ propertyId ].length; i++ ) {
				statement = rw.wikibase.Statement.deserialize( claims[ propertyId ][ i ] );
				this.addStatement( statement );
			}
		}

		return this;
	};

	rw.wikibase.Item.prototype.deserializeFingerprint = function ( data ) {
		var langCode, i,
			aliasList = [];

		for ( langCode in data.labels ) {
			this.setLabel( langCode, data.labels[ langCode ].value );
		}
		for ( langCode in data.descriptions ) {
			this.setDescription( langCode, data.descriptions[ langCode ].value );
		}
		for ( langCode in data.aliases ) {
			aliasList = [];
			for ( i = 0; i < data.aliases[ langCode ].length; i++ ) {
				aliasList.push( data.aliases[ langCode ][ i ].value );
			}
			this.setAlias( langCode, aliasList );
		}

		return this;
	};

	rw.wikibase.Item.prototype.merge = function ( item ) {
		var lang, propertyId;

		for ( lang in item.labels ) {
			this.setLabel( lang, item.labels[ lang ] );
		}
		for ( lang in item.descriptions ) {
			this.setDescription( lang, item.descriptions[ lang ] );
		}
		for ( lang in item.aliases ) {
			this.setAliases( lang, item.aliases[ lang ] );
		}

		for ( propertyId in item.statementGroups ) {
			this.addOrReplaceStatements( item.statementGroups[ propertyId ], true );
		}
	};

	rw.wikibase.Item.prototype.copy = function ( item ) {
		// TODO: implement it
	};

	rw.wikibase.Item.prototype.getFromApi = function ( api ) {
		var item = this,
			repoApi = new wb.api.RepoApi( api || new mw.Api() );

		return repoApi.getEntities( this.itemId )
			.then( function ( data ) {
				var rawItem = data.entities[ item.itemId ];
				item.deserialize( rawItem );

				return item;
			} );
	};

	rw.wikibase.Item.prototype.createOrUpdate = function ( api, forceUpdateIfExist, deferred ) {
		var item = this,
			payload = {
				action: 'wbeditentity',
				format: 'json',
				formatversion: '2',
				data: JSON.stringify( this.serialize() ),
				clear: 1,
				errorformat: 'raw'
			};
		if ( this.itemId === '' ) {
			payload.new = 'item';
		} else {
			payload.id = this.itemId;
		}

		deferred = deferred || $.Deferred();

		api.postWithToken( 'csrf', payload )
			.then( function ( data ) {
				deferred.resolve( data );
			} )
			.fail( function ( code, result ) {
				var remoteQid, remoteItem;
				if ( code === 'modification-failed' &&
				item.itemId === '' &&
				forceUpdateIfExist === true &&
				result.errors !== undefined &&
				result.errors[ 0 ].key === 'wikibase-validator-label-with-description-conflict' ) {

					remoteQid = result.errors[ 0 ].params[ 2 ].match( /\[\[(.+)\|.+\]\]/ )[ 1 ];
					remoteItem = new rw.wikibase.Item( remoteQid );

					remoteItem.getFromApi( api ).then( function () {
						remoteItem.merge( item );
						remoteItem.createOrUpdate( api, false, deferred );
						item.copy( remoteItem );
					} ).fail( function () {
						deferred.reject( code, result );
					} );
				} else {
					deferred.reject( code, result );
				}
			} );

		return deferred;
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, wikibase ) );
