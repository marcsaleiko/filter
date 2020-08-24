window.Filter = (function(){

    var _init = false;
    var app = {};
    var settings = {
      triggerSelector: '.js-filter',
      itemSelector: '.js-filter-item',
      itemActiveClass: 'filter-item--active',
    };
    var trigger = false;
    var items = false;
    var active = false;
  
    app.init = function( options ) {
        if( _init ) { return; }
        _init = true;
  
        settings = Object.assign(settings, options);
  
        trigger = $$( settings.triggerSelector );
        if( trigger.length > 0 ) {
  
          active = true;
        }
    };
  
    app.isActive = function(){
      return active;
    }
  
    var $$ = function( selector ) {
      return document.querySelectorAll( selector );
    };
  
    var addClass = function( elements, className ) {
      if( elements instanceof Node ) {
        elements.classList.add( className );
      }
      else {
        for( var i = 0, len = elements.length; i < len; i++) {
          elements[i].classList.add( className );
        }
      }
    };
  
    var removeClass = function( elements, className ) {
      if( elements instanceof Node ) {
        elements.classList.remove( className );
      }
      else {
        for( var i = 0, len = elements.length; i < len; i++) {
          elements[i].classList.remove( className );
        }
      }
    };
  
    return app;
  
  })();