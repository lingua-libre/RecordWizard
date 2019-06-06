'use strict';

( function ( mw, $, rw, OO ) {

	/**
	 * Represents the UI for the wizard's AudioStudio step.
	 *
	 * @class rw.ui.AudioStudio
	 * @extends rw.ui.Step
	 * @constructor
	 */
	rw.ui.AudioStudio = function () {
		rw.ui.Step.call(
			this,
			'audiostudio'
		);

		this.addPreviousButton();
		this.addNextButton();
	};

	OO.inheritClass( rw.ui.AudioStudio, rw.ui.Studio );

	/**
	 * @inheritDoc
	 */
	rw.ui.AudioStudio.prototype.load = function () {
		this.amplitudeGraph = new rw.ui.AmplitudeGraph();
	};

	/**
	 * @inheritDoc
	 */
	rw.ui.AudioStudio.prototype.onStart = function ( word ) {
		rw.ui.Studio.prototype.onStart.call( this, word );
		this.amplitudeGraph.start();
	};

	/**
	 * Event handler called each ~100ms when a record is performed
	 *
	 * @private
	 * @param  {Float32Array} samples Sound samples of the audio recorded since
	 *                                last call
	 */
	rw.ui.AudioStudio.prototype.onRecord = function ( samples ) {
		var i, amplitude,
			amplitudeMax = 0;

		for ( i = 0; i < samples.length; i++ ) {
			amplitude = Math.abs( samples[ i ] );
			if ( amplitude > amplitudeMax ) {
				amplitudeMax = amplitude;
			}
		}

		this.amplitudeGraph.push( amplitudeMax );
	};

	/**
	 * Event handler called when an audio record has just ended.
	 *
	 * @private
	 */
	rw.ui.AudioStudio.prototype.onStop = function () {
		rw.ui.Studio.prototype.onStop.call( this );

		this.amplitudeGraph.stop();
	};

	/**
	 * Event handler called when an audio record got saturated.
	 *
	 * @private
	 * @param  {string} word textual transcription, must match an existing
	 *                       listed record object
	 */
	rw.ui.AudioStudio.prototype.onSaturate = function ( word ) {
		this.recordItems[ word ].addClass( 'mwe-recwiz-word-error' );
	};

	/**
	 * Change the selected item in the word list
	 *
	 * @param  {string} word textual transcription, must match an existing
	 *                       listed record object
	 */
	rw.ui.AudioStudio.prototype.setSelectedItem = function ( word ) {
		rw.ui.Studio.prototype.setSelectedItem.call( this, word );

		this.amplitudeGraph.setContainer( this.recordItems[ word ] );
	};

	/**
	 * Small animated vertical bar graph showing the amplitude of a sound stream.
	 *
	 * @class rw.ui.AmplitudeGraph
	 * @constructor
	 */
	rw.ui.AmplitudeGraph = function () {
		this.$container = null;
		this.amplitudes = [];
		this.nbMaxAmplitudeBars = 0;
		this.isRecording = false;
		this.$canvas = $( '<canvas>' ).addClass( 'mwe-recwiz-wordcanvas' )[ 0 ];
		this.ctx = this.$canvas.getContext( '2d' );
		this.ctx.save();
	};

	/**
	 * Start to animate the amplitude graph.
	 */
	rw.ui.AmplitudeGraph.prototype.start = function () {
		this.isRecording = true;

		requestAnimationFrame( this.draw.bind( this ) );
	};

	/**
	 * Stop the animation loop and clear the graph.
	 */
	rw.ui.AmplitudeGraph.prototype.stop = function () {
		this.isRecording = false;

		this.amplitudes = [];
		this.ctx.clearRect( 0, 0, this.$canvas.width, this.$canvas.height );
	};

	/**
	 * Main animation loop of the AmplitudeGraph
	 *
	 * @private
	 */
	rw.ui.AmplitudeGraph.prototype.draw = function () {
		var i, height;

		if ( !this.isRecording ) {
			return;
		}

		// Flip the graph if we're using a rtl language
		if ( this.$container.css( 'direction' ) === 'rtl' ) {
			this.ctx.resetTransform();
			this.ctx.transform( -1, 0, 0, 1, this.$canvas.width, 0 );
		}

		// Clear the current content of the canvas
		this.ctx.clearRect( 0, 0, this.$canvas.width, this.$canvas.height );

		// Draw the amplitude chart
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
		for ( i = 0; i < this.amplitudes.length; i++ ) {
			height = Math.ceil( this.amplitudes[ i ] * this.$canvas.height );
			this.ctx.fillRect( i * 5, this.$canvas.height - height, 5, height );
		}

		// Ask the browser to callback this function at its next refresh
		requestAnimationFrame( this.draw.bind( this ) );
	};

	/**
	 * Set or change the container in which the graph is displayed.
	 *
	 * @param  {JQuery} container node of the container to use
	 */
	rw.ui.AmplitudeGraph.prototype.setContainer = function ( container ) {
		this.amplitudes = [];
		this.ctx.clearRect( 0, 0, this.$canvas.width, this.$canvas.height );

		this.$container = container;

		this.$canvas.width = this.$container.outerWidth();
		this.$canvas.height = this.$container.outerHeight();
		this.$container.prepend( this.$canvas );
		this.nbMaxAmplitudeBars = Math.floor( this.$canvas.width / 5 );

		this.amplitudes = [];
		this.ctx.clearRect( 0, 0, this.$canvas.width, this.$canvas.height );
	};

	/**
	 * Add a new value to display on the graph.
	 *
	 * @param  {number} amplitude Max amplitude mesured in the last timeframe
	 */
	rw.ui.AmplitudeGraph.prototype.push = function ( amplitude ) {
		this.amplitudes.push( amplitude );

		if ( this.amplitudes.length > this.nbMaxAmplitudeBars ) {
			this.amplitudes.shift();
		}
	};

}( mediaWiki, jQuery, mediaWiki.recordWizard, OO ) );
