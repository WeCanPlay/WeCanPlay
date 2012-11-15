/*
 *  WeCanPlay : Library for html5 games
 *  http://www.wecanplay.fr/
 *  WCP.Animation : Create and manage animation
 *
 *  Author: Benjamin ROTHAN
 */

(function (WCP) {
    "use strict";
	
	/**
	 * Variables to manage the animations
	 */
    var animateList = [];
    var animateId = 0;

    /**
     * The TimeLine object allow to define lunch of animations at a chosen time.
     */
    function TimeLine() {
        animateList[animateId] = this;
        this.animateId = animateId;
        animateId++;

        this.timeLine = [];
        this.time = 0;
        this.startTime = -1;
    }

	/**
	 * Set a object (animation, clip, ...) to be lunch at a special time after 
	 *   the start of the timeline. The `time` is in milliseconds
	 */
    TimeLine.prototype.set = function (time, object) {
        if (this.timeLine.length === 0) {
            this.timeLine.push({time: time, object: object});
        }
        else {
            var isAdd = false;
            for (var x in this.timeLine) {
                if (time <= this.timeLine[x].time) {
                    this.timeLine.splice(x, 0, {time: time, object: object});
                    isAdd = true;
                    break;
                }
            }
            if (isAdd === false) {
                this.timeLine.push({time: time, object: object});
            }
        }
    };
    
	/**
	 * Start the TimeLine, the times specify with the objects set earlier are
	 *   relative to this start.
	 */
    TimeLine.prototype.start = function () {
        if (this.startTime < 0) {
            this.startTime = WCP.millitime();
            this.step();
        }
    };

	/**
	 * Function call in a loop with setTimeout (), used to launch the objects.
	 */
    TimeLine.prototype.step = function () {
		while (this.timeLine.length > 0 && this.timeLine[0].time <= this.time) {
			if (typeof(this.timeLine[0].object) !== "undefined") {
				this.timeLine[0].object.start();
			}
			this.timeLine.shift();
		}
		this.time = WCP.millitime() - this.startTime;
        
        WCP.setTimeout(0, (function (o) {
            return function () {
                o.step();
            };
        })(animateList[this.animateId]));
    };

    /**
     * A Clip is a kind of container for other animation, clip or object.
     */
    function Clip() {
        this.clip = this;
        this.list = [];
        this.index = 0;
    }
    
	/**
	 * Add an object in the Clip.
	 */
    Clip.prototype.add = function () {
        for (var i = 0; i < arguments.length; i++) {
            this.list[this.index] = arguments[i];
            this.index++;
        }
    };

	/**
	 * Start all the object contained in the Clip at the same time.
	 */
    Clip.prototype.start = function () {
		for (var x in this.list) {
			var complete = this.list[x].start();
		}
    };

	/**
	 * Return a clone of the Clip and its content.
	 * The arguments must be the new sprites use by the cloned object. 
	 * The sprites must be in the order of adding.
	 */
    Clip.prototype.clone = function () {
        var newAnimationClip = new Clip();
        for (var effect in this.list) {
            if (arguments.length > effect) {
                newAnimationClip.list[newAnimationClip.index] = this.list[effect].clone(arguments[effect]);
            }
            else {
                newAnimationClip.list[newAnimationClip.index] = this.list[effect].clone();
            }
            newAnimationClip.index++;
        }
        newAnimationClip.index = this.index;
        newAnimationClip.speed = this.speed;
        newAnimationClip.stop = this.stop;
        return (newAnimationClip);
    };

	/**
	 * This function move all the objects of the clip by adding `x` and `y` to
	 *   the current coordinates.
	 */
    Clip.prototype.offset = function (x, y) {
        for (var effect in this.list) {
            this.list[effect].offset(x, y);
        }
    };
    
    /**
     * Animation is an object that can animate a sprite.
     */
    function Animation(sprite, soundManager) {
        animateList[animateId] = this;
        this.animateId = animateId;
        animateId++;

        this.sprite = sprite;
        this.isSpriteAdd = false;

        this.soundManager = soundManager;

        this.bundles = [];
        this.curBundle = 0;
        this.lastBundle = -1;
        this.spriteOrigin = null;
        this.startTime = -1;
        this.frameNumber = 0;
        this.time = 0;
    }

	/**
	 * The method animate define an animation on the sprite. Several effects can be
	 *   describe it and a set of effects is call a bundle.
	 * The arguments must be array which contains specifics information on the sprite.
	 * Some key words are also possible.
	 * ex: animate({x: 10, time: 1})
	 */
    Animation.prototype.animate = function () {
        if (arguments.length > 0) {
            this.addBundle(arguments);
        }
        return (this);
    };
    
	/**
	 * Method that add a bundle in the bundle list of the animation.
	 */
    Animation.prototype.addBundle = function (effects) {
        var bundle = [];
        for (var i = 0; i < effects.length; i++) {
            var effect = this.createEffect(effects[i]);

            // Add effect in bundle
            bundle.push(effect);
        }
        this.bundles.push(bundle);
    };

	/**
	 * This method return an effect. An animation is componed by several effects.
	 * For example, an spinning wheel that move is componed by the effect of moving
	 *   and the effect of spinning.
	 */
    Animation.prototype.createEffect = function (effect) {
        // Init effect object's properties
        var duration = 0;
        var dType = durationType.NONE;
        if (typeof(effect.frames) !== "undefined") {
            duration = effect.frames;
            dType = durationType.FRAMES;
        }
        else if (typeof(effect.time) !== "undefined") {
            duration = effect.time;
            dType = durationType.TIME;
        }
        effect.properties = {
            complete: false,
            duration: duration,
            durationType: dType,
            shift: ((typeof(effect.shift) !== 'undefined') ? effect.shift : Shift.line),
            ease: ((typeof(effect.ease) !== 'undefined') ? effect.ease : Ease.none)
        };
        delete effect.duration;
        delete effect.frames;
        delete effect.time;
        return (effect);
    };

	/**
	 * Launch the animation.
	 */
    Animation.prototype.start = function () {
        if (this.startTime < 0) {
            if (this.isSpriteAdd === false) {
                WCP.add(this.sprite);
                this.isSpriteAdd = true;
            }
            this.startTime = WCP.millitime();
            this.step();
        }
    };
    
	/**
	 * Private function call at each frame used to call all the bundles.
	 */
    Animation.prototype.step = function () {
        // If no bundles, don't start the animation
        if (this.bundles.length === 0) {
            return;
        }
        
        // If there is no more bundles, stop
        if (this.curBundle >= this.bundles.length) {
            return;
        }

        this.frameNumber++;
        
        var stop = false;
        while (stop === false) {
            if (!(this.curBundle < this.bundles.length && this.stepBundle() === true)) {
                stop = true;
            }
        }

        // @TODO: getFps is that right?
        WCP.setTimeout(0, (function (o) {
            return function () {
                o.step();
            };
        })(animateList[this.animateId]));
    };
    
	/**
	 * Private function used to analyse the effects inside the current bundle and
	 *   call them.
	 * When a bundle is finished, the next is called.
	 */
    Animation.prototype.stepBundle = function () {
        // For a new bundle, copy the orignal data from sprite
        if (this.curBundle !== this.lastBundle) {
            if (this.spriteOrigin !== null) {
                delete this.spriteOrigin;
            }
            this.spriteOrigin = [];
            for (var i in this.sprite) {
                if (this.sprite.hasOwnProperty(i)) {
                    this.spriteOrigin[i] = this.sprite[i];
                }
            }
            this.startTime = WCP.millitime();
            this.lastBundle = this.curBundle;
        }

        var next = true;
        var bundle = this.bundles[this.curBundle];
        if (bundle.length > 0) {
            for (var j = 0; j < bundle.length; j++) {
                this.time = WCP.millitime() - this.startTime; // * speed to modify speed
                var effect = bundle[j];
                if (effect.properties.complete === false) {
                    this.stepEffect(effect);
                    next = false;
                }
                if (effect.properties.next === true) {
                    next = true;
                }
            }
        }
        if (next === true) {
            this.curBundle++;
        }
        return (next);
    };
    
	/**
	 * Calculate the percentage of completion of the animation.
	 * Return an array with the current percentage and a boolean, named finish,
	 *   which indicate if the animation exceed its duration.
	 */
    Animation.prototype.getDelta = function (effect) {
        var percent = 1;
        var finish = true;
        if (effect.properties.durationType !== durationType.NONE && effect.properties.duration > 0) {
            var delta = 0;
            if (effect.properties.durationType === durationType.FRAMES) {
                delta = this.frameNumber;
            }
            else if (effect.properties.durationType === durationType.TIME) {
                delta = this.time;
            }
        
            if (delta > effect.properties.duration) {
                percent = 1;
                finish = true;
            }
            else {
                percent = effect.properties.ease.calculate(delta / effect.properties.duration);
                finish = false;
            }
        }
        return ({percent: percent, finish: finish});
    };
    
	/**
	 * Private function that use the effect's data to do the animation.
	 * It is in this function that key words for animation are used.
	 * If the information in the effect is not a key word, the function consider
	 *   that is must be a sprite attributes.
	 */
    Animation.prototype.stepEffect = function (effect) {
        // Manage other effect
        if (typeof(effect.animation) !== "undefined") {
            effect.animation.start();
            effect.properties.complete = true;
        }
        else if (typeof(effect.remove) !== "undefined") {
            // @TODO: hide sprite
            this.sprite.position(-1000, -1000);
            WCP.remove(this.sprite);
            this.isSpriteAdd = true;
            effect.properties.complete = true;
        }
        else if (typeof(effect.execute) !== "undefined") {
            effect.execute();
            effect.properties.complete = true;
        }
        else if (typeof(effect.sound) !== "undefined") {
            this.soundManager.get(effect.sound).play();
            effect.properties.complete = true;
        }
        else if (typeof(effect.clear) !== "undefined") {
			for (var cur = 0; cur < this.curBundle; cur++) {
				this.bundles.shift();
			}
            effect.properties.complete = true;
        }
        else if (typeof(effect.repeat) !== "undefined") {
            if (effect.repeat !== 0) {
                for (var i = 0; i < this.bundles.length; i++) {
                    for (var j = 0; j < this.bundles[i].length; j++) {
                        this.bundles[i][j].properties.complete = false;
                        this.bundles[i][j].properties.next = false;
                    }
                }
            }
            if (effect.repeat > 0) {
                this.curBundle = -1;
                this.startTime = 0;
                effect.repeat--;
            }
            else if (effect.repeat < 0) {
                this.curBundle = -1;
                this.startTime = 0;
            }
            effect.properties.complete = ((effect.repeat === 0) ? true : false);
            effect.properties.next = true;
        }
        else {
            var delta = this.getDelta(effect);
            
            // Explore effect and update values
            for (var k in effect) {
                // properties musn't be use here
                if (effect.hasOwnProperty(k) && k !== 'properties') {
                    // x & y are subject to shift
                    if (k !== 'x' && k !== 'y') {
                        this.sprite[k] = this.spriteOrigin[k] + delta.percent * (effect[k] - this.spriteOrigin[k]);
                    }
                }
            }
            
            // @TODO: Possible optimisation
            var x = ((typeof(effect.x) !== 'undefined') ? effect.x : this.spriteOrigin.x);
            var y = ((typeof(effect.y) !== 'undefined') ? effect.y : this.spriteOrigin.y);
            if (x !== this.spriteOrigin.x || y !== this.spriteOrigin.y) {
                // @TODO: Is that good to change directly the position?
                var newPosition = effect.properties.shift.calculate(this.spriteOrigin.x, this.spriteOrigin.y, x, y, delta.percent);
                // @TODO: FOR circle console.log("OX:", this.spriteOrigin.x, "OY", this.spriteOrigin.y, "X:", x, "Y:", y, "NX:", newPosition.x, "NY:", newPosition.y);
                this.sprite.x = newPosition.x;
                this.sprite.y = newPosition.y;
            }
            
            if (delta.finish === true) {
                effect.properties.complete = true;
            }
        }
    };
    
	/**
	 * Method to create a bundle in order to move the sprite to x and y.
	 */
    Animation.prototype.move = function (x, y) {
        var bundle = [];
        bundle.push({x: x, y: y});
        this.addBundle(bundle);
        return (this);
    };
    
	/**
	 * Method to create a bundle in order to set the slice position of the sprite.
	 */
    Animation.prototype.setSlice = function (x, y, width, height) {
        var bundle = [];
        bundle.push({sliceX: x, sliceY: y, width: width, height: height, sliceWidth: width, sliceHeight: height});
        this.addBundle(bundle);
        return (this);
    };

	/**
	 * Method to create a bundle in order to wait a given number of frames.
	 */
    Animation.prototype.wait = function (frames) {
        var bundle = [];
        bundle.push({frames: frames});
        this.addBundle(bundle);
        return (this);
    };

	/**
	 * Method to create a bundle in order to wait a given number of milliseconds.
	 */
    Animation.prototype.waitTime = function (time) {
        var bundle = [];
        bundle.push({time: time});
        this.addBundle(bundle);
        return (this);
    };

	/**
	 * Method to create a bundle in order to clear the sprite from the screen
	 *   and remove it from the WCP object.
	 */
    Animation.prototype.remove = function () {
        var bundle = [];
        bundle.push({remove: true});
        this.addBundle(bundle);
    };

	/**
	 * Method to create a bundle in order to repeat the effect. If time is 
	 *   negative the animation is repeat infinitely, if not it represent the
	 *   number of repetition.
	 */
    Animation.prototype.repeat = function (time) {
        var bundle = [];
        bundle.push({repeat: (typeof(time) !== "undefined" ? time : -1)});
        this.addBundle(bundle);
        return (this);
    };
    
	/**
	 * Method to create a bundle in order to lunch another animation.
	 */
    Animation.prototype.startAnimation = function (animation) {
        var bundle = [];
        bundle.push({animation: animation});
        this.addBundle(bundle);
        return (this);
    };
    
	/**
	 * Method to create a bundle in order to execute a function.
	 */
    Animation.prototype.execute = function (f) {
        var bundle = [];
        bundle.push({execute: f});
        this.addBundle(bundle);
        return (this);
    };
    
	/**
	 * Method to create a bundle in order to play a sound
	 */
    Animation.prototype.sound = function (sound) {
        var bundle = [];
        bundle.push({sound: sound});
        this.addBundle(bundle);
        return (this);
    };
    
	/**
	 * Method to create a bundle in order to pause a sound.
	 */
    Animation.prototype.pauseSound = function (sound) {
        var bundle = [];
        bundle.push({pauseSound: sound});
        this.addBundle(bundle);
        return (this);
    };

	/**
	 * Method to create a bundle in order to clear the animation.
	 * Call clean but during the animation.
	 */
    Animation.prototype.clear = function () {
        var bundle = [];
        bundle.push({clear: true});
        this.addBundle(bundle);
        return (this);
    };
    
	/**
	 * Remove all the bundles and effect and reset the time of the animation.
	 */
    Animation.prototype.clean = function () {
        this.bundles = [];
        this.curBundle = 0;
        this.lastBundle = -1;
        this.spriteOrigin = null;
        this.startTime = -1;
        this.time = 0;
    };
    
	/**
	 * Add x and y to the coordinates of the sprite.
	 */
    Animation.prototype.offset = function (x, y) {
        this.sprite.x += x;
        this.sprite.y += y;
        for (var bundle in this.bundles) {
            for (var effect in this.bundles[bundle]) {
                if (typeof(this.bundles[bundle][effect].x) !== "undefined") {
                    this.bundles[bundle][effect].x += x;
                }
                if (typeof(this.bundles[bundle][effect].y) !== "undefined") {
                    this.bundles[bundle][effect].y += y;
                }
            }
        }
    };
    
	/**
	 * Method that return a clone object of the animation.
	 * The user must precise a new sprite in order to avoid conflict.
	 */
    Animation.prototype.clone = function (newSprite) {
        WCP.add(newSprite);
        var o = new Animation(newSprite);
        
        for (var i in this) {
            if (this.hasOwnProperty(i) && i !== "animateId" && i !== "bundles" && i !== "sprite") {
                o[i] = this[i];
            }
        }
        
        // @TODO: opti
        for (var bundle in this.bundles) {
            var newBundle = [];
            for (var effect in this.bundles[bundle]) {
                var newEffect = {};
                for (var j in this.bundles[bundle][effect]) {
                    if (j === "properties") {
                        var newProperties = {};
                        for (var k in this.bundles[bundle][effect][j]) {
                            newProperties[k] = this.bundles[bundle][effect][j][k];
                        }
                        newEffect[j] = newProperties;
                    }
                    else {
                        newEffect[j] = this.bundles[bundle][effect][j];
                    }
                }
                newBundle.push(newEffect);
            }
            o.bundles.push(newBundle);
        }
        return (o);
    };
    
    /**
     * Shift
     */

	/**
	 * Function use to calculate the interpolation of a circle.
	 */
	function shiftCircle(fx, fy, tx, ty, percent, semi, clockwise) {
        var centerX = (fx + tx) / 2;
        var centerY = (fy + ty) / 2;

        var h = centerY - fy;
        var w = fx - centerX;

        var dist = Math.sqrt(h * h + w * w);

        var initAngle = 0;
        if (w === 0) {
            if (h > 0) {
                initAngle = - Math.PI / 2;
            }
            else {
                initAngle = Math.PI / 2;
            }
        }
        else {
            var atan = Math.atan(h / Math.abs(w));
            if (w > 0) {
                initAngle = atan;
            }
            else {
                initAngle = Math.PI - atan;
            }
        }
        
        var addAngle = 0;
        if (clockwise) {
            addAngle = 1 * semi * percent * Math.PI;
        }
        else {
            addAngle = -1 * semi * percent * Math.PI;
        }
            
        var angle = initAngle + addAngle;

        var current = {};
        
        current.x = Math.floor(centerX + dist * Math.cos(angle));
        current.y = Math.floor(centerY + dist * Math.sin(angle));

        return (current);
    }
    
	/**
	 * Shift is an array that contain several function that modify the motion
	 *   direction of the animation.
	 */
	var Shift = {
        line: {
            calculate: function (fx, fy, tx, ty, percent) {
                var current = {};
                current.x = fx + percent * (tx - fx);
                current.y = fy + percent * (ty - fy);
                return (current);
            }
        },
        circle: {
            calculate: function (fx, fy, tx, ty, percent) {
                return (shiftCircle(fx, fy, tx, ty, percent, 1, 2));
            }
        },
        circleReverse: {
            calculate: function (fx, fy, tx, ty, percent) {
                return (shiftCircle(fx, fy, tx, ty, percent, -1, 2));
            }
        },
        semiCircle: {
            calculate: function (fx, fy, tx, ty, percent) {
                return (shiftCircle(fx, fy, tx, ty, percent, 1, 1));
            }
        },
        semiCircleReverse: {
            calculate: function (fx, fy, tx, ty, percent) {
                return (shiftCircle(fx, fy, tx, ty, percent, -1, 1));
            }
        }
    };
    
    /**
     * Ease is an array that contains function which modify the progress of the
	 *   animation.
     */
    var Ease = {
        none: {
            calculate: function (percent) {
                return (percent);
            }
        },
        parabolic: {
            calculate: function (percent) {
                return (percent * percent);
            }
        },
        parabolicReverse: {
            calculate: function (percent) {
                return (1 - ((percent - 1) * (percent - 1)));
            }
        }
    };
    
    /**
     * Duration Type
     */
    var durationType = {
        NONE: 1,
        FRAMES: 2,
        TIME: 3
    };
    
    WCP.Clip = Clip;
    WCP.TimeLine = TimeLine;
    WCP.Animation = Animation;
    WCP.Ease = Ease;
    WCP.Shift = Shift;
})(WCP);
