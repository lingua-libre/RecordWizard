( function ( mw, $, rw, OO ) {

	rw.generator.Nearby = function( config ) {
		rw.generator.Generator.call( this, config );
	};

	OO.inheritClass( rw.generator.Nearby, rw.generator.Generator );
	rw.generator.Nearby.static.name = 'nearby';
	rw.generator.Nearby.static.title = mw.message( 'mwe-recwiz-generator-nearby' ).text();

    rw.generator.Nearby.prototype.initialize = function() {

        this.latitude = new OO.ui.TextInputWidget( { placeholder: mw.message( 'mwe-recwiz-nearby-latitude' ).text() } );
        this.longitude = new OO.ui.TextInputWidget( { placeholder: mw.message( 'mwe-recwiz-nearby-longitude' ).text() } );
        this.currentPositionButton = new OO.ui.ButtonWidget( { title: mw.message( 'mwe-recwiz-nearby-getcoordinates' ).text(), icon: 'tag' } );
        this.limit = new OO.ui.NumberInputWidget( { min: 1, max: 500, value: 100, step: 10, pageStep: 100, isInteger: true } );
        this.wikidata = new OO.ui.RadioOptionWidget( { label: 'Wikidata' } );
        this.source = new OO.ui.RadioSelectWidget( { items: [ this.wikidata ] } );

		this.layout = new OO.ui.Widget( {
	        classes: [ 'mwe-recwiz-nearby' ],
	        content: [
	            new OO.ui.FieldLayout(
	                new OO.ui.Widget( {
	                    content: [
	                        new OO.ui.HorizontalLayout( { items: [ this.latitude, this.longitude, this.currentPositionButton ], } )
		                ]
		            } ), {
	                    align: 'top',
	                    label: mw.message( 'mwe-recwiz-nearby-coordinates' ).text(),
	                    help: mw.message( 'mwe-recwiz-nearby-coordinates-help' ).text(),
                    }
		        ),
	            new OO.ui.FieldLayout(
	                this.limit, {
	                    align: 'top',
	                    label: mw.message( 'mwe-recwiz-nearby-limit' ).text(),
	                    help: mw.message( 'mwe-recwiz-nearby-limit-help' ).text(),
                    }
		        ),
	            new OO.ui.FieldLayout(
	                this.source, {
	                    align: 'top',
	                    label: mw.message( 'mwe-recwiz-nearby-source' ).text()
                    }
		        )
	        ],
	    } );


		this.content.$element.append( this.layout.$element );

	    this.latitude.setValue( this.params.latitude );
	    this.longitude.setValue( this.params.longitude );
	    this.limit.setValue( this.params.limit || this.limit.getValue() );
        this.source.selectItem( this.wikidata );

        this.currentPositionButton.on( 'click', this.getCurrentPosition.bind( this ) );
        this.latitude.on( 'change', this.unlockUI.bind( this ) );
        this.longitude.on( 'change', this.unlockUI.bind( this ) );

        rw.generator.Generator.prototype.initialize.call( this );
    };



	rw.generator.Nearby.prototype.getCurrentPosition = function() {
	    this.lockUI();
        navigator.geolocation.getCurrentPosition(
            this.onPositionSuccess.bind( this ),
            this.onPositionError.bind( this ),
            {
                timeout: 10000, //10 seconds
                maximumAge: 3600000 //1 hour
            }
        );
	};

	rw.generator.Nearby.prototype.onPositionSuccess = function( pos ) {
	    this.unlockUI();
        this.latitude.setValue( pos.coords.latitude );
        this.longitude.setValue( pos.coords.longitude );
        this.currentPositionButton.setFlags( { 'destructive': false } );
	};

	rw.generator.Nearby.prototype.onPositionError = function( error ) {
	    this.unlockUI();
	    var errorMessage = mw.message( 'mwe-recwiz-error-cantgetposition', error.message ).text();
        this.showErrors( new OO.ui.Error( errorMessage, { recoverable: false } ) );
	};

	rw.generator.Nearby.prototype.lockUI = function() {
        this.currentPositionButton.setDisabled( true );
        this.latitude.setDisabled( true );
        this.longitude.setDisabled( true );
        this.latitude.pushPending();
        this.longitude.pushPending();
	};

	rw.generator.Nearby.prototype.unlockUI = function() {
        this.currentPositionButton.setDisabled( false );
        this.latitude.setDisabled( false );
        this.longitude.setDisabled( false );
        this.latitude.popPending();
        this.longitude.popPending();

        this.getActions().get( { actions: 'save' } )[ 0 ].setDisabled( false );
	};

	rw.generator.Nearby.prototype.fetch = function() {
        var generator = this,
	        lat = this.latitude.getValue(),
	        lng = this.longitude.getValue(),
	        limit = parseInt( this.limit.getValue() );

	    // save the inputs for a potential futur preload
	    this.params.latitude = lat;
	    this.params.longitude = lng;
	    this.params.limit = limit;

	    this.deferred = $.Deferred();
	    this.wikidataApi = new mw.ForeignApi( 'https://www.wikidata.org/w/api.php', {
	        anonymous: true,
	        parameters: { 'origin': '*' },
	        ajax: { timeout: 10000 }
	    } );
	    this.list = [];

	    this.wikidataApi.get( {
	        'action': 'query',
	        'format': 'json',
	        'formatversion': '2',
	        'list': 'geosearch',
	        'gscoord': lat + '|' + lng,
	        'gsradius': '10000',
	        'gslimit': limit,
        } ).then( this.getTitlesFromIds.bind( this ) )
        .fail( function( error ) {
            generator.deferred.reject( new OO.ui.Error( error ) );
        } );

        // We're not done yet, make the dialog closing process to wait the promise
        return this.deferred.promise();
	};

	rw.generator.Nearby.prototype.getTitlesFromIds = function( data ) {
        var generator = this,
            geosearch = data.query.geosearch,
            pages = [],
            semaphore = 0,
            langCode = 'fr'; //TODO: make that value dynamic

        if ( geosearch.length === 0 ) {
            var errorMessage = mw.message( 'mwe-recwiz-warning-noresults' ).text();
            this.deferred.reject( new OO.ui.Error( errorMessage, { warning: true, recoverable: false } ) );
            return;
        }

        for ( var i=0; i < geosearch.length; i++ ) {
            pages.push( geosearch[ i ].title );
        }

        while ( pages.length > 0 ) {
            semaphore++;
            this.wikidataApi.get( {
	            'action': 'wbgetentities',
	            'format': 'json',
	            'ids': pages.splice( -50, 50 ).join( '|' ),
	            'props': 'labels',
	            'languages': langCode,
	            'formatversion': '2',
            } ).then( function( data ) {
                semaphore--;
                for ( qid in data.entities ) {
                    var entity = data.entities[ qid ];
                    if ( entity.missing !== undefined ) {
                        continue;
                    }

                    if ( entity.labels[ langCode ] !== undefined ) {
                        generator.list.push( entity.labels[ langCode ].value );
                    }
                }
                if ( semaphore === 0 ) {
                    generator.deferred.resolve();
                }
            } ).fail( function( error ) {
                generator.deferred.reject( new OO.ui.Error( error ) );
            } );
        }
    };

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

