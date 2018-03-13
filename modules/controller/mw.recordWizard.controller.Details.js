( function ( mw, rw, $, OO, wb ) {
	/**
	 * The Details step.
	 *
	 * @class
	 * @extends mw.recordWizard.controller.Step
	 * @param {mw.Api} api
	 * @param {Object} config RecordWizard config object.
	 */
	rw.controller.Details = function( api, config ) {
		rw.controller.Step.call(
			this,
			new rw.ui.Details(),
			api,
			config
		);

		this.stepName = 'details';
	};

	OO.inheritClass( rw.controller.Details, rw.controller.Step );

	rw.controller.Details.prototype.load = function ( metadatas, records ) {
		if ( metadatas.locutor === undefined ) {
			metadatas.locutor = rw.config.locutor;
		}

		rw.controller.Step.prototype.load.call( this, metadatas, records );

		/*this.ui.substeps.locutor.on( 'change', ... );
		this.ui.substeps.param.on( 'change', ... );
		this.ui.substeps.param.on( 'change', ... );*/
	};

	rw.controller.Details.prototype.moveNext = function () {
		var controller = this;
		var deferred = $.Deferred();

		this.ui.collect();

		//TODO: check that all required fields are set (locutor, language)
		//TODO: warning if no words (but allowed to continue)

		//TODO: create/update a wikibase item
		var repoApi = new wb.api.RepoApi( this.api );
		if ( this.metadatas.locutor.qid === null ) {
			var item = this.createLocutorItem( mw.config.get( 'wgUserName' ), this.metadatas.locutor.gender, this.metadatas.locutor.languages );
			repoApi.createEntity( 'item', item.serialize() )
			.then( function( data ) {
				controller.metadatas.locutor.qid = data.entity.id;
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
				'recwiz-locutor': controller.metadatas.locutor.qid,
				'recwiz-lang': '',
			} )
			.then( function() {
				rw.controller.Step.prototype.moveNext.call( controller );
			} )
			.fail( function() {
				// TODO: manage param saving errors
			} );
		} );
	};

	rw.controller.Details.prototype.createLocutorItem = function ( name, gender, languages) {
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
				.setValue( this.metadatas.locutor.languages[ i ] )
				//TODO: support language level: .addQualifier( new mw.recordWizard.wikibase.Snak( 'P13', 'wikibase-item', 'Q...' ) )
			);
		}

		return item;
	};

	rw.controller.Details.prototype.movePrevious = function () {
		// XXX do stuff

		rw.controller.Step.prototype.movePrevious.call( this );
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO, wikibase ) );

