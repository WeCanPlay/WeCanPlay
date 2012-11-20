/*
 *	WeCanPlay : Library for html5 games
 *	http://www.wecanplay.fr/
 *  Module WCP.View provides a basic view container for sprites
 *  and the different game logic
 *
 *	Author: Clement DEBIAUNE, Luc DE-ORDENANA
 */

(function (WCP) {
    "use strict";

    window.requestAnimFrame = (function () {
        return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback, element) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    var _viewsData = {
        activeViews: [],
        updatingView: null,
        lastGlobalUpdateTime: 0
    };
    
    /**
     * WCP Global (internal) variables
     */
    WCP.globalFps = 60;
    WCP.fpsCounter = new WCP.TimeCounter();

    /**
     * A Drawable is an object able to be drawn on the canvas
     * This class is an Abstract class, the inheriting classes have to
     *   implement the : draw(ctx) method
     */
    function Drawable() {
        this._zindex = 100;
        this._parent = null;
    }

    /**
     * Draw the object onto the `ctx` canvas object
     * This method is abstract and have to be overriden in children classes
     */
    Drawable.prototype.draw = function (ctx) {
        throw new Error("You have to override the draw(ctx) method");
    };

    /**
     * Set the z-index of this objects. This value is relative to the other
     *   objects contained in the parent Layer.
     * The z-index value is caped between 0 and 999
     */
    Drawable.prototype.setZIndex = function (v) {
        if (v > 999) {
            v = 999;
        }
        
        if (v < 0) {
            v = 0;
        }
        
        var old = this._zindex;
        this._zindex = v;
        
        if (this._parent) {
            this._parent._notifyZIndexChange(this, old, v);
        }
    };

    /**
     * Returns the z-index of this objects
     */
    Drawable.prototype.getZIndex = function () {
        return (this._zindex);
    };


    /**
     * This is a container for Drawable objects, it can maintain
     *    a list of objects to be draw and respect their ZIndex
     * All elements inside are stored in a ZIndex value indexed list
     *   like this : _children[zindex] = [e^0, e^1, ... e^n]
     *   It is a good compromise between usuability and performances. If the
     *   user needs many different ZIndex the performances might decrease (to test)
     *
     * Implements: Drawable
     */
    function Layer() {
        this._children = [];
    }

    Layer.prototype = new Drawable();

    /**
     * Draw all the _children of this Layer onto the `ctx` 2D context (or WCP.ctx)
     * The elements are drawn respectively to their relative ZIndex
     */
    Layer.prototype.draw = function (ctx) {
        ctx = ctx || WCP.ctx;
        
        // first level is the zindex of the elements
        for (var zi in this._children) {
            if (this._children.hasOwnProperty(zi)) {
                var elements = this._children[zi];
    
                for (var i = 0, len = elements.length; i < len; i++) {
                    elements[i].draw(ctx);
                }
            }
        }
    };

    /**
     * Private function called when the ZIndex of a _children of this Layer
     *   is changed. The element is then moved from the old to the new ZIndex
     *   list
     */
    Layer.prototype._notifyZIndexChange = function (el, old_zindex, new_zindex) {
        if (el._parent !== this) {
            return;
        }
        
        if (!this._children[new_zindex]) {
            this._children[new_zindex] = [];
        }
        
        var index = this._children[old_zindex].indexOf(el);
        this._children[old_zindex].splice(index, 1);
        this._children[new_zindex].push(el);
    };
    
    /**
     * Add one or multiple Drawable elements to this Layer
     * The method accepts an unlimited number of arguments, each of them
     *   has to be a Drawable object
     * The Layer <-> Drawable parental relationship is made within this method
     * If any Drawable already has a parent Layer, the object will be moved
     *   to this Layer. No effect if the Drawable parent is already this Layer
     */
    Layer.prototype.add = function () {
        for (var i = 0; i < arguments.length; i++) {
            var element = arguments[i];
            
            var zi = element._zindex;
            
            if (element._parent !== this) {
                if (!this._children[zi]) {
                    this._children[zi] = [];
                }
                
                this._children[zi].push(element);
                
                if (element._parent) {
                    element._parent.remove(element);
                }
                
                element._parent = this;
            }
        }
    };
    
    /**
     * Remove one or multiple Drawable elements currently inside to this Layer
     * The method accepts an unlimited number of arguments, each of them
     *   has to be a child Drawable object
     * The Layer <-> Drawable relationship is removed at this moment
     */
    Layer.prototype.remove = function () {
        for (var i = 0; i < arguments.length; i++) {
            var element = arguments[i];
            
            var zi = element._zindex;
            
            if (element._parent === this && this._children[zi]) {
                var index = this._children[zi].indexOf(element);
                this._children[zi].splice(index, 1);
                
                element._parent = null;
            }
        }
    };

    /**
     * Quickly removes all the children of this Layer
     * The parent relationship with every child is deleted and the
     *   children list is emptied
     */
    Layer.prototype.removeAll = function () {
        for (var zi in this._children) {
            if (this._children.hasOwnProperty(zi)) {
                var elements = this._children[zi];
    
                for (var i = 0, len = elements.length; i < len; i++) {
                    elements[i]._parent = null;
                }
            }
        }

        this._children = [];
    };

    /**
     * Returns the list of all children. You shoul not change the object returned
     *   by this method !
     * The format depends of the implementation of the ZIndex property
     * Indexes of this objects correspond to the ZIndex property values of
     *   the different objects inside
     * For example, if there are 3 objects called: sprite1_10, sprite2_10, sprite3_20
     *   respectively with these z-index values :  10          10          20
     *   so the returned object is:
     *     {10: [sprite1_10, sprite2_10], 20: [sprite3_20]}
     * Note that empty Drawable list might be inside. Example :
     *   {10: [sprite1_10, sprite2_10], 20: [], 30: [sprite4_30]}
     */
    Layer.prototype.getChildren = function () {
        return (this._children);
    };


    /**
     * Represents a unique game "view"
     * It provides a common structure to manage different view together and
     *   their lifetime.
     * Every Drawble, Timer of Event assigned to the View is then handled by it
     *   and will be automatically destroyed when the view is stopped
     * See the documentation for more informations as this object is complicated
     *   to understand
     *
     * Extends: Layer
     */
    function View(param) {
        // scene refresh rate (in ms)
        this.refresh = param.refreshRate || (1000 / 60);
        // scene last update time
        this.lastUpdate = 0;
        this.active = false;
        this.paused = false;

        this.sched = new WCP.TimeScheduler();

        // View methods
        this.fn = {
            init: param.init || (function () {}),
            loop: param.loop || (function () {}),
            draw: param.draw || (function () {}),
            destroy: param.destroy || (function () {})
        };
    }

    View.prototype = new Layer();

    /**
     * Update this view
     * The Time Scheduler is updated and then the user callback `loop` is called
     * No drawing is made withing this method
     */
    View.prototype.update = function () {
        if (this.active) {
            _viewsData.updatingView = this;
    
            this.sched.update();
            this.fn.loop.call(this);
            this.draw();
    
            _viewsData.updatingView = null;
        }
    };
    
    /**
     * Draws the view onto the `ctx` canvas object
     * Calls the Layer.draw() method and then the user callback `draw`
     */
    View.prototype.draw = function (ctx) {
        Layer.prototype.draw.call(this, ctx);
        
        this.fn.draw.call(this);
    };
    
    /**
     * Starts the view (no effect if it is already running)
     * This view object is pushed on the top of the running views stack
     * Upon activation the user callback `init` is called
     */
    View.prototype.start = function (params) {
        if (!this.active) {
            this.active = true;
            
            _viewsData.activeViews.push(this);
            
            _viewsData.updatingView = this;
            this.fn.init.call(this, params);
            _viewsData.updatingView = null;
        }
    };
    
    /**
     * Stops the view (no effect if it is not running)
     * The user callback `destroy` is firstly called
     * Then, all the Drawable elements are removed from the Layer
     *   and the time scheduler is reset
     * The view object is removed from the running views stack
     */
    View.prototype.stop = function () {
        if (this.active) {
            _viewsData.updatingView = this;
            this.fn.destroy.call(this);
            _viewsData.updatingView = null;
            
            this.active = false;
            this.paused = false;
            this.lastUpdate = 0;
            
            _viewsData.activeViews.splice(_viewsData.activeViews.indexOf(this), 1);
            
            this.removeAll();
            this.sched.reset();
        }
    };
    
    /**
     * Pauses the view (no effect if it is already paused)
     * Timers will not be triggered and the update() method will
     *   not be called while it is paused
     */
    View.prototype.pause = function () {
        if (!this.paused && this.active) {
            this.paused = true;
            this.active = false;
    
            this.sched.pause();
        }
    };
    
    /**
     * Unpauses the view (no effect is it is not paused)
     * Timers are unpaused, and the view will be updated on the next tick
     */
    View.prototype.unpause = function () {
        if (this.paused) {
            this.paused = false;
            this.active = true;
    
            this.sched.unpause();
        }
    };
    
    /**
     * Returns the number of milliseconds since the last update of this view
     */
    View.prototype.elapsed = function () {
        return (_viewsData.lastGlobalUpdateTime - this.lastUpdate);
    };
    
    /**
     * Stops all the running view, in stack order
     * The stack will be emptied
     */
    function clearViews() {
        /*
         * When a view is stopped, it is removed from the activeViews array
         * using the slice() array method
         * So the indexes are automatically re-created from zero, and the bottom
         *   view is alwaysthe index 0
         */
        while (_viewsData.activeViews.length > 0) {
            _viewsData.activeViews[0].stop();
        }
    }
    
    /**
     * Set the maximum running FPS (capped between 1 and 60)
     */
    function setFps(v) {
        v = (v < 1 ? 1 : (v > 60 ? 60 : v));
    
        WCP.globalFps = v;
    }
    
    /**
     * Returns the maximum FPS
     */
    function getFps() {
        return (WCP.globalFps);
    }
    
    /**
     * Returns the computed FPS
     */
    function getRealFps() {
        return (WCP.fpsCounter.get());
    }
    
    /**
    * Creates a proxy function to bind a global function (inside WCP) to call
    *   a function inside the '_viewsData.updatingView' object
    *
    * @param functionName the final function to call
    * @param property (optional) the property
    */
    function createUpdatingViewProxy(functionName, property) {
        if (property) {
            return (function () {
                if (_viewsData.updatingView) {
                    _viewsData.updatingView[property][functionName].apply(_viewsData.updatingView[property], arguments);
                }
            });
        }
    
        return (function () {
            if (_viewsData.updatingView) {
                _viewsData.updatingView[functionName].apply(_viewsData.updatingView, arguments);
            }
        });
    }
    
    /*
     * EXPORTS
     */
     // Classes
    WCP.Drawable = Drawable;
    WCP.Layer = Layer;
    WCP.View = View;

    // View functions
    WCP.clearViews = clearViews;
    WCP.setFps = setFps;
    WCP.getFps = getFps;
    WCP.getRealFps = getRealFps;
    
    // Global methods
    WCP.add = createUpdatingViewProxy("add");
    WCP.remove = createUpdatingViewProxy("remove");
    WCP.setTimeout = createUpdatingViewProxy("setTimeout", "sched");
    WCP.clearTimeout = createUpdatingViewProxy("clearTimeout", "sched");
    WCP.setInterval = createUpdatingViewProxy("setInterval", "sched");
    WCP.clearInterval = createUpdatingViewProxy("clearInterval", "sched");
    
    /**
    * Views GLOBAL updating function
    */
    function updateAllViews() {
        window.requestAnimFrame(updateAllViews);
    
        var time = WCP.millitime();
        var deltaLastUpdate = time - _viewsData.lastGlobalUpdateTime;
    
        // No update
        // if (deltaLastUpdate < (1000 / WCP.globalFps)) {
        //     return;
        // }
    
        _viewsData.lastGlobalUpdateTime = time;
    
        var cleared = false;
    
        for (var i = 0, len = _viewsData.activeViews.length; i < len; i++) {
            var view = _viewsData.activeViews[i];
    
            if (view.lastUpdate === 0) {
                view.lastUpdate = _viewsData.lastGlobalUpdateTime;
            }
    
            if (!cleared) {
                WCP.clear();
                WCP.fpsCounter.tick();
    
                cleared = true;
            }
    
            if (view.active === true) {
                view.update();
            } else if (view.paused) {
                view.draw();
            }
    
            view.lastUpdate = _viewsData.lastGlobalUpdateTime;
        }
    }
    
    WCP.initViewModule = function () {
        WCP.fpsCounter.reset();
    
        updateAllViews();
    };
})(WCP);
