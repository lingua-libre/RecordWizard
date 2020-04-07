'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component('ooui-dropdown', {
		template: '<div></div>',
		props: {
			options: { type: Array, default: function() { return []; } },
			value: String,
			disabled: { type: Boolean, default: false },
			inputId: String,
		},
		data: function() {
			return {
				opt: JSON.parse( JSON.stringify( this.options ) )
			}
		},
		mounted: function() {

			this.$dropdown = new OO.ui.DropdownInputWidget( {
				$element: $( this.$el ),
				inputId: this.inputId,
				disabled: this.disabled,
				options: this.opt,
				value: this.value,
			} );
      		this.$dropdown.on( 'change', this.$emit.bind( this, 'input' ) );
		},
		watch: {
			options: {
				handler: function() {
					this.opt = JSON.parse( JSON.stringify( this.options ) );

					this.$dropdown.setOptions( this.opt );
				},
				deep: true
			},
			value: function() {
				this.$dropdown.setValue( this.value );
			},
			disabled: function() {
				this.$dropdown.setDisabled( this.disabled );
			},
		},
		beforeDestroy: function() {
			this.$dropdown.off( 'change' );
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
