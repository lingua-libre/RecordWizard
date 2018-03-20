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

	rw.controller.Details.prototype.load = function () {
		rw.controller.Step.prototype.load.call( this );

		this.generators = {};

        if ( rw.metadatas.generator === undefined ) {
            rw.metadatas.generator = {};
        }
        for ( className in rw.generator ) {
            this.setupGenerator( className );
        }

		this.ui.on( 'wordlist-add', this.onWordListAdd.bind( this ) );
		this.ui.on( 'wordlist-change', this.onWordListChange.bind( this ) );
	};

	rw.controller.Details.prototype.moveNext = function () {
		this.ui.collect();

		//TODO: check that the language field is set
		//TODO: warning if no words (but allowed to continue)

		this.api.saveOptions( {
			'recwiz-lang': '', //TODO: save lang
		} );
		rw.controller.Step.prototype.moveNext.call( this );
	};

	rw.controller.Details.prototype.setupGenerator = function( className ) {
        var name = rw.generator[ className ].static.name;

        if ( name === '__generic__' ) {
        	return;
        }

        this.generators[ name ] = new rw.generator[ className ]( {
            callback: this.addWords.bind( this ),
        } );

        this.ui.addGeneratorButton( this.generators[ name ] );
	};

	rw.controller.Details.prototype.addWords = function( list ) {
	    if ( list.length > 0 ) {
	        for ( var i=0; i < list.length; i++ ) {
	        	var word = list[ i ],
	        		extra = {};
	        	if ( typeof list[ i ] !== 'string' ) {
	            	word = list[ i ].text;
	            	delete list[ i ].text;
	            	extra = list[ i ];
	           	}

	           	this.ui.addWord( word );
	           	rw.records[ word ].setExtra( extra );
	        }
	    }
	};

	rw.controller.Details.prototype.onWordListAdd = function( word, index ) {
       	if ( rw.records[ word ] === undefined ) {
       		rw.records[ word ] = new rw.Record( word );
       	}
	};

	rw.controller.Details.prototype.onWordListChange = function() {
		var nbWords = this.ui.countWords();
		//TODO: find a place to display word count
		if ( nbWords === 0 ) {
	    	//mw.message( 'mwe-recwiz-generator-noword' ).text();
	  	}
	  	else {
	    	//mw.message( 'mwe-recwiz-generator-wordcount', nbWords ).text();
	  	}
	};

}( mediaWiki, mediaWiki.recordWizard, jQuery, OO, wikibase ) );

