'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component('ooui-textinput', {
		template: '<div></div>',
		props: {
			value: String,
			placeholder: String,
			disabled: { type: Boolean, default: false },
			inputId: String,
		},
		mounted: function() {
			this.$input = new OO.ui.TextInputWidget( {
				$element: $( this.$el ),
				inputId: this.inputId,
				disabled: this.disabled,
			    value: this.value,
				placeholder: this.placeholder,
			} );
      		this.$input.on( 'change', this.$emit.bind( this, 'input' ) );
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
			this.$input.off( 'change' );
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
