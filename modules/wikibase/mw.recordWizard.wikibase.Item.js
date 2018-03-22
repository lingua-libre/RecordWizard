( function ( mw, $, rw, wb ) {

	rw.wikibase.Item = function( itemId ) {
		this.itemId = itemId || '';
		this.statementGroups = {};
		this.labels = {};
		this.descriptions = {};
		this.aliases = {};
	};

	rw.wikibase.Item.prototype.getStatement = function( guid ) {
		for ( propertyId in this.statementGroups ) {
		    var statements = this.statementGroups[ propertyId ];
		    for ( var i=0; i < statements.length; i++ ) {
		        if ( statements[ i ].getGUID() === guid ) {
		            return statements[ i ];
		        }
		    }
		}
		return null;
	};

	rw.wikibase.Item.prototype.getStatements = function( propertyId ) {
		if ( propertyId !== undefined ) {
		    return this.statementGroups[ propertyId ] || null;
		}

		var statements = [];
		for ( propertyId in this.statementGroups ) {
		    statements.push.apply( statements, this.statementGroups[ propertyId ] );
		}
		if ( allStatements.length > 0 ) {
		    return allStatements;
		}
		return null;
	};

	rw.wikibase.Item.prototype.addStatement = function( statement ) {
		var propertyId = statement.getPropertyId();
		if ( this.statementGroups[ propertyId ] === undefined ) {
		    this.statementGroups[ propertyId ] = [];
		}
		this.statementGroups[ propertyId ].push( statement );

		return this;
	};

	rw.wikibase.Item.prototype.addStatements = function( statements ) {
		var length = statements.length;
		for ( var i=0; i < length; i++ ) {
		    this.addStatement( statements[ i ] );
		}

		return this;
	};

	// all statements MUST have the same propertyId
	rw.wikibase.Item.prototype.addOrReplaceStatements = function( statements, removeExcess ) {
		if ( ! Array.isArray( statements ) ) {
			statements = [ statements ];
		}

		var propertyId = statements[ 0 ].getPropertyId(),
			i;

		for ( i=0; i < statements.length; i++ ) {
			this.addOrReplaceStatement( statements[ i ], i );
		}

		if ( removeExcess === true ) {
			this.statementGroups[ propertyId ].splice( i, this.statementGroups[ propertyId ].length - i );
		}

		return this;
	};

	rw.wikibase.Item.prototype.addOrReplaceStatement = function( statement, index ) {
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

	rw.wikibase.Item.prototype.replaceStatement = function( statement, GUID ) {
		var propertyId = statement.getPropertyId();
		for ( var i=0; i < this.statementGroups[ propertyId ].length; i++ ) {
			if ( this.statementGroups[ propertyId ][ i ].getGUID() === GUID ) {
				statement.setGUID( GUID );
				this.statementGroups[ propertyId ][ i ] = statement;
				break;
			}
		}

		return this;
	};

	rw.wikibase.Item.prototype.removeStatement = function( guid ) {
		for ( propertyId in this.statementGroups ) {
		    var statements = this.statementGroups[ propertyId ];
		    for ( var i=0; i < statements.length; i++ ) {
		        if ( statements[ i ].getGUID() === guid ) {
		            statements.splice( i, 1 );
		            return true;
		        }
		    }
		}
		return false;
	};

	rw.wikibase.Item.prototype.removeStatements = function( propertyId ) {
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

	rw.wikibase.Item.prototype.getPropertyIds = function() {
		return Object.keys( this.statementGroups );
	};

	rw.wikibase.Item.prototype.countStatements = function( propertyId ) {
		var length = 0;

		if ( propertyId !== undefined ) {
		    return this.statementGroups[ propertyId ].length;
		}

		for ( propertyId in this.statementGroups ) {
		    length += this.statementGroups[ propertyId ].length;
		}

		return length;
	};

	rw.wikibase.Item.prototype.setLabel = function( lang, label ) {
		this.labels[ lang ] = label;
		return this;
	};

	rw.wikibase.Item.prototype.setDescription = function( lang, description ) {
		this.descriptions[ lang ] = description;
		return this;
	};

	rw.wikibase.Item.prototype.setAlias = function( lang, alias ) {
		if ( typeof alias === 'string' ) {
			alias = [ alias ];
		}
		this.aliases[ lang ] = alias;
		return this;
	};

	rw.wikibase.Item.prototype.addAlias = function( lang, alias ) {
		if ( this.aliases[ lang ] === undefined ) {
			this.aliases[ lang ] = [];
		}
		this.aliases[ lang ].push( alias );
		return this;
	};

	rw.wikibase.Item.prototype.getLabel = function( lang ) {
		return this.labels[ lang ];
	};

	rw.wikibase.Item.prototype.getLabels = function() {
		return this.labels;
	};

	rw.wikibase.Item.prototype.getDescription = function( lang ) {
		return this.descriptions[ lang ];
	};

	rw.wikibase.Item.prototype.getDescriptions = function() {
		return this.descriptions;
	};

	rw.wikibase.Item.prototype.getAlias = function( lang ) {
		return this.aliases[ lang ];
	};

	rw.wikibase.Item.prototype.getAliases = function() {
		return this.aliases[ lang ];
	};


	rw.wikibase.Item.prototype._build = function() {
		var statementGroupSet = this._buildStatements();
		var fingerprint = this._buildFingerprint();

		return new wb.datamodel.Item( this.itemId, fingerprint, statementGroupSet );
	};

	rw.wikibase.Item.prototype._buildStatements = function() {
		var statementGroupSet = new wb.datamodel.StatementGroupSet();

		for ( var propertyId in this.statementGroups ) {
		    if ( this.statementGroups[ propertyId ].length > 0 ) {
		        var statements = []
		        for ( var i=0; i < this.statementGroups[ propertyId ].length; i++ ) {
		            statements.push( this.statementGroups[ propertyId ][ i ]._build() );
		        }
		        var statementList = new wb.datamodel.StatementList( statements );
		        var statementGroup = new wb.datamodel.StatementGroup( propertyId, statementList );
		        statementGroupSet.addItem( statementGroup );
		    }
		}

		return statementGroupSet;
	};

	rw.wikibase.Item.prototype._buildFingerprint = function() {
		var labelsMap = {};
		for ( var langCode in this.labels ) {
		    labelsMap[ langCode ] = new wb.datamodel.Term( langCode, this.labels[ langCode ] );
		}

		var descriptionsMap = {};
		for ( var langCode in this.descriptions ) {
		    descriptionsMap[ langCode ] = new wb.datamodel.Term( langCode, this.descriptions[ langCode ] );
		}

		var labelsTermMap = new wb.datamodel.TermMap( labelsMap );
		var descriptionsTermMap = new wb.datamodel.TermMap( descriptionsMap );

		return new wb.datamodel.Fingerprint( labelsTermMap, descriptionsTermMap );
	};

	rw.wikibase.Item.prototype.serialize = function() {
		var data = new wb.serialization.ItemSerializer().serialize( this._build() );
		if ( this.itemId === '' ) {
		    delete data.id;
		}
		return data;
	};

	rw.wikibase.Item.prototype.serializeStatements = function( propertyId ) {
		return new wb.serialization.StatementGroupSerializer().serialize( this._buildStatements() );
	};

	rw.wikibase.Item.prototype.deserialize = function( data ) {
		if ( data.type === 'item' ) {
			this.itemId = data.id;
			this.deserializeStatements( data.claims );
			this.deserializeFingerprint( data );
		}

		return this;
	};

	rw.wikibase.Item.prototype.deserializeStatements = function( claims ) {
		for ( propertyId in claims ) {
			for ( var i=0; i < claims[ propertyId ].length; i++ ) {
				var statement = rw.wikibase.Statement.deserialize( claims[ propertyId ][ i ] );
				this.addStatement( statement );
			}
		}

		return this;
	};

	rw.wikibase.Item.prototype.deserializeFingerprint = function( data ) {
		for ( langCode in data.labels ) {
			this.setLabel( langCode, data.labels[ langCode ].value );
		}
		for ( langCode in data.descriptions ) {
			this.setDescription( langCode, data.descriptions[ langCode ].value );
		}
		for ( langCode in data.aliases ) {
			var aliasList = []
			for ( var i=0; i < data.aliases[ langCode ].length; i++ ) {
				aliasList.push( data.aliases[ langCode ][ i ].value );
			}
			this.setAlias( langCode, aliasList );
		}

		return this;
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, wikibase ) );

