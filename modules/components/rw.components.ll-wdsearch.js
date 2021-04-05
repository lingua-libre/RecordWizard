'use strict';

( function ( mw, $, rw ) {

	Vue.component( 'll-wdsearch', {
		template: '<div></div>',
		props: {
			value: String,
			placeholder: String,
			disabled: { type: Boolean, default: false },
			inputId: String
		},
		mounted: function () {
			this.$input = new rw.widgets.WikidataSearchWidget( {
				$element: $( this.$el ),
				inputId: this.inputId,
				disabled: this.disabled
			} );
			this.$input.setQid( this.value, true );
			this.$input.on( 'change', function () {
				this.$emit( 'input', this.$input.getData() );
			}.bind( this ) );
		},
		watch: {
			value: function () {
				this.$input.setQid( this.value, true );
				//if ( this.value === undefined ) {
				//	this.$input.setValue( '' );
				//}
			},
			disabled: function () {
				this.$input.setDisabled( this.disabled );
			}
		},
		beforeDestroy: function () {
			this.$input.off( 'change' );
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard ) );
