/*
 *    WeCanPlay : Library for html5 games
 *    http://www.wecanplay.fr/
 *  WCP.time : time functions (timers, clock)
 *
 *    Author: Clement DEBIAUNE
 */

(function (WCP) {
    "use strict";

    /**
     * Used by the functions time() and millitime()
     */
    WCP.internalTime = 0;


    /**
     * Return a relative time in seconds
     *
     * This is not mandatory this time is a timestamp (since 1970), it
     * can be a value since the browser running time.
     * You need to use it as relative time by comparing with another time value
     *
     * @see WCP.microtime
     * @returns Relative time in seconds
     */
    function time() {
        return (Date.now() / 1000);
    }

    /**
     * Return a relative time in milliseconds
     *
     * This is not mandatory this time is a timestamp (since 1970), it
     * can be a value since the browser running time.
     * You need to use it as relative time by comparing with another time value
     *
     * @see WCP.time
     * @returns Relative time in milliseconds
     */
    function millitime() {
        return (Date.now());
    }

    /**
     * Timer object is used to retrive the elapsed time
     *
     * @param timeout (optional) if timeout is specified (in milliseconds) this clock can act like a timer
     */
    function Timer(timeout) {
        this.timeout = timeout || 0;

        this.reset();
    }

    /**
     * Returns the clock elapsed time in milliseconds
     *
     * @returns elapsed time in milliseconds
     */
    Timer.prototype.elapsedTime = function () {
        if (this.pauseStart > 0) {
            return (this.pauseStart - this.startTime - this.pauseDuration);
        }

        return (millitime() - this.startTime - this.pauseDuration);
    };

    /**
     * Pause the clock
     * No effect is the clock is already paused
     */
    Timer.prototype.pause = function () {
        if (this.pauseStart === 0) {
            this.pauseStart = millitime();
        }
    };

    /**
     * Unpause the clock.
     * No effect if the clock is unpaused
     */
    Timer.prototype.unpause = function () {
        if (this.pauseStart > 0) {
            this.pauseDuration += millitime() - this.pauseStart;
            this.pauseStart = 0;
        }
    };

    /**
     * Return if the clock is paused
     *
     * @returns true if the clock is paused
     */
    Timer.prototype.paused = function () {
        return (this.pauseStart > 0);
    };

    /**
     * This function make the Timer object like a Timer.
     * If the timeout is expired, and you want to use it again you need
     * to reset the Timer (using Timer.reset())
     *
     * @see Timer.reset
     * @returns true if the timeout period is expired
     */
    Timer.prototype.expired = function () {
        if (this.timeout) {
            return (this.elapsedTime() > this.timeout);
        }

        return (false);
    };

    /**
     * Resets the clock. Clears the pause status, and the start time
     * as now.
     */
    Timer.prototype.reset = function () {
        this.startTime = millitime();
        this.pauseStart = 0;
        this.pauseDuration = 0;
    };



    /**
     * Setup a time scheduler for timeouts and intervals
     */
    function TimeScheduler() {
        this.timer = new Timer();

        /**
         * Holds an Array of timeouts : [timeout time, callback function]
         */
        this.timeouts = [];
        this.nTimeouts = 0;
        /**
         * Holds an Array of intervals : [interval starting time, interval time, callback function]
         */
        this.intervals = [];
        this.nIntervals = 0;

        this.clear();
        this.reset();
    }

    TimeScheduler.prototype.update = function () {
        if (this.paused()) {
            return;
        }

        var elapsed = this.timer.elapsedTime();
        var i, t;


        for (i in this.timeouts) {
            t = this.timeouts[i];

            if (t[0] < elapsed) {
                try {
                    t[1]();
                } catch (e) {
                    throw e;
                } finally {
                    delete this.timeouts[i];
                    this.nTimeouts--;
                }
            }
        }

        for (i in this.intervals) {
            t = this.intervals[i];

            if (t[0] + t[1] < elapsed) {
                t[0] = elapsed;

                try {
                    t[2]();
                } catch (e) {
                    throw e;
                }
            }
        }
    };

    TimeScheduler.prototype.clear = function () {
        this.timeouts = [];
        this.intervals = [];

        this.nTimeouts = 0;
        this.nIntervals = 0;
    };

    TimeScheduler.prototype.setTimeout = function (duration, fn) {
        this.timeouts.push([this.timer.elapsedTime() + duration, fn]);
        this.nTimeouts++;

        return (this.timeouts.length - 1);
    };

    TimeScheduler.prototype.setInterval = function (duration, fn) {
        this.intervals.push([this.timer.elapsedTime(), duration, fn]);
        this.nIntervals++;

        return (this.intervals.length - 1);
    };

    TimeScheduler.prototype.clearTimeout = function (id) {
        if (this.timeouts[id]) {
            delete this.timeouts[id];
            this.nTimeouts--;

            return (true);
        }

        return (false);
    };

    TimeScheduler.prototype.clearInterval = function (id) {
        if (this.intervals[id]) {
            delete this.intervals[id];
            this.nIntervals--;

            return (true);
        }

        return (false);
    };

    TimeScheduler.prototype.reset = function () {
        this.timer.reset();
    };

    TimeScheduler.prototype.pause = function () {
        this.timer.pause();
    };

    TimeScheduler.prototype.unpause = function () {
        this.timer.unpause();
    };

    TimeScheduler.prototype.paused = function () {
        return (this.timer.paused());
    };

    /**
     * FPS Tick Counter
     *
     * @param duration
     */
    function TimeCounter(duration) {
        this.precision = 0.1; // number of s/block
        this.duration = duration || 5;
        this.size = Math.ceil(this.duration / this.precision) + 1;
        this.filled = 0;
        this.index = 0;
        this.previousTime = 0;
        this.startTime = 0;
        this.data = new Array(this.size);

        this.reset();
    }

    TimeCounter.prototype.get = function () {
        var sum = 0;
        var nb = 0;

        for (var i = 0; i < this.size && i < this.filled; i++) {
            if (i !== this.index && this.data[i] > 0) {
                sum += this.data[i];
                nb++;
            }
        }

        if (nb === 0) {
            return (0);
        }

        return (sum / nb / this.precision);
    };

    TimeCounter.prototype.tick = function () {
        var time = WCP.time();
        var delta = time - this.startTime;
        var nextIndex = Math.floor(delta / this.precision) % this.size;

        if (this.index !== nextIndex) {
            this.data[nextIndex] = 0;
        }

        this.data[nextIndex]++;
        this.index = nextIndex;

        if (nextIndex > this.filled) {
            this.filled = nextIndex;
        }
    };

    TimeCounter.prototype.reset = function () {
        this.index = 0;
        this.filled = 0;
        this.startTime = 0;

        for (var i = 0; i < this.size; i++) {
            this.data[i] = 0;
        }
    };


    /**
     * Symbol export
     */
    WCP.time = time;
    WCP.millitime = millitime;
    WCP.Timer = Timer;
    WCP.TimeScheduler = TimeScheduler;
    WCP.TimeCounter = TimeCounter;
})(WCP);
