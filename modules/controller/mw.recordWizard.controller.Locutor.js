'use strict';

( function ( mw, rw, $, OO ) {
	/**
	 * The Locutor step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Locutor = function ( api, config ) {
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

	rw.controller.Locutor.prototype.onProfileChange = function ( locutorQid ) {
		var locutor = {};
		if ( locutorQid === rw.config.locutor.qid || locutorQid === '*' ) {
			locutor = rw.config.locutor;
		} else if ( locutorQid[ 0 ] === 'Q' ) {
			locutor = rw.config.otherLocutors[ locutorQid ];
		}

		this.ui.populateProfile( locutor );
	};

	rw.controller.Locutor.prototype.moveNext = function () {
		var qid,
			process = new OO.ui.Process();

		this.ui.collect();
		if ( rw.metadatas.locutor.name === '' ) {
			OO.ui.alert( mw.msg( 'mwe-recwiz-error-noname' ) );
			return;
		}
		if ( rw.metadatas.locutor.name === rw.config.locutor.name && rw.metadatas.locutor.main !== true ) {
			OO.ui.alert( mw.msg( 'mwe-recwiz-error-duplicatename', rw.metadatas.locutor.name ) );
			return;
		}
		for ( qid in rw.config.otherLocutors ) {
			if ( rw.metadatas.locutor.name === rw.config.otherLocutors[ qid ].name && rw.metadatas.locutor.qid !== qid ) {
				OO.ui.alert( mw.msg( 'mwe-recwiz-error-duplicatename', rw.metadatas.locutor.name ) );
				return;
			}
		}
		if ( Object.keys( rw.metadatas.locutor.languages ).length === 0 ) {
			OO.ui.alert( mw.msg( 'mwe-recwiz-error-nolanguages' ) );
			return;
		}

		this.wbItem = new mw.recordWizard.wikibase.Item();

		if ( !rw.metadatas.locutor.new ) {
			process.next( this.getExistingWbItem, this ); // get the existing item
		}

		process.next( this.fillWbItem, this ); // save the formed item
		process.next( this.createOrUpdateWbItem, this ); // save the formed item
		process.next( this.updateConfig, this ); // update recordWizard's locutors config
		process.next( this.saveOptions, this ); // save options
		process.next( rw.controller.Step.prototype.moveNext, this ); // go next

		process.execute();
	};

	rw.controller.Locutor.prototype.getExistingWbItem = function () {
		return this.wbItem.setId( rw.metadatas.locutor.qid ).getFromApi( this.api );
	};

	rw.controller.Locutor.prototype.fillWbItem = function () {
		var qid,
			name = rw.metadatas.locutor.name,
			gender = rw.metadatas.locutor.gender,
			location = rw.metadatas.locutor.location,
			languages = rw.metadatas.locutor.languages,
			instanceOfStatement = new mw.recordWizard.wikibase.Statement( rw.config.properties.instanceOf ).setType( 'wikibase-item' ).setValue( rw.config.items.locutor ),
			userStatement = new mw.recordWizard.wikibase.Statement( rw.config.properties.linkedUser ).setType( 'external-id' ).setValue( mw.config.get( 'wgUserName' ) ).setRank( 2 ),
			locationStatement = new mw.recordWizard.wikibase.Statement( rw.config.properties.residencePlace ),
			genderStatement = new mw.recordWizard.wikibase.Statement( rw.config.properties.gender ),
			languageStatements = [];

		this.wbItem.labels = { en: name };
		this.wbItem.descriptions = { en: 'locutor of the user "' + mw.config.get( 'wgUserName' ) + '"' };

		locationStatement.setType( location === '' ? 'somevalue' : 'external-id' ).setValue( location );
		genderStatement.setType( gender === null ? 'somevalue' : 'wikibase-item' ).setValue( gender );

		this.wbItem.addOrReplaceStatements( instanceOfStatement, true );
		this.wbItem.addOrReplaceStatements( userStatement, true );
		this.wbItem.addOrReplaceStatements( locationStatement, true );
		this.wbItem.addOrReplaceStatements( genderStatement, true );

		for ( qid in languages ) {
			languageStatements.push( new mw.recordWizard.wikibase.Statement( rw.config.properties.spokenLanguages )
				.setType( 'wikibase-item' )
				.setValue( qid )
				.addQualifier( new mw.recordWizard.wikibase.Snak(
					rw.config.properties.languageLevel,
					'wikibase-item',
					languages[ qid ].languageLevel
				) )
				.addQualifier( new mw.recordWizard.wikibase.Snak(
					rw.config.properties.learningPlace,
					'external-id',
					languages[ qid ].location
				) )
			);
		}
		this.wbItem.addOrReplaceStatements( languageStatements, true );
	};

	rw.controller.Locutor.prototype.createOrUpdateWbItem = function () {
		return this.wbItem.createOrUpdate( this.api )
			.then( function ( data ) {
				rw.metadatas.locutor.qid = data.entity.id;
			} )
			.fail( function ( code, data ) {
				console.log( code );
				console.log( data );
			// TODO: manage errors
			} );
	};

	rw.controller.Locutor.prototype.updateConfig = function () {
		if ( rw.metadatas.locutor.main ) {
			rw.config.locutor = rw.metadatas.locutor;
		} else {
			rw.config.otherLocutors[ rw.metadatas.locutor.qid ] = rw.metadatas.locutor;
		}
	};

	rw.controller.Locutor.prototype.saveOptions = function () {
		return this.api.saveOptions( {
			'recwiz-locutor': rw.config.locutor.qid,
			'recwiz-otherLocutors': Object.keys( rw.config.otherLocutors ).join( ',' ),
			'recwiz-license': rw.metadatas.license
		} ).fail( function () {
			// TODO: manage errors
		} );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO ) );
