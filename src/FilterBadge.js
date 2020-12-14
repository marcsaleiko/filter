/**
 * FilterBadge
 *
 */
(function ($) {

  $.fn.FilterBadge = function (options) {
    var settings = $.extend({
      activeClass: 'filter-badge--active',
      // How do we access all other filter badges?
      // If multiple is set to false, which selector should we use to
      // deselect all active badges
      // We also use this selector to deselect active badges when a badge
      // with the keyword "all" was clicked to active or if
      // all other badges are deselected and all should be active
      baseSelector: '.js-filter-badge',
      allBadgeSelector: '.js-filter-badge-all',
    }, options)

    var onBadgeClick = function (e) {
      var $this = $(this)

      if (typeof Filter !== 'undefined' && Filter.isActive() === true)
      {
        if ($this.data('active') === true)
        {
          this.filterValue.lastValue = ''
          $this.removeClass(settings.activeClass)
          $this.data('active', false)
          // is any active? if not, activate "all" badge
          if( $('.'+settings.activeClass).length === 0) {
            activateAllBadge()
          }
        } else
        {
          this.filterValue.lastValue = $this.data('value')
          // use the keyword "all" to disable filtering
          if( this.filterValue.lastValue === 'all' ) {
            this.filterValue.lastValue = ''
            deactivateAllOtherBadges()
          } else {
            deactivateAllBadge()
          }
          $this.addClass(settings.activeClass)
          $this.data('active', true)
        }

        Filter.update()
      }
    }

    var activateAllBadge = function() {
      $(settings.allBadgeSelector).addClass(settings.activeClass).data('active', true)
    }

    var deactivateAllBadge = function() {
      $(settings.allBadgeSelector).removeClass(settings.activeClass).data('active', false)
    }

    var deactivateAllOtherBadges = function() {
      $('.'+settings.activeClass).not(settings.allBadgeSelector).each( function() {
        $(this).removeClass(settings.activeClass).data('active', false)
        this.filterValue.lastValue = ''
      })
    }

    return this.each(function () {
      var $this = $(this)

      settings = $.extend(settings, $this.data())

      if (typeof Filter !== 'undefined')
      {
        if (typeof $this.data('value') === 'undefined')
        {
          $this.data('value', '')
        }

        $this.data('active', false)

        this.filterValue = {
          dimensionType: 'badge',
          direction: '',
          operator: 'or',
          lastValue: '',
          attribute: 'class'
        }
      }

      $this.on('click', onBadgeClick)

      // if this is the "all" badge, activate it by default
      if( $this.filter(settings.allBadgeSelector).length > 0 ) {
        $this.addClass(settings.activeClass).data('active', true)
      }

      return $this
    })
  };
})(jQuery);