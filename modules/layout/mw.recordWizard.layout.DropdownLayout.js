( function ( mw, $, rw, OO ) {

	rw.layout.DropdownLayout = function( config ) {
	    var classes = config.classes || []
	    classes.push( 'mwe-recwiz-dropdownLayout' );
	    OO.ui.Widget.call( this, { classes: config.classes } );

	    this.label = config.label;
	    this.expanded = true;

		this.$content = config.$content;

		this.stateLabel = new OO.ui.LabelWidget( { label: config.stateValue || '' } );
		this.header = new OO.ui.HorizontalLayout( {
			items: [
			    this.stateLabel
			],
	    } );

	    this.$element
	        .append( this.header.$element )
	        .append( this.$content );
	};

	OO.inheritClass( rw.layout.DropdownLayout, OO.ui.Widget );


	rw.layout.DropdownLayout.prototype.collapse = function() {
        if ( this.expanded ) {
            this.$content.slideUp();
            this.expanded = false;
            this.emit( 'collapse', this );
        }
	};

	rw.layout.DropdownLayout.prototype.expand = function() {
        if ( ! this.expanded ) {
            this.$content.slideDown();
            this.expanded = true;
            this.emit( 'expand', this );
        }
	};

	rw.layout.DropdownLayout.prototype.setStateValue = function( value ) {
        this.stateLabel.setLabel( value );
	};




	rw.layout.ButtonDropdownLayout = function( config ) {
	    config.classes = config.classes || []
	    config.classes.push( 'mwe-recwiz-buttonDropdownLayout' );
		rw.layout.DropdownLayout.call( this, config );

        this.button = new OO.ui.ButtonWidget( {
	        framed: false,
	        flags: [ 'progressive' ],
	        icon: 'expand',
	        label: this.label
        } );
		this.header.addItems( [ this.button ], 0 );
        this.button.on( 'click', this.onClick.bind( this ) );

        this.on( 'expand', this.onExpand.bind( this ) );
        this.on( 'collapse', this.onCollapse.bind( this ) );
	};

	OO.inheritClass( rw.layout.ButtonDropdownLayout, rw.layout.DropdownLayout );

	rw.layout.ButtonDropdownLayout.prototype.onClick = function() {
        if ( this.expanded ) {
            this.collapse();
        }
        else {
            this.expand();
        }
    };

	rw.layout.ButtonDropdownLayout.prototype.onExpand = function() {
        this.button.setIcon( 'expand' );
    };

	rw.layout.ButtonDropdownLayout.prototype.onCollapse = function() {
        this.button.setIcon( 'next' );
    };




	rw.layout.RadioDropdownLayout = function( config ) {
	    config.classes = config.classes || []
	    config.classes.push( 'mwe-recwiz-radioDropdownLayout' );
		rw.layout.DropdownLayout.call( this, config );

        this.data = config.data;

        this.radio = new OO.ui.RadioInputWidget( {
            name: config.name,
            value: config.data
        } );

		this.header.addItems( [
		    new OO.ui.FieldLayout( this.radio, { label: config.label, align: 'inline' } )
		], 0 );

        this.radio.$element.on( 'change', this.expand.bind( this ) );

	    this.$element.prepend( this.header.$element );

        if ( config.collapsed ) {
	        this.collapse();
	    }

        this.on( 'collapse', this.onCollapse.bind( this ) );
        this.on( 'expand', this.onExpand.bind( this ) );
	};

	OO.inheritClass( rw.layout.RadioDropdownLayout, rw.layout.DropdownLayout );

	rw.layout.RadioDropdownLayout.prototype.onCollapse = function() {
        this.radio.setSelected( false );
	};

	rw.layout.RadioDropdownLayout.prototype.onExpand = function() {
        this.radio.setSelected( true );
	};


}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

