/*
 *	WeCanPlay : Library for html5 games
 *	http://www.wecanplay.fr/
 *  WCP : main class
 *
 *	Author: Thomas FLORELLI, Pierrick PAUL
 */

(function (w, d, undefined) {
    "use strict";

    function WCP() {
        this.debug = false;
        this.ctx = 0;
        this.canvas = 0;
        this.width = 0;
        this.height = 0;
    }

    WCP.prototype.setCanvas = function (c, width, height) {
        this.canvas = d.getElementById(c);

        if (width > 0 && height > 0) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        this.ctx = this.canvas.getContext('2d');

        this.initViewModule();
        this.fire("canvasReady");
    };

    WCP.prototype.setMode = function (modes) {
        /*
        for (var key in MODES) {
            if ((modes & MODES[key]) == MODES[key]) {
                if (my.mode[key]) {
                    my.log(key+" MODE OFF");
                    my.mode[key] = false;
                } else {
                    my.mode[key] = true;
                    my.log(key+" MODE ON");
                }
            }
        }*/
        console.error("DEPRECATED - for log use WCP.log(true)");
    };

    WCP.prototype.log = function (msg) {
        if (typeof msg === 'boolean') {
            this.logEnable = msg;
        }
        if (this.logEnable) {
            console.log(msg);
        }
    };

    WCP.prototype.extend = function (opt, module) {
        console.error("DEPRECATED - see wiki template - kiss LeMulot");
        /*
        console.log("instancy module :" + opt.name);
        if (opt.init) {
            my[opt.name] = new module();
        }
        */
    };

    window.WCP = new WCP();
})(window, document, undefined);
