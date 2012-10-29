/*
 *	WeCanPlay : Library for html5 games
 *  WCP.utils : hum ?
 *
 *	Public:
 *
 *	Author: Clement DEBIAUNE
 */

(function (WCP) {
    "use strict";
    
    WCP.utils = {};
    
    WCP.utils.makeArray = function (item) {
        if (typeof item.length === 'undefined') {
            item = [item];
        }
        return (item);
    };
    
    WCP.utils.merge = function (o) {
        for (var i = 1; i < arguments.length; i++) {
            var a = arguments[i];
            
            for (var name in a) {
                if (a.hasOwnProperty(name)) {
                    o[name] = a[name];
                }
            }
        }
        
        return (o);
    };
    
    WCP.utils.clone = function (o) {
        var n = new o.__proto__.constructor();
        WCP.utils.merge(n, o);
        
        if (n.prototype.clone) {
            n.clone();
        }
        
        return (n);
    };
    
})(WCP);

