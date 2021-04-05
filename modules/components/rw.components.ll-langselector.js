'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component( 'll-langselector', {
		template: '<div></div>',
		props: {
			value: Object,
			placeholder: String,
			disabled: { type: Boolean, default: false },
			inputId: String,
			options: { type: Array, default: function () { return []; }
			}
		},
		mounted: function () {
			this.$input = new rw.widgets.LanguagesSelectorWidget( {
				$element: $( this.$el ),
				inputId: this.inputId,
				disabled: this.disabled,
				value: this.value,
				options: this.options,
				indicator: 'required'
			} );
			this.$input.on( 'update', this.$emit.bind( this, 'input' ) );
		},
		watch: {
			value: function () {
				this.$input.setValue( this.value );
			},
			disabled: function () {
				this.$input.setDisabled( this.disabled );
			}
		},
		beforeDestroy: function () {
			this.$input.off( 'update' );
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
