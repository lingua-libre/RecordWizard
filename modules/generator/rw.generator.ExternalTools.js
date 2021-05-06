'use strict';

		var PETSCAN_URL = 'petscan.wmflabs.org/',
			WDQS_URL = 'query.wikidata.org/',
			rw = mw.recordWizard;

		var ExternalTools = function ( config ) {
			rw.store.generator.generic.call( this, config );
		};

		OO.inheritClass( ExternalTools, rw.store.generator.generic );

		// This line defines an internal name for the generator
		ExternalTools.static.name = 'externaltools';

		// And this one defines the name for the generator which will be displayed in the UI
		ExternalTools.static.title = 'ExternalTools';

		ExternalTools.prototype.initialize = function () {
			// The two text fields
			this.urlField = new OO.ui.TextInputWidget();
			this.limitField = new OO.ui.NumberInputWidget( { min: 1, max: 2000, value: 500, step: 10, pageStep: 100, isInteger: true } );

			// The custom layout
			this.layout = new OO.ui.Widget( {
				classes: [ 'mwe-recwiz-externaltools' ],
				content: [
					new OO.ui.FieldLayout( this.urlField, {
						align: 'top',
						label: 'ExternalTools URL (PetScan, Wikidata query service):'
					} ),
					new OO.ui.FieldLayout(
						this.limitField, {
							align: 'top',
							label: mw.message( 'mwe-recwiz-nearby-limit' ).text()
						}
					)
				]
			} );

			// To be displayed, all the fields/widgets/... should be appended to "this.content.$element"
			this.content.$element.append( this.layout.$element );

			// Do not remove this line, it will initialize the popup itself
			rw.store.generator.generic.prototype.initialize.call( this );
		};

		ExternalTools.prototype.fetch = function () {
			// Get the values of our text fields
			var generator = this,
				url = this.urlField.getValue();
				
			this.limit = parseInt( this.limitField.getValue() );

			/*
			 * TODO:
			 * - list of turnkey urls
			 */

			// Initialize a new promise
			this.deferred = $.Deferred();

			// Initialize our word list
			this.list = [];

			// Check if the given URL refers to an allowed external tool
			if ( url.lastIndexOf( 'http://' + PETSCAN_URL, 0 ) === 0 || url.lastIndexOf( 'https://' + PETSCAN_URL, 0 ) === 0 ) {
				// We will do an AJAX request to petscan's API
				$.get( url + '&output_compatability=quick-intersection&format=json&doit=' ).then( this.PetScan.bind( this ), function ( error ) { generator.deferred.reject( new OO.ui.Error( error ) ); } );
			}
			else if ( url.lastIndexOf( 'https://' + WDQS_URL, 0 ) === 0 ) {
				// We will do an AJAX request to Wikidata Query Service
				url = url.replace('https://query.wikidata.org/#', 'https://query.wikidata.org/sparql?query=') + '&format=json'
                $.get( url ).then( this.WikidataQueryService.bind( this ), function ( error ) { generator.deferred.reject( new OO.ui.Error( error ) ); } );
			}
			else {
				this.deferred.reject( new OO.ui.Error( 'This is not an allowed URL... It should link to PetScan or Wikidata Query.' ) );
				return this.deferred.promise();
			}

			this.lockUI();

			// At this point we're not done yet, make the dialog closing process
			// to wait the promise to be resolved or rejected
			this.deferred.then( this.unlockUI.bind( this ), this.unlockUI.bind( this ) );
			return this.deferred.promise();
		};
		
		ExternalTools.prototype.PetScan = function ( data ) {
			var i, page, ns, element, property,
				prefix = '',
				project = mw.util.getParamValue( 'project', data.query ),
				language = mw.util.getParamValue( 'language', data.query );

			// Check whether the response looks fine or not
			if ( data.status !== 'OK' ) {
				this.deferred.reject( new OO.ui.Error( 'Petscan outputs something weird with this URL, check it and come back afterwards.' ) );
			}

			// For projects that have a custom property, select it
			switch ( project ) {
				case 'wikipedia':
					property = 'P19';
					prefix = language + ':';
					break;
				case 'wiktionary':
					property = 'P20';
					prefix = language + ':';
					break;
			}

			// Parse the complete response (or at least until the limit is reached)
			for ( i = 0; i < data.pages.length && i < this.limit; i++ ) {
				page = data.pages[ i ];

				element = { text: page.page_title.replace( /_/g, ' ' ) };
				if ( property !== undefined ) {
					ns = ( page.page_namespace !== 0 ? data.namespaces[ page.page_namespace ] : '' );
					element[ property ] = prefix + ns + page.page_title;
				}

				this.list.push( element );
			}

			this.deferred.resolve();
		};
		
		ExternalTools.prototype.WikidataQueryService = function ( data ) {
			var i, item, id, label, property, element;

			// Check whether the response looks fine or not
			if ( data.results === undefined ) {
				this.deferred.reject( new OO.ui.Error( 'Wikidata Query Service outputs something weird with this URL, check it and come back afterwards.' ) );
				return;
			}
			if ( data.results.bindings.length === 0 ) {
				this.deferred.reject( new OO.ui.Error( 'No results in the request.' ) );
				return;
			}
			if ( data.results.bindings[ 0 ].id === undefined || data.results.bindings[ 0 ].label === undefined ) {
				this.deferred.reject( new OO.ui.Error( 'Result must contain both "id" and "label" field.' ) );
			}

			for( i=0; i < data.results.bindings.length; i++ ) {
				item = data.results.bindings[ i ];
				
				id = item.id.value.substring(31);
				label = item.label.value;
				switch( id[ 0 ] ) {
					case 'L':
						property = 'P21';
						break;
					default:
						property = 'P12';
						break;
				}
				element = { "text": label };
				element[ property ] = id;
                
				this.list.push( element );
			}

			this.deferred.resolve();
		};

		ExternalTools.prototype.lockUI = function () {
			this.urlField.setDisabled( true );
			this.limitField.setDisabled( true );
		};

		ExternalTools.prototype.unlockUI = function () {
			this.urlField.setDisabled( false );
			this.limitField.setDisabled( false );

			this.getActions().get( { actions: 'save' } )[ 0 ].setDisabled( false );
		};

		rw.store.generator.register( 'externaltools', ExternalTools.static.title, 'll-externaltools', new ExternalTools() );

