( function ( mw, $, rw, wb ) {

	rw.wikibase.Item = function( itemId ) {
		this.itemId = itemId || '';
		this.statementGroups = {};
		this.labels = {};
		this.descriptions = {};
		this.alias = {};
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

	rw.wikibase.Item.prototype.removeStatement = function( guid ) {
		for ( propertyId in this.statementGroups ) {
		    var statements = this.statementGroups[ propertyId ];
		    for ( var i=0; i < statements.length; i++ ) {
		        if ( statements[ i ].getGUID() === guid ) {
		            delete statements[ i ]
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

	rw.wikibase.Item.prototype.deserialize = function() {
		// TODO
	};

	rw.wikibase.Item.prototype.deserializeStatements = function( propertyId ) {
		// TODO
	};
	
	// TODO getter/setter for label, description, alias

}( mediaWiki, jQuery, mediaWiki.recordWizard, wikibase ) );

