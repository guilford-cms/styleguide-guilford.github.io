/**
 * cbpFWTabs.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {

	'use strict';

	function extend( a, b ) {
		for( var key in b ) {
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function CBPFWTabs( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
  		extend( this.options, options );
  		this._init();
	}

	CBPFWTabs.prototype.options = {
		start : 0,
		callback: null
	};

	CBPFWTabs.prototype._init = function() {
		// content items
		this.animation = this.el.getElementsByClassName( 'animation' )[0];
		// tabs elems
		this.tabs = [].slice.call( this.el.querySelectorAll( 'nav ul > li' ) );
		// content items
		this.items = [].slice.call( this.el.querySelectorAll( '.content-wrap > section' ) );
		// current index
		this.current = -1;
		// show current content item
		this._show();
		// init events
		this._initEvents();
	};

	CBPFWTabs.prototype._initEvents = function() {
		var self = this;
		if(this.options.callback && typeof this.options.callback == 'function'){
			this.options.callback();
		}
		this.tabs.forEach( function( tab, idx ) {
			tab.addEventListener( 'click', function( ev ) {
				ev.preventDefault();
				self._show( idx );
				self._animate();
			} );
		} );
	};

	CBPFWTabs.prototype._fireResizeEvent = function(  ) {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent('resize', true, false);
		window.dispatchEvent(evt);
	}

	CBPFWTabs.prototype._show = function( idx ) {
		if( this.current >= 0 ) {
			this.tabs[ this.current ].classList.remove('tab-current');
			this.items[ this.current ].classList.remove('content-current');
		}
		// change current
		this.current = idx != undefined ? idx : this.options.start >= 0 && this.options.start < this.items.length ? this.options.start : 0;
		this.tabs[ this.current ].classList.add('tab-current');
		this.items[ this.current ].classList.add('content-current');
	};
	CBPFWTabs.prototype._animate = function( ) {
		if(!this.tabs[ this.current ].parentElement.classList.contains('animation-initialized')){
        	this.animation.style.transform = "translate("+this.tabs[ this.current ].offsetLeft+"px,0)";
			this.tabs[ this.current ].parentElement.classList.add('animation-initialized');
		}
		if(this.items[ this.current ].getElementsByTagName('ncc-stack').length){
        	// window.dispatchEvent(new Event('resize'));
        	this._fireResizeEvent();
    	}else{
        	this.animation.style.cssText = "transform: translate("+this.tabs[ this.current ].offsetLeft+"px,0);-webkit-transform: translate("+this.tabs[ this.current ].offsetLeft+"px,0);-moz-transform: translate("+this.tabs[ this.current ].offsetLeft+"px,0); width: "+this.tabs[ this.current ].clientWidth+"px;";
    	}
    }

	// add to global namespace
	window.CBPFWTabs = CBPFWTabs;

})( window );
