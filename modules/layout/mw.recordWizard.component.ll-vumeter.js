'use strict';

( function () {

	Vue.component( 'll-vumeter', {
		template: '<ul>\
						<li :class="getClass(0)"></li>\
						<li :class="getClass(1)"></li>\
						<li :class="getClass(2)"></li>\
						<li :class="getClass(3)"></li>\
						<li :class="getClass(4)"></li>\
						<li :class="getClass(5)"></li>\
						<li :class="getClass(6)"></li>\
						<li :class="getClass(7)"></li>\
						<li :class="getClass(8)"></li>\
						<li :class="getClass(9)"></li>\
						<li :class="getClass(10)"></li>\
						<li :class="getClass(11)"></li>\
						<li :class="getClass(12)"></li>\
						<li :class="getClass(13)"></li>\
						<li :class="getClass(14)"></li>\
					</ul>',
		props: {
			value: {
				type: Number,
				default: 0
			},
			saturated: {
				type: Boolean,
				default: false
			}
		},
		methods: {
			getClass: function ( index ) {
				if ( this.value > index ) {
					return 'mwe-rws-vu-active';
				}
			}
		}
	} );

}() );
