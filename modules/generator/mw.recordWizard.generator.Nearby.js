( function ( mw, $, rw, OO ) {

	rw.generator.Nearby = function( metadatas ) {
		rw.generator.Generator.call( this, metadatas );

        this.latitude = new OO.ui.TextInputWidget( { placeholder: mw.message( 'mwe-recwiz-nearby-latitude' ).text() } );
        this.longitude = new OO.ui.TextInputWidget( { placeholder: mw.message( 'mwe-recwiz-nearby-longitude' ).text() } );
        this.currentPositionButton = new OO.ui.ButtonWidget( { title: mw.message( 'mwe-recwiz-nearby-getcoordinates' ).text(), icon: 'tag' } );
        this.limit = new OO.ui.NumberInputWidget( { min: 1, max: 500, step: 10, isInteger: true, value: 100 } );
        this.fetchButton = new OO.ui.ButtonWidget( { label: mw.message( 'mwe-recwiz-nearby-fetch' ).text(), icon: 'search' } );

		this.layout = new OO.ui.Widget( {
	        content: [
	            new OO.ui.FieldLayout(
	                new OO.ui.Widget( {
	                    content: [
	                        new OO.ui.HorizontalLayout( {
			                    items: [ this.latitude, this.longitude, this.currentPositionButton ],
		                    } )
		                ]
		            } ), {
	                    align: 'left',
	                    label: mw.message( 'mwe-recwiz-nearby-coordinates' ).text()
                    }
		        ),
	            new OO.ui.FieldLayout(
	                this.limit, {
	                    align: 'left',
	                    label: mw.message( 'mwe-recwiz-nearby-limit' ).text()
                    }
		        ),
		        this.fetchButton
	        ],
	        classes: [ 'mwe-recwiz-nearby', 'mwe-recwiz-increment' ]
	    } );



		this.$element = this.layout.$element;


        this.currentPositionButton.on( 'click', this.getCurrentPosition.bind( this ) );
        this.fetchButton.on( 'click', this.getWords.bind( this ) );
	};

	OO.inheritClass( rw.generator.Nearby, rw.generator.Generator );
	rw.generator.Nearby.static.name = 'nearby';

	rw.generator.Nearby.prototype.getList = function() {
	    return this.list;
	};

	rw.generator.Nearby.prototype.preload = function( metadatas ) {
	    this.latitude.setValue( metadatas.generator.latitude );
	    this.longitude.setValue( metadatas.generator.longitude );
	    this.limit.setValue( metadatas.generator.limit );
	};

	rw.generator.Nearby.prototype.getCurrentPosition = function() {
        navigator.geolocation.getCurrentPosition(
            this.onPositionSuccess.bind( this ),
            this.onPositionError.bind( this ),
            {
                timeout: 10000,
                maximumAge: 0
            }
        );
	};

	rw.generator.Nearby.prototype.onPositionSuccess = function( pos ) {
        this.latitude.setValue( pos.coords.latitude );
        this.longitude.setValue( pos.coords.longitude );
        this.currentPositionButton.setFlags( { 'destructive': false } );
	};

	rw.generator.Nearby.prototype.onPositionError = function( error ) {
	    //TODO: add an error message somewhere
	    console.log( error );
        this.currentPositionButton.setFlags( 'destructive' );
	};

	rw.generator.Nearby.prototype.getWords = function( error ) {
	    var lat = this.latitude.getValue(),
	        lng = this.longitude.getValue(),
	        limit = this.limit.getValue();
	    // TODO: check quality of thoose inputs

	    // save the inputs for a potential futur preload
	    this.params.latitude = lat;
	    this.params.longitude = lng;
	    this.params.limit = limit;

	    this.wikidataApi = new mw.ForeignApi( 'https://www.wikidata.org/w/api.php', { anonymous: true } );
	    this.list = [];

	    this.wikidataApi.get( {
	        'action': 'query',
	        'format': 'json',
	        'formatversion': '2',
	        'list': 'geosearch',
	        'gscoord': lat + '|' + lng,
	        'gsradius': '10000',
	        'gslimit': limit,
	        'origin': '*'
        } ).then( this.getPagesInfo.bind( this ) );
	};

	rw.generator.Nearby.prototype.getPagesInfo = function( data ) {
        var generator = this,
            geosearch = data.query.geosearch,
            pages = [],
            langCode = 'fr'; //TODO: make that value dynamic

        for ( var i=0; i < geosearch.length; i++ ) {
            pages.push( geosearch[ i ].title );
        }

        while ( pages.length > 0 ) {
            this.wikidataApi.get( {
	            'action': 'wbgetentities',
	            'format': 'json',
	            'ids': pages.splice( -50, 50 ).join( '|' ),
	            'props': 'labels',
	            'languages': langCode,
	            'formatversion': '2',
	            'origin': '*'
            } ).then( function( data ) {
                for ( qid in data.entities ) {
                    var entity = data.entities[ qid ];
                    if ( entity.missing !== undefined ) {
                        continue;
                    }

                    if ( entity.labels[ langCode ] !== undefined ) {
                        generator.list.push( entity.labels[ langCode ].value );
                    }
                }
            } );
        }
    };

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

