/**
 * FilterMultiselect
 *
 */
( function( $ ) {

    $.fn.FilterMultiselect = function( options )
    {
      var settings = $.extend({
        overrideEnableClickableOptGroups: true,
        enableClickableOptGroups: true,
        onChange: function( option, element, checked )
        {
          // get filter value/string of current selection
          var filterString = evalSelectValue( this.$select );
          // update filterValue stuff if module isset
          if( typeof Filter !== 'undefined' && Filter.isActive() === true )
          {
            this.$select.get(0).filterValue.lastValue = filterString;
            Filter.update();
          }
        },
        buttonClass: 'btn btn-primary',
        numberDisplayed: 2,
        nonSelectedText: "Keine Auswahl",
        nSelectedText: ' ausgewählt',
        allSelectedText: "Alle ausgewählt",
        maxHeight: false
  
      }, options );
  
      /**
       * Returns the filterString for isotope filter
       * @param  {jQuery} $thisSelect jQuery select object
       * @return {string}
       */
      var evalSelectValue = function( $thisSelect )
      {
        var filterValue = $thisSelect.val();
        var filterString = "";
        var operator = "or";
        if( filterValue )
        {
          // retrieve operator data
          if( $thisSelect.get(0).filterValue )
          {
            operator = $thisSelect.get(0).filterValue.operator;
          }
  
          var c = filterValue.length;
          for( var i = 0; i < c; i++ )
          {
            if( operator === "or" )
            {
              if( i === 0 )
              {
                filterString += filterValue[i];
              }
              else
              {
                filterString += ", "+filterValue[i];
              }
            }
            else if( operator === "and" )
            {
              filterString += filterValue[i];
            }
          }
        }
        return filterString;
      };
  
      return this.each( function()
      {
        var $this = $(this);
        if( settings.overrideEnableClickableOptGroups )
        {
          if( $this.data("operator") && $this.data("operator") === "and" )
          {
            settings.multiselectOptions.enableClickableOptGroups = false;
          }
        }
  
        settings = $.extend( settings, $this.data() );
  
        settings.multiselectOptions = {
          enableClickableOptGroups: settings.enableClickableOptGroups,
          onChange: settings.onChange,
          buttonClass: settings.buttonClass,
          numberDisplayed: settings.numberDisplayed,
          nonSelectedText: settings.nonSelectedText,
          nSelectedText: settings.nSelectedText,
          allSelectedText: settings.allSelectedText,
          maxHeight: settings.maxHeight
        };
  
        $this.multiselect( settings.multiselectOptions );
        if( typeof Filter !== 'undefined' )
        {
          // get initial values of select
          var initialValue = evalSelectValue( $this );
          this.filterValue = {
            dimensionType: "multiselect",
            direction: "",
            operator: $this.data("operator"),
            lastValue: initialValue,
            attribute: "class"
          };
        }
        return $this;
      });
    };
  
  })( jQuery );