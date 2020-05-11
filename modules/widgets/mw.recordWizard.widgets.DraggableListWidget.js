'use strict';

( function ( mw, $, rw, OO ) {

	rw.widgets.DraggableGroupWidget = function DemoDraggableGroupWidget( config ) {
		// Configuration initialization
		config = config || {};
		// Parent constructor
		rw.widgets.DraggableGroupWidget.parent.call( this, config );
		// Mixin constructors
		OO.ui.mixin.DraggableGroupElement.call( this, $.extend( {
			$group: this.$element
		}, config ) );
	};
	/* Setup */
	OO.inheritClass( rw.widgets.DraggableGroupWidget, OO.ui.Widget );
	OO.mixinClass( rw.widgets.DraggableGroupWidget, OO.ui.mixin.DraggableGroupElement );

	rw.widgets.DraggableItemWidget = function DemoDraggableHandledItemWidget( config ) {
		// Configuration initialization
		config = config || {};
		// Parent constructor
		rw.widgets.DraggableItemWidget.parent.call( this, config );
		// LabelElement Mixin constructors
		OO.ui.mixin.LabelElement.call( this, config );
		// Initialise elements
		this.$handleIcon = $( '<i class="mwe-rwd-handle">' );
		this.$action = $( '<i class="mwe-rwd-trash">' );
		this.$handle = $( '<span>' ).append( this.$handleIcon, this.$label );
		// DraggableElement Mixin constructors
		OO.ui.mixin.DraggableElement.call( this, $.extend( {
			$handle: this.$handle
		}, config ) );

		this.$element.append( this.$handle, this.$action );

		// Set events
		this.$action.one( 'click', this.emit.bind( this, 'remove' ) );
	};
	/* Setup */
	OO.inheritClass( rw.widgets.DraggableItemWidget, OO.ui.Widget );
	OO.mixinClass( rw.widgets.DraggableItemWidget, OO.ui.mixin.IconElement );
	OO.mixinClass( rw.widgets.DraggableItemWidget, OO.ui.mixin.LabelElement );
	OO.mixinClass( rw.widgets.DraggableItemWidget, OO.ui.mixin.DraggableElement );
	/* Static */
	rw.widgets.DraggableItemWidget.static.tagName = 'li';

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
