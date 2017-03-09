(function(jQuery, Date, clearInterval, setInterval, define) {
    "use strict";

    (function(factory) {
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define(['jquery'], factory);
        } else {
            // Browser globals.
            factory(jQuery);
        }
    })(function($) {
        var
            all$Els = [],
            interval,
            TIME_FORMATS = [
                [1, 'Just Now', 'Just Now'],
                [2, '1 Second Ago', '1 Second From Now'],
                [60, 'Seconds', 1],                         // 60
                [120, '1 Minute Ago', '1 Minute From Now'], // 60*2
                [3600, 'Minutes', 60],                      // 60*60, 60
                [7200, '1 Hour Ago', '1 Hour From Now'],    // 60*60*2
                [86400, 'Hours', 3600],                     // 60*60*24, 60*60
                [172800, 'Yesterday', 'Tomorrow'],          // 60*60*24*2
                [604800, 'Days', 86400],                    // 60*60*24*7, 60*60*24
                [1209600, 'Last Week', 'Next Week'],        // 60*60*24*7*4*2
                [2628000, 'Weeks', 604800],                 // 30.416 days
                [5256000, 'Last Month', 'Next Month'],      // 60.832 days
                [31557600, 'Months', 2628000],              // 365.25 days
                [63115200, 'Last Year', 'Next Year']
            ]
        ;

        $.fn.friendlyTime = function(opts) {
            if (!this.length) {
                // Invoked with no matches.
                return;
            }

            if (!opts) opts = {};

            if (opts.stopUpdates) {
                this.each(stopUpdates);

                return;
            }

            // We don't want to use a jQuery object, because we need to group together unrelated items, and
            // a jQuery object has extra crap in it that implies particular relations (i.e. selector property).
            var new$Els = 
                $.makeArray(this.
                    filter(function() { return !$(this).data('friendlyTime'); }).
                    data('friendlyTime', opts)
                ).
                map(function(el) { return $(el); })
            ;

            if (!opts.skipInit) friendlyTime(new$Els);

            // Restore all elements, adding new ones.
            all$Els.push.apply(all$Els, new$Els);

            if (!interval) interval = setInterval(friendlyTime.bind(this, all$Els), $.fn.friendlyTime.DURATION);
            return this;
        };

        $.fn.friendlyTime.DURATION = 60000;

        return $;

        function friendlyTime($els) {
            $els.forEach(function($el) {
                var utcDate = $el.data().utcDate;

                // Do this in this private Function instead of directly in $.friendlyTime so
                // that the initial load is as fast as possible.
                if (!utcDate) {
                    // This comes from HTML data attribute.
                    var utcString = $el.data().time;

                    utcDate = fromUniversalString(utcString);
                    $el.data('utcDate', utcDate);

                    if (!$el.attr('title')) $el.attr('title', utcDate.toUTCString());
                }

                var opts = $el.data().friendlyTime;

                // If friendlyTime isn't told to stop updating a detached element, the element
                // will remain in our update set, but it's data() will be wiped (except for
                // html data attrs) by jQuery when it was detached.
                if (typeof opts === "undefined") {
                    // Detached element. Stop tracking it for updates.
                    stopUpdates.call(this);
                    return;
                }

                $el.text(toRelativeString(utcDate, opts.suppressFuture, opts.nowWindow));
            });
        }
        
        function stopUpdates(){
            var $el, i, thiz = this;

            for (i = 0; i < all$Els.length; i++) {
                $el = all$Els[i];
                if ($el[0] !== thiz) continue;

                // If the element was already detached, the next line is a NOOP (courtesy of jQuery
                // detach logic).
                $el.removeData('friendlyTime');

                all$Els.splice(i, 1);
                break;
            }

            // stopUpdate element not found.
        }

        function toRelativeString(time, suppressFuture, nowWindow) {
            var
                seconds = (new Date() - time) / 1000,
                token = ' Ago',
                direction = 1,
                i = 0,
                format = TIME_FORMATS[i++]
            ;

            if (!suppressFuture && seconds < 0) {
                seconds = Math.abs(seconds);
                token = ' From Now';
                direction = 2;
            }

            if (typeof nowWindow != "undefined" && seconds < nowWindow) {
                return format[1];
            }

            while (format) {
                if (seconds < format[0]) {
                    if (typeof format[2] == 'string') return format[direction];
                    else return Math.floor(seconds / format[2]) + ' ' + format[1] +  token;
                }
                format = TIME_FORMATS[i++];
            }

            // Should never get here.
            return Math.floor(seconds / 31557600) + ' Years Ago';
        }

        // Should be ISO8601 string, with "Z" time zone descriptor.
        function fromUniversalString(dateStr) {
            /*
                var time = dateStr.replace(/Z/g, "");
                if (time.substr(time.length - 4, 1) == ".") time = time.substr(0, time.length - 4);
                if (parseNeedsSlashes) time = time.replace("-","/");
            */
            return new Date(dateStr);
        }
    });
})(this.jQuery, Date, clearInterval, setInterval, this.define);
