'use strict';

( function ( mw, $, rw, OO ) {

	var NearbyGenerator = function ( config ) {
		rw.store.generator.generic.call( this, config );
	};

	OO.inheritClass( NearbyGenerator, rw.store.generator.generic );
	NearbyGenerator.static.name = 'nearby';
	NearbyGenerator.static.title = mw.msg( 'mwe-recwiz-generator-nearby' );

	NearbyGenerator.prototype.initialize = function () {

		this.latitude = new OO.ui.TextInputWidget( {
			placeholder: mw.msg( 'mwe-recwiz-nearby-latitude' )
		} );
		this.longitude = new OO.ui.TextInputWidget( {
			placeholder: mw.msg( 'mwe-recwiz-nearby-longitude' )
		} );
		this.currentPositionButton = new OO.ui.ButtonWidget( {
			title: mw.msg( 'mwe-recwiz-nearby-getcoordinates' ),
			icon: 'mapPin'
		} );
		this.limit = new OO.ui.NumberInputWidget( {
			min: 1,
			max: 500,
			step: 10,
			pageStep: 100,
			isInteger: true
		} );
		this.wikidata = new OO.ui.RadioOptionWidget( {
			label: 'Wikidata'
		} );
		this.source = new OO.ui.RadioSelectWidget( {
			items: [ this.wikidata ]
		} );
		this.deduplicate = new OO.ui.ToggleSwitchWidget();

		this.layout = new OO.ui.Widget( {
			classes: [ 'mwe-recwiz-nearby' ],
			content: [
				new OO.ui.FieldLayout(
					new OO.ui.Widget( {
						content: [
							new OO.ui.HorizontalLayout( {
								items: [ this.latitude, this.longitude, this.currentPositionButton ],
								classes: [ 'mwe-recwiz-nearby-coordinates' ]
							} )
						]
					} ), {
						align: 'top',
						label: mw.msg( 'mwe-recwiz-nearby-coordinates' ),
						help: mw.msg( 'mwe-recwiz-nearby-coordinates-help' )
					}
				),
				new OO.ui.FieldLayout(
					this.limit, {
						align: 'top',
						label: mw.msg( 'mwe-recwiz-nearby-limit' ),
						help: mw.msg( 'mwe-recwiz-nearby-limit-help' )
					}
				),
				new OO.ui.FieldLayout(
					this.source, {
						align: 'left',
						label: mw.msg( 'mwe-recwiz-nearby-source' )
					}
				),
				new OO.ui.FieldLayout(
					this.deduplicate, {
						align: 'left',
						label: mw.msg( 'mwe-recwiz-nearby-deduplicate' )
					}
				)
			]
		} );

		this.content.$element.append( this.layout.$element );

		// Populate the fields with stored or default value
		this.latitude.setValue( this.params.latitude );
		this.longitude.setValue( this.params.longitude );
		this.limit.setValue( this.params.limit || 100 );
		this.source.selectItem( this.wikidata );
		this.deduplicate.setValue( this.params.deduplicate || true );

		this.currentPositionButton.on( 'click', this.getCurrentPosition.bind( this ) );
		this.latitude.on( 'change', this.unlockUI.bind( this ) );
		this.longitude.on( 'change', this.unlockUI.bind( this ) );

		rw.store.generator.generic.prototype.initialize.call( this );
	};

	NearbyGenerator.prototype.getCurrentPosition = function () {
		this.lockUI();
		navigator.geolocation.getCurrentPosition(
			this.onPositionSuccess.bind( this ),
			this.onPositionError.bind( this ), {
				timeout: 10000, // 10 seconds
				maximumAge: 3600000 // 1 hour
			}
		);
	};

	NearbyGenerator.prototype.onPositionSuccess = function ( pos ) {
		this.unlockUI();
		this.latitude.setValue( pos.coords.latitude );
		this.longitude.setValue( pos.coords.longitude );
		this.currentPositionButton.setFlags( {
			destructive: false
		} );
	};

	NearbyGenerator.prototype.onPositionError = function ( error ) {
		var errorMessage = mw.msg( 'mwe-recwiz-error-cantgetposition', error.message );

		this.unlockUI();
		this.showErrors( new OO.ui.Error( errorMessage, {
			recoverable: false
		} ) );
	};

	NearbyGenerator.prototype.lockUI = function () {
		this.currentPositionButton.setDisabled( true );
		this.latitude.setDisabled( true );
		this.longitude.setDisabled( true );
		this.latitude.pushPending();
		this.longitude.pushPending();
	};

	NearbyGenerator.prototype.unlockUI = function () {
		this.currentPositionButton.setDisabled( false );
		this.latitude.setDisabled( false );
		this.longitude.setDisabled( false );
		this.latitude.popPending();
		this.longitude.popPending();

		this.getActions().get( {
			actions: 'save'
		} )[ 0 ].setDisabled( false );
	};

	NearbyGenerator.prototype.fetch = function () {
		var lat = this.latitude.getValue(),
			lng = this.longitude.getValue(),
			limit = parseInt( this.limit.getValue() );

		// save the inputs for a potential futur preload
		this.params.latitude = lat;
		this.params.longitude = lng;
		this.params.limit = limit;
		this.params.deduplicate = this.deduplicate.getValue();

		this.deferred = $.Deferred();

		if ( this.language.code === null ) {
			this.deferred.reject( new OO.ui.Error( mw.msg( 'mwe-recwiz-error-unsupportedlanguage' ) ) );
		}

		this.wikidataApi = new mw.ForeignApi( 'https://www.wikidata.org/w/api.php', {
			anonymous: true,
			parameters: {
				origin: '*'
			},
			ajax: {
				timeout: 10000
			}
		} );
		this.list = [];

		this.wikidataApi.get( {
			action: 'query',
			format: 'json',
			formatversion: '2',
			list: 'geosearch',
			gscoord: lat + '|' + lng,
			gsradius: '10000',
			gslimit: 'max'
		} ).then( this.getTitlesFromIds.bind( this ) )
			.fail( function ( error ) {
				this.deferred.reject( new OO.ui.Error( error ) );
			}.bind( this ) );

		// We're not done yet, make the dialog closing process to wait the promise
		return this.deferred.promise();
	};

	NearbyGenerator.prototype.getTitlesFromIds = function ( data ) {
		var i, errorMessage,
			geosearch = data.query.geosearch,
			pages = [];
		this.semaphore = 0;

		if ( geosearch.length === 0 ) {
			errorMessage = mw.msg( 'mwe-recwiz-warning-noresults' );
			this.deferred.reject( new OO.ui.Error( errorMessage, {
				warning: true,
				recoverable: false
			} ) );
			return;
		}

		for ( i = 0; i < geosearch.length; i++ ) {
			pages.push( geosearch[ i ].title );
		}

		while ( pages.length > 0 ) {
			this.semaphore++;
			this.wikidataApi.get( {
				action: 'wbgetentities',
				format: 'json',
				ids: pages.splice( -50, 50 ).join( '|' ),
				props: 'labels',
				languages: this.language.code,
				formatversion: '2'
			} ).then( this.parseLabels.bind( this ) ).fail( function ( error ) {
				this.deferred.reject( new OO.ui.Error( error ) );
			}.bind( this ) );
		}
	};

	NearbyGenerator.prototype.parseLabels = function ( data ) {
		var qid, entity, element,
			limit = this.params.limit,
			deduplicate = this.params.deduplicate;
		this.semaphore--;

		for ( qid in data.entities ) {
			if ( this.list.length >= limit ) {
				break;
			}

			entity = data.entities[ qid ];
			if ( entity.missing !== undefined ) {
				continue;
			}

			if ( entity.labels[ this.language.code ] !== undefined ) {
				element = {};
				element.text = entity.labels[ this.language.code ].value;
				element[ rw.store.config.data.properties.wikidataId ] = qid;

				if ( deduplicate === false || this.isAlreadyRecorded( element.text ) === false ) {
					this.list.push( element );
				}
			}
		}
		if ( this.semaphore === 0 ) {
			this.deferred.resolve();
		}
	};

	rw.store.generator.register( 'nearby', NearbyGenerator.static.title, 'll-nearby', new NearbyGenerator() );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
