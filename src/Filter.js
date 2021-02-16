/*!
 * Filter v0.5.0
 * Filter library that uses Isotope and jQuery Plugins to filter elements
 * MIT License
 */
window.Filter = (function(){

  var _init = false;
  var app = {};
  var settings = {
    triggerSelector: '.js-filter',
    isotopeContainer: '.js-filter-grid',
    isotopeItemSelector: '.js-filter-item',
    isotopeLayoutMode: 'fitRows',
    filterCounterElements: [
      {
        selector: '.js-filter-counter-container',
        template: '<span class="d-none d-md-block">|desktop|</span><span class="d-md-none">|mobile|</span>',
        text: 'XX Ergebnisse',
        textNoResult: 'Keine Ergebnisse',
        textNoResultDesktop: 'Leider keine Ergebnisse',
        callback: false
      },
      // {
      //     selector: '#sg-estate-filter-counter-text',
      //     template: '',
      //     text: 'XX passende Wohnungen',
      //     textDesktop: 'Zu den XX passenden Wohnungen',
      //     textSingular: 'XX passende Wohnung',
      //     textSingularDesktop: 'Zur passenden Wohnung',
      //     textNoResult: 'Leider keine Treffer',
      //     textNoResultDesktop: 'Leider keine Treffer für Suchanfrage',
      //     callback: function( $item, visibleElements ){}
      // }
    ],
    filterItemActiveClass: 'filter-item--active',
    noResultsContainerId: 'filter-no-results',
    noResultsHiddenClass: 'd-none',
    resultsTextContainerId: 'filter-results-text',
    resultsTextHiddenClass: 'd-none',
    /**
     * Determines whether the plugin should use the imagesLoaded jQuery Plugin
     * to ensure thet all images are loaded before isotope live filtering gets initialised.
     * Remember that we will only call imagesLoaded if this value is true and the function
     * imagesLoaded exists
     * @see  http://isotope.metafizzy.co/layout.html#imagesloaded
     * @type {Boolean}
     */
    useImagesLoaded: true,
    callOnChangeOnInit: true,
    callDefaultMapsMarkerUpdate: true,
    onChange: function( $activeElements, activeElementsUIds ) {},
    // will be fired if the current set of active elements differs from the previous
    // set of active elements after a filter update
    onActiveElementsUpdate: function() {},
    // will be used to filter for items that match the given searchWord
    // you may implement your own search algos here
    searchItemCallback: function( $element, searchWord ) { return true;},
  };
  var $trigger = false;
  var $isotopeGrid = false;
  var filterCounter = 0;
  var $filterCounterContainer = false;
  var $filterCounterLine = false;
  var $filterCounterText = false;
  var filterCounterElements = false;
  var $filterActiveElements = $();
  var filterActiveElementsIds = [];
  var $noResultsContainer = false;
  var $resultsTextContainer = false;
  var isotopeOptions = {};
  var $searchFields = false;
  var searchWord = '';

  var items = {
    multiselect: false,
    // false or '.selector',
    search: '.js-filter-search-field',
    // use a jquery instance of FilterBagde
    badge: false,
    // use a jquery instance of FilterCheckbox
    checkbox: false,
  };
  var active = false;

  app.init = function( options, filterItems ) {
      if( _init ) { return; }
      _init = true;

      settings = Object.assign(settings, options);
      items = $.extend(items, filterItems);

      $trigger = $( settings.triggerSelector );
      if( $trigger.length > 0 ) {

        // Check whether isotope is available and die if its not set
        if( typeof $.fn.isotope === 'undefined' )
        {
          console.error("Filter.init: $.isotope() is not defined. Please include Isotope module.");
          return;
        }

        active = true;

        // isotope options
        isotopeOptions = {
          itemSelector: settings.isotopeItemSelector,
          layoutMode: settings.isotopeLayoutMode,
          percentPosition: true,
          filter: filterFunction,
        };

        // init Isotope w/ initial filtering
        // or prepend imagesLoaded if option set to true and module is avalable
        if( settings.useImagesLoaded === true && typeof $.fn.imagesLoaded !== 'undefined' )
        {
          // wait for all images in isotope grid to be loaded.
          // may be obsolete if height && width of image are set (e.g. focuspoint).
          $( settings.isotopeContainer ).imagesLoaded( function()
          {
            initIsotopeAndVars();
          });
        }
        else
        {
          initIsotopeAndVars();
        }

      }
  };

  app.isActive = function(){
    return active;
  };

  app.update = function()
  {
    $isotopeGrid.isotope( isotopeOptions );
    // updates the counter var and sets the counter value to the html container
    updateVisibleElementsCounter();

    filterCounter = getVisibleElementsCount();
    // call default map marker update if setting is true and module is set
    if( settings.callDefaultMapsMarkerUpdate )
    {
      triggerStandardMapsMarkerUpdate();
    }
    // call onchange callback if function
    if( typeof settings.onChange === "function" )
    {
      settings.onChange( $filterActiveElements, filterActiveElementsIds );
    }
  };

  /**
   * Starts the isotope live filtering and inits container vars and the update function.
   * May be called from either imagesLoaded or app.init
   */
  var initIsotopeAndVars = function()
  {
    if( items.search !== false ) {
      $searchFields = $(items.search);
      searchWord = $searchFields.val();
    }

    if( $searchFields !== false && $searchFields.length > 0 )  {
      $searchFields.on('keyup', function(e){
        searchWord = $(this).val();
        app.update();
      });
    }

    $isotopeGrid = $( settings.isotopeContainer ).isotope( isotopeOptions );
    // init filtercounter
    $filterCounterContainer = $( '#'+settings.filterCounterContainerId );
    $filterCounterLine = $( '.'+settings.filterCounterLineContainerClass );
    $filterCounterText = $( '.'+settings.filterCounterTextClass );
    // add no results container if available
    $noResultsContainer = $( '#'+settings.noResultsContainerId );
    // populate container that holds text that should be visible if we have results
    $resultsTextContainer = $( '#'+settings.resultsTextContainerId );

    initFilterCounterElements();

    // updates the counter var and sets the counter value to the html container
    updateVisibleElementsCounter();

    if( settings.callOnChangeOnInit )
    {
      // call default map marker update if setting is true and module is set
      if( settings.callDefaultMapsMarkerUpdate )
      {
        triggerStandardMapsMarkerUpdate();
      }
      // call onchange callback if function
      if( typeof settings.onChange === "function" )
      {
        //tbd
        //settings.onChange( $filterActiveElements, filterActiveElementsUIds );
      }
    }
  };

  var initFilterCounterElements = function() {
    filterCounterElements = [];
    if( settings.filterCounterElements.length > 0 ) {
      $.each( settings.filterCounterElements, function() {
        var $element = $( this.selector );
        if( $element.length > 0 ) {
          $element.data( this );
          filterCounterElements.push( $element );
        }
      });
    }
  };

  /**
   * Update maps marker if SGEstateMaps module is active and settings allow that
   */
  var triggerStandardMapsMarkerUpdate = function()
  {
    if( typeof window.Maps !== "undefined" && window.Maps.isActive() )
    {
      window.Maps.updateMarkerVisibility( filterActiveElementsIds );
    }
  };

  var filterFunction = function()
  {
    var r = true
    // the first "false" return value stops the evaluation
    var $this = $(this)
    if (items.badge)
    {
      var badgesCount = items.badge.length
      var badgesFilterString = ''
      for (var badgesIndex = 0; badgesIndex < badgesCount; badgesIndex++)
      {
        var badge = items.badge[badgesIndex]
        if (typeof badge.filterValue.lastValue !== 'undefined' && badge.filterValue.lastValue !== '')
        {
          if (badgesFilterString.length > 0)
          {
            badgesFilterString += ', '
          }
          badgesFilterString += badge.filterValue.lastValue
        }
      }
      if (badgesFilterString !== '' && $this.filter(badgesFilterString).length === 0)
      {
        r = false
      }
    }
    if( r && items.checkbox ) {
      var checkboxesCount = items.checkbox.length
      var checkboxesFilterString = ''

      var checkboxOperator = 'or'
      if( checkboxesCount > 0 ) {
        checkboxOperator = items.checkbox[0].filterValue.operator
      }

      for( var checkboxesIndex = 0; checkboxesIndex < checkboxesCount; checkboxesIndex++ ) {
        var checkbox = items.checkbox[checkboxesIndex];
        if( typeof checkbox.filterValue.lastValue !== 'undefined' && checkbox.filterValue.lastValue !== '' ) {
          // @todo add "and" connection
          if( checkboxesFilterString.length > 0 && checkboxOperator === 'or' ) {
            checkboxesFilterString += ', '
          }
          checkboxesFilterString += checkbox.filterValue.lastValue
        }
      }
      if( checkboxesFilterString !== '' && $this.filter( checkboxesFilterString ).length === 0 ) {
        r = false
      }
    }
    if( r && items.multiselect )
    {
      var c = items.multiselect.length;
      for( var i = 0; i < c; i++ )
      {
        var plainElement = items.multiselect[i];
        var filterValue = plainElement.filterValue.lastValue;
        if( filterValue && filterValue !== "" )
        {
          // if filter does not match the result will be a length of 0
          if( $(this).filter( filterValue ).length === 0 )
          {
            r = false;
            break;
          }
        }
      }
    }
    if( r && items.search !== false &&
        $searchFields.length > 0 &&
        typeof settings.searchItemCallback === 'function'
    ) {
      r = settings.searchItemCallback( $this, searchWord );
    }

    if( r )
    {
      $this.addClass( settings.filterItemActiveClass );
    }
    else
    {
      $this.removeClass( settings.filterItemActiveClass );
    }

    return r;
  };

  var getVisibleElementsCount = function()
  {
    // get all active elements via active class
    $filterActiveElements = $( isotopeOptions.itemSelector ).filter('.'+settings.filterItemActiveClass);
    // Generate Array with Uids from Active Elements
    filterActiveElementsIds = [];
    for(var i = 0; i < $filterActiveElements.length; i++ )
    {
      var $thisActiveElement = $( $filterActiveElements[i] );
      if( $thisActiveElement.attr( 'data-id' ) )
      {
        filterActiveElementsIds.push( parseInt( $thisActiveElement.attr( 'data-id' ) ) );
      }
    }
    // return the number of active elements
    return $filterActiveElements.length;
  };

  var updateVisibleElementsCounter = function()
  {
    // get current filter count
    filterCounter = getVisibleElementsCount();

    if( $filterCounterContainer.length > 0 )
    {
      // see if we need to update the counter
      if( parseInt($filterCounterContainer.html()) !== filterCounter )
      {
        // update filter container
        $filterCounterContainer.html( filterCounter );
        // make standard animation for
        if( settings.showDefaultCounterLineAnimation )
        {
          doCounterLineAnimation( $filterCounterContainer );
        }
      }
    }

    // update result container visibility
    if( $noResultsContainer.length > 0 || $resultsTextContainer.length > 0 )
    {
      if( filterCounter === 0 )
      {
        $noResultsContainer.removeClass( settings.noResultsHiddenClass );
        $resultsTextContainer.addClass( settings.resultsTextHiddenClass );
      }
      else
      {
        $noResultsContainer.addClass( settings.noResultsHiddenClass );
        $resultsTextContainer.removeClass( settings.resultsTextHiddenClass );
      }
    }

    if( $filterCounterText.length > 0 )
    {
      var text = '';
      if( filterCounter > 0 )
      {
        $noResultsContainer.addClass( settings.noResultsHiddenClass );
        if( filterCounter > 1 )
        {
          text = settings.filterCounterText.replace(/XX/i, filterCounter);
        }
        else
        {
          text = settings.filterCounterTextSingular.replace(/XX/i, filterCounter);
        }
      }
      else
      {
        $noResultsContainer.removeClass( settings.noResultsHiddenClass );
        text = settings.filterCounterNoResultsText.replace(/XX/i, filterCounter);
      }
      $filterCounterText.html( text );
      // make standard animation for
      if( settings.showDefaultCounterLineAnimation )
      {
        doCounterLineAnimation( $filterCounterText );
      }
    }

    updateFilterCounterElements( filterCounter );

    // fire update event
    if( typeof settings.onActiveElementsUpdate === "function" )
    {
      settings.onActiveElementsUpdate();
    }

  };

  var updateFilterCounterElements = function( visibleElements ) {
    $.each( filterCounterElements, function() {
      var $this = $( this );
      var data = $this.data();
      if( typeof data.callback === 'function' ) {
        data.callback( $this, visibleElements );
      }
      else {
        var text = '';
        var textDesktop = '';
        if( visibleElements > 1 ) {
          text = data.text;
          textDesktop = data.textDesktop || data.text;
        }
        else if( visibleElements === 1 ) {
          text = data.textSingular || data.text;
          textDesktop = data.textSingularDesktop || data.textSingular || data.textDesktop || data.text;
        }
        else {
          text = data.textNoResult;
          textDesktop = data.textNoResultDesktop || data.textNoResult;
        }

        text = text.replace("XX", visibleElements );
        textDesktop = textDesktop.replace("XX", visibleElements );

        var html = text;
        if( typeof data.template !== 'undefined' ) {
          html = data.template.replace("|mobile|", text).replace("|desktop|", textDesktop);
        }
        $this.html( html );
      }
    });
  };

  return app;

})();