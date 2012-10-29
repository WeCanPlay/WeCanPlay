/*
 *	WeCanPlay : Library for html5 games
 *  http://www.wecanplay.fr/
 *  WCP.Tools : internal tools
 *
 *	Author: Thomas FLORELLI, Pierrick PAUL
 */

(function (WCP, window, document) {
    "use strict";

    function Tools() {}

    Tools.makeArray = function (item) {
        if (!(item instanceof Array)) {
            item = [item];
        }
        return (item);
    };

    Tools.inArray = function (obj, ar) {
        for (var i = 0; i < ar.length; i++) {
            if (ar[i] === obj) {
                return true;
            }
        }
        return false;
    };

    Tools.getCanvasPos = function () {
        var obj = WCP.canvas;
        var top = 0;
        var left = 0;
        while (obj.offsetParent) {
            top += obj.offsetTop;
            left += obj.offsetLeft;
            obj = obj.offsetParent;
        }
        return {
            top: top,
            left: left
        };
    };

    Tools.cloneObject = function (obj) {
        var target = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                target[i] = obj[i];
            }
        }
		return target;
    };

	Tools.extend = function(dest, src) {
		for (var i in src) {
            if (src.hasOwnProperty(i)) {
				dest[i] = src[i];
			}
		}
		return dest;
	}
	
    Tools.degresToRadian = function (degres) {
        return degres * Math.PI / 180;
    };

	Tools._length = function(object) {
		var size = 0, key;
		for (key in object) {
			if (object.hasOwnProperty(key)) {
				size++;
			}
		}
		return size;
	};

    function clear() {
        WCP.ctx.clearRect(0, 0, WCP.width, WCP.height);
    }

    function bufferCanvas(width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.ctx = canvas.getContext('2d');

        return (canvas);
    }

    function random(min, max) {
        return (Math.floor(Math.random() * (max - min + 1)) + min);
    }	

    WCP.Tools = Tools;
    WCP.clear = clear;
    WCP.bufferCanvas = bufferCanvas;
    WCP.random = random;
})(WCP, window, document);
