( function ( mw, $, rw, OO ) {

	/**
	 * Represents a generic word list Generator.
	 *
	 * @class rw.ui.License
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.generator.Generator = function() {
	    this.list = [];
	    this.$element = null;
	    this.name = this.constructor.static.name;
	    this.label = mw.message( 'mwe-recwiz-generator-' + this.name ).text();
	    this.params = { name: this.name };
	};

	rw.generator.Generator.prototype.getList = function() {
	    return this.list;
	};

	rw.generator.Generator.prototype.getParams = function() {
	    return this.params;
	};

	rw.generator.Generator.prototype.preload = function() {
	    return;
	};

	rw.generator.Generator.static = {
	    name: '__generic__',
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );

