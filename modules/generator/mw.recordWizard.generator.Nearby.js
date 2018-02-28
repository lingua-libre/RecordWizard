( function ( mw, $, rw, OO ) {

	rw.generator.Nearby = function( metadatas ) {
		rw.generator.Generator.call( this, metadatas );

        this.latitude = new OO.ui.TextInputWidget( { placeholder: 'Latitude' } );
        this.longitude = new OO.ui.TextInputWidget( { placeholder: 'Longitude' } );
        this.currentPositionButton = new OO.ui.ButtonWidget( {
            label: 'Get my coordinates',
            icon: 'trash'
        } );

		this.layout = new OO.ui.HorizontalLayout( {
			items: [ this.latitude, this.longitude, this.currentPositionButton ],
			classes: [ 'mwe-recwiz-nearby', 'mwe-recwiz-increment' ]
		} )

		this.$element = this.layout.$element;


        this.currentPositionButton.on( 'click', this.getCurrentPosition.bind( this ) );
	};

	OO.inheritClass( rw.generator.Nearby, rw.generator.Generator );
	rw.generator.Nearby.static.name = 'nearby';

	rw.generator.Nearby.prototype.getList = function() {
	    return this.list;
	};

	rw.generator.Generator.prototype.getCurrentPosition = function() {
        navigator.geolocation.getCurrentPosition(
            this.onPositionSuccess.bind( this ),
            this.onPositionError.bind( this ),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
	};

	rw.generator.Generator.prototype.onPositionSuccess = function( pos ) {
        this.latitude.setValue( pos.coords.latitude );
        this.longitude.setValue( pos.coords.longitude );
        this.currentPositionButton.setFlags( { 'destructive': false } );
	};

	rw.generator.Generator.prototype.onPositionError = function( pos ) {
	    //TODO: add an error message somewhere
        this.currentPositionButton.setFlags( 'destructive' );
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

