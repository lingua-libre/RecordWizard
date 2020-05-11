'use strict';

( function ( mw, $, rw, OO ) {

	Vue.component( 'ooui-progressbar', {
		template: '<div></div>',
		props: {
			value: String,
			disabled: { type: Boolean, default: false }
		},
		mounted: function () {
			this.$progressbar = new OO.ui.ProgressBarWidget( {
				$element: $( this.$el ),
				progress: this.value,
				disabled: this.disabled
			} );
		},
		watch: {
			value: function () {
				this.$progressbar.setProgress( this.value );
			},
			disabled: function () {
				this.$progressbar.setDisabled( this.disabled );
			}
		},
		beforeDestroy: function () {}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
