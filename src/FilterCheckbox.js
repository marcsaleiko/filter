/**
 * FilterCheckbox
 *
 * Form type for isotope filtered search based on checkbox values.
 * Wraps all checkbox elements w/ meta info. This element may be registered as
 * checkbox to Filter
 *
 * Markup: Use custom selector and trigger $('').FilterCheckbox({}); function
 *
 */
(function( $ ) {

  $.fn.FilterCheckbox = function( options ) {
    var settings = $.extend({
      // Default operator for all checkbox instances
      operator: 'or',
      onChange: function( $this, filterValue ) {
        // Triggers Filter update by default.
        // Override onChange callback if you need further customization
        if( typeof Filter !== 'undefined' && Filter.isActive() ) {
          Filter.update()
        }
      }
    }, options );

    //ensure operator is "or" or "and"
    settings.operator = settings.operator.toLowerCase()
    if( ['or','and'].includes(settings.operator) === false ) {
      settings.operator = 'or'
    }

    /**
     * Returns the css filter string for isotope filter
     * @param {jQuery} $thisCheckbox
     * @return {string}
     */
    var evalValue = function( $thisCheckbox ) {
      if( $thisCheckbox.prop('checked') === true ) {
        // return value (should be css selector) if checked
        return $thisCheckbox.val();
      }
      else {
        // return nothing, no evaluation for this one
        return '';
      }
    };

    /**
     * Will be triggered everytime the checkbox changes. Eventually triggers onChange
     * defined in settings and provides $this and the filtered value
     * @param e
     */
    var onCheckboxChange = function( e ) {
      var $this = $( this );
      if( typeof settings.onChange === 'function' ) {
        this.filterValue.lastValue = evalValue( $this );
        settings.onChange( $this, this.filterValue.lastValue );
      }
    };


    return this.each( function()
    {
      var $this = $(this);
      // initially write value to all fields,
      // but only if checkbox is checked
      var thisValue = '';
      if( $this.prop('checked') === true ) {
        thisValue = $this.val();
      }

      if( typeof Filter !== 'undefined' ) {
        this.filterValue = {
          dimensionType: 'checkbox',
          direction: '',
          // we use this to pass the operator mode to the Filter instance
          // Every checkbox holds this value, but we only check for the first in the set
          // because the operator is the same for every instance
          operator: settings.operator,
          lastValue: thisValue,
          attribute: 'class'
        };
      }

      $this.on('change', onCheckboxChange );

      return $this;
    });
  };

}( jQuery ));