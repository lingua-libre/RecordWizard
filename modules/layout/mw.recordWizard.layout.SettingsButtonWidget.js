'use strict';

( function ( mw, $, rw, OO ) {

	rw.layout.SettingsButtonWidget = function ( config ) {
		var widgetName;

		config = config || {};
		config.classes = config.classes || [];
		config.classes.push( 'mwe-recwiz-settingsButtonWidget' );

		rw.layout.SettingsButtonWidget.parent.call( this, config );

		this.label = config.label;
		this.groups = config.groups;
		this.settingsWidgets = {};

		// Widget initialisation
		this.generateUI();

		// Attach events handlers to each individual widgets
		for ( widgetName in this.settingsWidgets ) {
			this.settingsWidgets[ widgetName ].on( 'change', this.onChange.bind( this, widgetName ) );
			this.settingsWidgets[ widgetName ].on( 'choose', this.onChange.bind( this, widgetName ) );
		}

		// Populate widgets with the user's value if found in the local storage
		for ( widgetName in this.settingsWidgets ) {
			this.loadSavedValue( widgetName );
		}
	};

	OO.inheritClass( rw.layout.SettingsButtonWidget, OO.ui.Widget );

	rw.layout.SettingsButtonWidget.prototype.generateUI = function () {
		var i, j, k, container, group, widget, groupContainer, layout, options;

		container = $( '<div>' );
		for ( i = 0; i < this.groups.length; i++ ) {
			group = this.groups[ i ];
			// TODO: create groups
			groupContainer = $( '<div>' ).addClass( 'mwe-recwiz-settingsButtonWidget-group' );
			groupContainer.append( new OO.ui.LabelWidget( { label: group.label } ).$element );
			for ( j = 0; j < group.widgets.length; j++ ) {
				widget = group.widgets[ j ];
				switch ( widget.type ) {
					case 'bool':
						this.settingsWidgets[ widget.name ] = new OO.ui.CheckboxInputWidget( {
							selected: widget.value
						} );
						layout = new OO.ui.FieldLayout(
							this.settingsWidgets[ widget.name ], {
								align: 'right',
								label: widget.label,
								help: widget.help
							}
						);
						break;
					case 'number':
						this.settingsWidgets[ widget.name ] = new OO.ui.NumberInputWidget( {
							input: { value: widget.value },
							min: widget.min,
							max: widget.max
						} );
						layout = new OO.ui.FieldLayout(
							this.settingsWidgets[ widget.name ], {
								align: 'top',
								label: widget.label,
								help: widget.help
							}
						);
						break;
					case 'select':
						options = [];
						for ( k = 0; k < widget.options.length; k++ ) {
							options.push( new OO.ui.ButtonOptionWidget( {
								data: widget.options[ k ],
								label: String( widget.options[ k ] )
							} ) );
						}
						this.settingsWidgets[ widget.name ] = new OO.ui.ButtonSelectWidget( { items: options } );
						this.settingsWidgets[ widget.name ].selectItemByData( widget.value );
						layout = new OO.ui.FieldLayout(
							this.settingsWidgets[ widget.name ], {
								align: 'top',
								label: widget.label,
								help: widget.help
							}
						);
						break;
					default:
						layout = null;
				}
				groupContainer.append( layout.$element );
			}
			container.append( groupContainer );
		}
		this.button = new OO.ui.PopupButtonWidget( {
			icon: 'settings',
			indicator: 'down',
			label: this.label,
			$overlay: this.$overlay,
			popup: {
				width: 300,
				padded: false,
				anchor: false,
				align: 'backwards',
				$autoCloseIgnore: this.$overlay,
				classes: [ 'mwe-recwiz-settingsButtonWidget-popup' ],
				$content: container
			}
		} );
		this.$element.append( this.button.$element );
	};

	rw.layout.SettingsButtonWidget.prototype.loadSavedValue = function ( key ) {
		var value;

		if ( this.settingsWidgets[ key ] === undefined ) {
			return undefined;
		}

		value = mw.storage.get( 'mwe-recwiz-settings-' + key );
		if ( value === false || value === null ) {
			return false;
		}
		value = JSON.parse( value )

		if ( this.settingsWidgets[ key ] instanceof OO.ui.CheckboxInputWidget ) {
			return this.settingsWidgets[ key ].setSelected( value.v );
		} else if ( this.settingsWidgets[ key ] instanceof OO.ui.NumberInputWidget ) {
			return this.settingsWidgets[ key ].setValue( value.v );
		} else if ( this.settingsWidgets[ key ] instanceof OO.ui.ButtonSelectWidget ) {
			return this.settingsWidgets[ key ].selectItemByData( value.v );
		}

		return null;
	};

	rw.layout.SettingsButtonWidget.prototype.getValue = function ( key ) {
		if ( this.settingsWidgets[ key ] === undefined ) {
			return undefined;
		}

		if ( this.settingsWidgets[ key ] instanceof OO.ui.CheckboxInputWidget ) {
			return this.settingsWidgets[ key ].isSelected();
		} else if ( this.settingsWidgets[ key ] instanceof OO.ui.NumberInputWidget ) {
			return this.settingsWidgets[ key ].getValue();
		} else if ( this.settingsWidgets[ key ] instanceof OO.ui.ButtonSelectWidget ) {
			return this.settingsWidgets[ key ].findSelectedItem().getData();
		}

		return null;
	};

	rw.layout.SettingsButtonWidget.prototype.onChange = function ( key, value ) {
		console.info( '[onChange] ', key, value );
		if ( this.settingsWidgets[ key ] === undefined ) {
			return undefined;
		}

		if ( this.settingsWidgets[ key ] instanceof OO.ui.ButtonSelectWidget ) {
			value = value.getData();
		}

		mw.storage.set( 'mwe-recwiz-settings-' + key, JSON.stringify( { v: value } ) );

		return null;
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
