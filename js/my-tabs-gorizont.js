
/*!
    * JQuery плагин дл€ простого создани€ горизонтальных вкладок с анимированным выводом их содержимого
    * ¬озможные эффекты: scale, slideLeft,scaleUp и flip
    * Further changes, comments: @aaronlumsden
    * Licensed under the MIT license
*/


;(function ( $, window, document, undefined ) {
    var pluginName = "tabulous",
    defaults = {
        effect: 'scale'
    };
    function Plugin( element, options ) {
        this.element = element;
        this.$elem = $(this.element);
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    Plugin.prototype = {
        init: function() {
            var links = this.$elem.find('li').find('a');
            var firstchild = this.$elem.find('li:first-child').find('a');
            var lastchild = this.$elem.find('li:last-child').after('<span class="tabulousclear"></span>');
            if (this.options.effect == 'scale') {
                tab_content = this.$elem.find('.tab_block').not(':first').not(':nth-child(1)').addClass('hidescale');
                } else if (this.options.effect == 'slideLeft') {
                tab_content = this.$elem.find('.tab_block').not(':first').not(':nth-child(1)').addClass('hideleft');
                } else if (this.options.effect == 'scaleUp') {
                tab_content = this.$elem.find('.tab_block').not(':first').not(':nth-child(1)').addClass('hidescaleup');
                } else if (this.options.effect == 'flip') {
                tab_content = this.$elem.find('.tab_block').not(':first').not(':nth-child(1)').addClass('hideflip');
            }
            var firstdiv = this.$elem.find('#tabs_container');
            var firstdivheight = firstdiv.find('.tab_block:first').height() + 40;
            var alldivs = this.$elem.find('div:first').find('.tab_block');
            alldivs.css({'position': 'absolute','top':'0'});
            firstdiv.css('height',firstdivheight+'px');
            firstchild.addClass('tabulous_active');
            links.bind('click', {myOptions: this.options}, function(e) {
                e.preventDefault();
                var $options = e.data.myOptions;
                var effect = $options.effect;
                var mythis = $(this);
                var thisform = mythis.parent().parent().parent();
                var thislink = mythis.attr('href');
                firstdiv.addClass('transition');
                links.removeClass('tabulous_active');
                mythis.addClass('tabulous_active');
                thisdivwidth = thisform.find('.tab_block'+thislink).height() + 40;
                if (effect == 'scale') {
                    alldivs.removeClass('showscale').addClass('make_transist').addClass('hidescale');
                    thisform.find('.tab_block'+thislink).addClass('make_transist').addClass('showscale');
                    } else if (effect == 'slideLeft') {
                    alldivs.removeClass('showleft').addClass('make_transist').addClass('hideleft');
                    thisform.find('.tab_block'+thislink).addClass('make_transist').addClass('showleft');
                    } else if (effect == 'scaleUp') {
                    alldivs.removeClass('showscaleup').addClass('make_transist').addClass('hidescaleup');
                    thisform.find('.tab_block'+thislink).addClass('make_transist').addClass('showscaleup');
                    } else if (effect == 'flip') {
                    alldivs.removeClass('showflip').addClass('make_transist').addClass('hideflip');
                    thisform.find('.tab_block'+thislink).addClass('make_transist').addClass('showflip');
                }
                firstdiv.css('height',thisdivwidth+'px');
            });
        },
        yourOtherFunction: function(el, options) {
            // some logic
        }
    };
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            new Plugin( this, options );
        });
    };
})( jQuery, window, document );

$(window).on('load resize', function () {
    $('#tabs').tabulous({
        effect: 'slideLeft'
    });
});
