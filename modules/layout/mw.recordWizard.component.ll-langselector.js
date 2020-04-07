'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component('ll-langselector', {
		template: '<div></div>',
		props: {
			value: Object,
			placeholder: String,
			disabled: { type: Boolean, default: false },
			inputId: String,
			options: { type: Array, default: function() { return []; } },
		},
		mounted: function() {
			var i,
				items = [];

			for ( i = 0; i < this.options.length; i++ ) {
				items.push( new OO.ui.MenuOptionWidget( this.options[ i ] ) );
			}

			this.$input = new rw.layout.LanguagesSelectorWidget( {
				$element: $( this.$el ),
				inputId: this.inputId,
				disabled: this.disabled,
			    value: this.value,
				menu: { items: items },
				indicator: 'required'
			} );
      		this.$input.on( 'update', this.$emit.bind( this, 'input' ) );
		},
		watch: {
			value: function() {
				this.$input.setValue( this.value );
			},
			disabled: function() {
				this.$input.setDisabled( this.disabled );
			},
		},
		beforeDestroy: function() {
			this.$input.off( 'update' );
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
