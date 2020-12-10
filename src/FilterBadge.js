/**
 * FilterBadge
 *
 */
(function ($) {

    $.fn.FilterBadge = function (options) {
      var settings = $.extend({
        activeClass: 'filter-badge--active',
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
          } else
          {
            this.filterValue.lastValue = $this.data('value')
            $this.addClass(settings.activeClass)
            $this.data('active', true)
          }
  
          Filter.update()
        }
      }
  
      return this.each(function () {
        var $this = $(this)
  
        settings = $.extend(settings, $this.data())
  
        if (typeof Filter !== 'undefined')
        {
          var initialValue = ''
          if (typeof $this.data('value') === 'undefined')
          {
            $this.data('value', '')
          } else
  
          $this.data('active', false)
  
          this.filterValue = {
            dimensionType: 'badge',
            direction: '',
            operator: 'or',
            lastValue: initialValue,
            attribute: 'class'
          }
        }
  
        $this.on('click', onBadgeClick)
  
        return $this
      })
    };
  
  })(jQuery);