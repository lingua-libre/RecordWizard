'use strict';

( function ( mw, $, rw ) {

	Vue.component( 'll-listitem', {
		template: '\
				<li :class="itemclass" @click="click">\
					<span v-html="word" :title="errors[ word ]"></span>\
					<i class="mwe-rws-play" @click.stop.prevent="play"></i>\
					<i class="mwe-rws-again" @click.stop.prevent="remove"></i>\
				</li>',
		props: {
			word: String
		},
		data: function () {
			return {
				status: rw.store.record.data.status,
				errors: rw.store.record.data.errors
			};
		},
		computed: {
			itemclass: function () {
				var text = 'mwe-rws-' + this.status[ this.word ];
				if ( this.errors[ this.word ] !== false ) {
					text += ' mwe-rw-error';
				}
				return text;
			}
		},
		methods: {
			play: function () {
				this.$emit( 'play' );
			},
			remove: function () {
				this.$emit( 'remove' );
			},
			click: function () {
				this.$emit( 'click' );
			}
		}
	} );

}( mediaWiki, jQuery, mediaWiki.recordWizard ) );
