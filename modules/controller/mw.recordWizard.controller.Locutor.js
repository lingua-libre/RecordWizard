( function ( mw, rw, $, OO, wb ) {
	/**
	 * The Locutor step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Locutor = function( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Locutor(),
			api,
			config
		);

		this.stepName = 'locutor';
	};

	OO.inheritClass( rw.controller.Locutor, rw.controller.Step );

	rw.controller.Locutor.prototype.load = function () {
		if ( rw.metadatas.locutor === undefined ) {
			rw.metadatas.locutor = {};
		}

		rw.controller.Step.prototype.load.call( this );

		this.ui.on( 'profile-change', this.onProfileChange.bind( this ) );
	};

	rw.controller.Locutor.prototype.onProfileChange = function( locutorQid ) {
		var locutor = {};
		if ( rw.config.locutor.qid === locutorQid ) {
			locutor = rw.config.locutor;
		}
		else if ( locutorQid[ 0 ] === 'Q' ) {
			locutor = rw.config.otherLocutors[ locutorQid ];
		}

		this.ui.populateProfile( locutor );
	};

	rw.controller.Locutor.prototype.moveNext = function () {
		var controller = this,
			process = new OO.ui.Process();

		this.ui.collect();
		//TODO: check that all required fields are set
		this.wbItem = new mw.recordWizard.wikibase.Item();

		if ( ! rw.metadatas.locutor.new ) {
			process.next( this.getExistingWbItem, this ) //get the existing item
		}

		process.next( this.fillWbItem, this ) //save the formed item
		process.next( this.createOrUpdateWbItem, this ) //save the formed item
		process.next( this.updateConfig, this ) //update recordWizard's locutors config
		process.next( this.saveOptions, this ) //save options
		process.next( rw.controller.Step.prototype.moveNext, this ); //go next

		process.execute();
	};

	rw.controller.Locutor.prototype.getExistingWbItem = function () {
		return this.wbItem.setId( rw.metadatas.locutor.qid ).getFromApi( this.api );
	};

	rw.controller.Locutor.prototype.fillWbItem = function () {
		var name = rw.metadatas.locutor.name,
			gender = rw.metadatas.locutor.gender,
			languages = rw.metadatas.locutor.languages;

		this.wbItem.labels = { en: name };
		this.wbItem.descriptions = { en: 'locutor of the user "' + mw.config.get( 'wgUserName' ) + '"' };

		//TODO: make property and item configuration-dependant, and not hardcoded

		this.wbItem.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( 'P2' ).setType( 'wikibase-item' ).setValue( 'Q3' ), true );
		this.wbItem.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( 'P11' ).setType( 'external-id' ).setValue( mw.config.get( 'wgUserName' ) ).setRank( 2 ), true );
		this.wbItem.addOrReplaceStatements( new mw.recordWizard.wikibase.Statement( 'P9' ).setType( 'wikibase-item' ).setValue( gender ), true );

		var languageStatements = [];
		for ( var i=0; i < languages.length; i++ ) {
			languageStatements.push( new mw.recordWizard.wikibase.Statement( 'P4' )
				.setType( 'wikibase-item' )
				.setValue( languages[ i ] )
				//TODO: support language level: .addQualifier( new mw.recordWizard.wikibase.Snak( 'P13', 'wikibase-item', 'Q...' ) )
			);
		}
		this.wbItem.addOrReplaceStatements( languageStatements, true );
	};

	rw.controller.Locutor.prototype.createOrUpdateWbItem = function () {
		return this.wbItem.createOrUpdate( this.api )
		.then( function( data ) {
			rw.metadatas.locutor.qid = data.entity.id;
		} )
		.fail( function( code, data ) {
			console.log( code );
			console.log( data );
			//TODO: manage errors
		} );
	};

	rw.controller.Locutor.prototype.updateConfig = function () {
		if ( rw.metadatas.locutor.main ) {
			rw.config.locutor = rw.metadatas.locutor;
		}
		else {
			rw.config.otherLocutors[ rw.metadatas.locutor.qid ] = rw.metadatas.locutor;
		}
	};

	rw.controller.Locutor.prototype.saveOptions = function () {
		return this.api.saveOptions( {
			'recwiz-locutor': rw.config.locutor.qid,
			'recwiz-otherLocutors': Object.keys( rw.config.otherLocutors ).join( ',' )
		} ).fail( function() {
			// TODO: manage errors
		} );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO, wikibase ) );

