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
			rw.metadatas.locutor = rw.config.locutor;
		}

		rw.controller.Step.prototype.load.call( this );

		this.ui.on( 'profile-change', this.onProfileChange.bind( this ) );
	};

	rw.controller.Locutor.prototype.moveNext = function () {
		var controller = this;
		var deferred = $.Deferred();

		this.ui.collect();

		//TODO: check that all required fields are set

		//TODO: create/update a wikibase item
		var repoApi = new wb.api.RepoApi( this.api );
		if ( rw.metadatas.locutor.qid === null ) {
			var item = this.createLocutorItem( mw.config.get( 'wgUserName' ), rw.metadatas.locutor.gender, rw.metadatas.locutor.languages );
			repoApi.createEntity( 'item', item.serialize() )
			.then( function( data ) {
				rw.metadatas.locutor.qid = data.entity.id;
				deferred.resolve();
			} )
			.fail( function( code, data ) {
				console.log( code );
				console.log( data );
				//TODO: manage errors
			} );
		}
		else {
			//TODO: update already existing items
			deferred.resolve();
		}

		deferred.then( function() {
			controller.api.saveOptions( {
				'recwiz-locutor': rw.metadatas.locutor.qid,
			} )
			.then( function() {
				rw.controller.Step.prototype.moveNext.call( controller );
			} )
			.fail( function() {
				// TODO: manage param saving errors
			} );
		} );
	};

	rw.controller.Locutor.prototype.onProfileChange = function( locutorQid ) {
		var profile = {};
		if ( rw.config.locutor.qid === locutorQid ) {
			profile = rw.config.locutor;
		}
		else if ( locutorQid[ 0 ] === 'Q' ) {
			profile = rw.config.otherLocutors[ locutorQid ];
		}

		this.ui.populateProfile( profile );
	};

	rw.controller.Locutor.prototype.createLocutorItem = function ( name, gender, languages ) {
		var item = new mw.recordWizard.wikibase.Item();
		item.labels = { en: name };
		item.descriptions = { en: 'locutor of ' + mw.config.get( 'wgUserName' ) };

		//TODO: make property and item configuration-dependant, and not hardcoded
		item.addStatement( new mw.recordWizard.wikibase.Statement( 'P2' ).setType( 'wikibase-item' ).setValue( 'Q3' ) );
		item.addStatement( new mw.recordWizard.wikibase.Statement( 'P11' ).setType( 'external-id' ).setValue( '0x010C' ).setRank( 2 ) );
		item.addStatement( new mw.recordWizard.wikibase.Statement( 'P9' ).setType( 'wikibase-item' ).setValue( gender ) );

		for ( var i=0; i < languages.length; i++ ) {
			item.addStatement( new mw.recordWizard.wikibase.Statement( 'P4' )
				.setType( 'wikibase-item' )
				.setValue( languages[ i ] )
				//TODO: support language level: .addQualifier( new mw.recordWizard.wikibase.Snak( 'P13', 'wikibase-item', 'Q...' ) )
			);
		}

		return item;
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO, wikibase ) );

