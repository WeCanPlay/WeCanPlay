/*
 *  WeCanPlay : Library for html5 games
 *  http://www.wecanplay.fr/
 *  WCP.events : event management provider
 *
 *  @author: Thomas FLORELLI, EPRON Marc
 */

(function (WCP) {
    "use strict";
    
    function Callback(action, key) {
        this.callback = action;
		this.parse(key);
    }
	
	Callback.prototype.parse = function (key) {
        if (typeof key === 'string' && key !== 'undefined') {
            var keys = key.split('|');
            this.keys = {};
            for (var i in keys) {
                this.keys[i] = keys[i];
            }
        }
	};
    
    /**
     * Event object contains the callbacks related to a specific type of event
     *
     */
    function Event() {
        this.callbacks = [];
    }
    
    Event.keyCodes = {
        8: "back_tab",
        9: "tab",
        13: "enter",
        16: "shift",
        17: "ctrl",
		18: "alt",
        20: "capslock",
        27: "escape",
        32: "space",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        48: "0",
        49: "1",
        50: "2",
        51: "3",
        52: "4",
        53: "5",
        54: "6",
        55: "7",
        56: "8",
        57: "9",
        65: "a",
        66: "b",
        67: "c",
        68: "d",
        69: "e",
        70: "f",
        71: "g",
        72: "h",
        73: "i",
        74: "j",
        75: "k",
        76: "l",
        77: "m",
        78: "n",
        79: "o",
        80: "p",
        81: "q",
        82: "r",
        83: "s",
        84: "t",
        85: "u",
        86: "v",
        87: "w",
        88: "x",
        89: "y",
        90: "z"
    };
    
    Event.keyCode = function (key) {
        for (var i in Event.keyCodes) {
            if (Event.keyCodes[i] === key) {
                return i;
            }
        }
        return -1;
    };
    /**
     * CustomEvent object
     * Contains and manage an event and its callbacks
     * @param type, type of the event
     * @param event (optional) event must be an Event object. If specified, will be stored instead of creating a new Event.
     *
     */
    
    function CustomEvent(type, event) {
        if (event) {
            if (typeof event === "Object") {
                this.event = event;
            } else {
                this.event = new Event();
            }
        } else {
            this.event = new Event();
        }
        this.type = type;
    }
        
    /**
     * Alternative to event.type = newType
     *
     * @param newType is the new name of the CustomEvent
     */
    CustomEvent.prototype.rename = function (newType) {
        this.type = newType;
    };
    
    
    /**
     * Attaches the given action to the event
     *
     * @param action callback function to execute when the event is fired
     */
    CustomEvent.prototype.subscribe = function (action) {
		this.event.callbacks.push(new Callback(action));
	};

    CustomEvent.prototype.on = function (action) {
		this.subscribe(action);
    };
    /**
     * Removes the given action from the event
     *
     * @param action callback to remove, if not given, all callbacks are removed
     */
    CustomEvent.prototype.unsubscribe = function (action) {
        var found = false;
        for (var i in this.event.callbacks) {
			if (this.event.callbacks[i].callback) {
				if (this.event.callbacks[i].callback === action || !action) {
					delete this.event.callbacks[i];
					found = true;
				}
			}
        }
        return (found);
    };
        
    /**
     * Executes all the event's callbacks.
     *
     * @param params (optional) use params as parameters when calling the functions
     */
    CustomEvent.prototype.fire = function (params) {
        if (params) {
            for (var i in this.event.callbacks) {
				if (this.event.callbacks[i].callback) {
					this.event.callbacks[i].callback(params);
				}
            }
        } else {
            for (var i in this.event.callbacks) {
				if (this.event.callbacks[i].callback) {
					this.event.callbacks[i].callback();
				}
            }
        }
    };
    
	/**
	 * ComboManager
	 *
	 */
	 
	function ComboManager() {
		this.combos = {};
        this.keys = {};
		this.sequenceEntry = [];
		this.matchingSequences = {};
		this.sequenceToCall = 0;
		this._default = {
			interval_timeout: 500,
			ordered: true
		};
	}
	 
	ComboManager.prototype.addSequence = function (keys, sequence) {
        if (typeof sequence === "object") {
            sequence.sequence = true
        }
        this.add(keys, sequence);
	};

	ComboManager.prototype.add = function (keys, combo) {
		if (this.combos[keys]) {
			for (var j in combo) {
				this.combos[keys][j] = combo[j];
			}
		} else {
			this.combos[keys] = {};
			this.combos[keys] = WCP.Tools.cloneObject(this._default);
			WCP.Tools.extend(this.combos[keys], combo);
			if (!this.combos[keys].total_timeout) {
				this.combos[keys].total_timeout = this.combos[keys].interval_timeout * keys.split(' ').length;
			}
		}
	};
    
    ComboManager.prototype.addKey = function(key, obj) {
		if (this.keys[key]) {
			for (var j in obj) {
				this.keys[key][j] = obj[j];
			}
		} else {
			this.keys[key] = {};
			this.keys[key] = WCP.Tools.cloneObject(this._default);
			WCP.Tools.extend(this.keys[key], obj);
		}
    }

	ComboManager.prototype.getCombos = function () {
		var sequences = {};
		for (var c in this.combos) {
			if (this.combos[c].sequence === false) {
				sequences[c] = this.combos[c];
			}
		}
		return sequences;
	};

	ComboManager.prototype.getSequences = function () {
		var sequences = {};
		for (var c in this.combos) {
			if (this.combos[c].sequence === true) {
				sequences[c] = this.combos[c];
			}
		}
		return sequences;
	};

	ComboManager.prototype.getSequencesCopy = function () {
		var sequences = {};
		for (var c in this.combos) {
			if (this.combos[c].sequence === true) {
				sequences[c] = WCP.Tools.cloneObject(this.combos[c]);
			}
		}
		return sequences;
	};

	ComboManager.prototype.arrayCmp = function (firstArray, secondArray) {
		if (firstArray.length !== secondArray.length) {
			return false;
		}
		for (var a1 in firstArray) {
			var keyExists = false;
			for (var a2 in secondArray) {
				if (secondArray[a2] === firstArray[a1]) {
					keyExists = true;
					break;
				}
			}
			if (!keyExists) {
				return false;
			}
		}
		return true;
	};
	
	ComboManager.prototype.arrayCmpOrdered = function (firstArray, secondArray) {
		if (firstArray.length !== secondArray.length) {
			return false;
		}
		for (var a in firstArray) {
			if (firstArray[a] !== secondArray[a]) {
				return false;
			}
		}
		return true;
	};
		
	ComboManager.prototype.update = function (key) {
		// A key has been pushed, we have to cancel all the current flushing and sequence calling procedures
		// And add the new key to the sequenceEntry
		clearTimeout();
		this.sequenceToCall = 0;
		if (WCP.Tools._length(this.matchingSequences) === 0 && this.sequenceEntry.length === 0) {
			this.matchingSequences = this.getSequencesCopy();
			this.sequenceEntry.length = 0;
		}
		this.sequenceEntry.push(key);
		var timeout = 0;
		for (var s in this.matchingSequences) {
			// Keys string splitting
			var splitted = s.split(' ');
			if (splitted[this.sequenceEntry.length - 1] === this.sequenceEntry[this.sequenceEntry.length - 1].key) {
				if (this.sequenceEntry.length >= 2) {
					if (this.sequenceEntry[this.sequenceEntry.length - 1].age - this.sequenceEntry[this.sequenceEntry.length - 2].age > this.matchingSequences[s].interval_timeout) {
						// If the time since the last pressed key is longer than our actual sequence's timeout, BYEBYE
						delete this.matchingSequences[s];
						continue;
					}
				}
				// Getting the max interval_timeout for the entry sequence cancelling
				if (this.matchingSequences[s].interval_timeout > timeout) {
					timeout = this.matchingSequences[s].interval_timeout;
				}
				if (splitted.length === this.sequenceEntry.length) {
					// The sequence is valid.
					// Store its keydown function for a later use
					if (this.matchingSequences[s].keydown) {
						this.sequenceToCall = this.matchingSequences[s].keydown;
						delete this.matchingSequences[s];
					}
				}
			} else {
			// No match anymore. You're out.
				delete this.matchingSequences[s];
			}
		}
		// How much matching sequences do we have ?
		if (WCP.Tools._length(this.matchingSequences) === 0) {
		// 0 ? fak. Start another sequence
			if (this.sequenceToCall) {
				//No risk of conflict with another matching sequence because NO OTHER MATCHING SEQUENCE
				this.sequenceToCall();
				this.sequenceToCall = 0;
			}
			if (this.sequenceEntry.length > 1) {
				this.sequenceEntry.length = 0;
				this.update(key);
			} else {
				this.sequenceEntry.length = 0;
			}
		} else {
		// More than 0 ? GUD
			// Got to cancel the current sequence entry flushing procedure
			var that = this;
			// Engage a new flushing procedure

			setTimeout(function (that) {
				return function () {
					// Trigger the last valid sequence keydown function
					if (that.sequenceToCall) {
						that.sequenceToCall();
						that.sequenceToCall = 0;
					}
					that.sequenceEntry.length = 0;
					that.matchingSequences = {};
				}
			}(this), timeout);
		}
	};

	ComboManager.prototype.getMatchingCombos = function (combos, keys) {
		var validCombos = {};

		for (var c in combos) {
			if (typeof combos[c] !== "object") {
				continue;
			}
			var splitted = c.split(' ');
			if (combos[c].ordered) {
				if (this.arrayCmpOrdered(splitted, keys)) {
					validCombos[c] = combos[c];
				}
			} else {
				if (this.arrayCmp(splitted, keys)) {
					validCombos[c] = combos[c];
				}
			}
		}
		return validCombos;
	};
		
	ComboManager.prototype.find = function (criterias, callback) {
		if (criterias.type === 'combo') {
			var combos = this.getCombos();
			if (!criterias.keys) {
				callback(combos);
			}
			callback(this.getMatchingCombos(combos, criterias.keys));
		}
		if (criterias.type === 'sequence') {
			var sequences = this.getSequences();
			callback(sequences);
		}
	};
    
    ComboManager.prototype.triggerKeydown = function (key, event) {
        if (this.keys[key] && this.keys[key].keydown) {
            this.keys[key].keydown(event);
        }
    }

    ComboManager.prototype.triggerKeyup = function (key, event) {
        if (this.keys[key] && this.keys[key].keyup) {
            this.keys[key].keyup(event);
        }
    }

    /**
     * EventTarget
     * Manages standard events and custom events on a DOM element (by default WCP.canvas)
     *
     */
    
    function EventTarget() {
    }

    /**
     * Extends the given class with EventTarget methods and attributes
     * Allows to use any class as an event manager.
     * The objects instancied from the classes extended by EventTarget have to use listen()
       in order to activate the event listeners and initialize the attributes.
     * @see EventTarget.listen()
     * @param targetClass, the class to extend
     *
     */

    EventTarget.extend = function (targetClass) {
        targetClass.prototype.initEvents = EventTarget.prototype.initEvents;
        targetClass.prototype.initCurrentEvent = EventTarget.prototype.initCurrentEvent;
        targetClass.prototype.initMobileEvent = EventTarget.prototype.initMobileEvent;
        targetClass.prototype.currentEvent = EventTarget.prototype.currentEvent;
        targetClass.prototype.listen = EventTarget.prototype.listen;
        targetClass.prototype.handleEvents = EventTarget.prototype.handleEvents;
        targetClass.prototype.custom = EventTarget.prototype.custom;
        targetClass.prototype.getEvent = EventTarget.prototype.getEvent;
        targetClass.prototype.register = EventTarget.prototype.register;
        targetClass.prototype.addDrawableController = EventTarget.prototype.addDrawableController;
        targetClass.prototype.subscribe = EventTarget.prototype.subscribe;
        targetClass.prototype.unsubscribe = EventTarget.prototype.unsubscribe;
        targetClass.prototype.on = EventTarget.prototype.on;
        targetClass.prototype.off = EventTarget.prototype.off;
        targetClass.prototype.fire = EventTarget.prototype.fire;
        targetClass.prototype.parseEvent = EventTarget.prototype.parseEvent;
        targetClass.prototype.combo = EventTarget.prototype.combo;
        targetClass.prototype.advancedCombo = EventTarget.prototype.advancedCombo;
        targetClass.prototype.sequence = EventTarget.prototype.sequence;
        targetClass.prototype.advancedSequence = EventTarget.prototype.advancedSequence;
        targetClass.prototype.keydown = EventTarget.prototype.keydown;
		targetClass.prototype.keyup = EventTarget.prototype.keyup;
		var target = new targetClass();
		target.listen();
		return target;
	};
    
    
    /**
     * Extends the given object with EventTarget methods and attributes
     * Allows to use any class as an event manager.
     * The objects  by EventTarget have to use listen()
       in order to activate the event listeners and initialize the attributes.
     * @see EventTarget.listen()
     * @param targetObject, the object to extend
     * (WCP is extended with EventTarget.extendObject)
     */

    EventTarget.extendObject = function (targetObject) {
        targetObject.initEvents = EventTarget.prototype.initEvents;
        targetObject.initCurrentEvent = EventTarget.prototype.initCurrentEvent;
        targetObject.initMobileEvent = EventTarget.prototype.initMobileEvent;
        targetObject.currentEvent = EventTarget.prototype.currentEvent;
        targetObject.listen = EventTarget.prototype.listen;
        targetObject.handleEvents = EventTarget.prototype.handleEvents;
        targetObject.custom = EventTarget.prototype.custom;
        targetObject.getEvent = EventTarget.prototype.getEvent;
        targetObject.register = EventTarget.prototype.register;
        targetObject.addDrawableController = EventTarget.prototype.addDrawableController;
        targetObject.subscribe = EventTarget.prototype.subscribe;
        targetObject.unsubscribe = EventTarget.prototype.unsubscribe;
        targetObject.on = EventTarget.prototype.on;
        targetObject.off = EventTarget.prototype.off;
        targetObject.fire = EventTarget.prototype.fire;
        targetObject.parseEvent = EventTarget.prototype.parseEvent;
        targetObject.combo = EventTarget.prototype.combo;
        targetObject.advancedCombo = EventTarget.prototype.advancedCombo;
        targetObject.sequence = EventTarget.prototype.sequence;
        targetObject.advancedSequence = EventTarget.prototype.advancedSequence;
        targetObject.keydown = EventTarget.prototype.keydown;
        targetObject.keyup = EventTarget.prototype.keyup;
		
		targetObject.initEvents();
		if (!WCP.canvas) {
			targetObject.custom("canvasReady");
			targetObject.on("canvasReady", function(that) {
				return function () {
					that.listen();
				};
			}(targetObject));
		} else {
			targetObject.listen();
		}
	};
    
    
    EventTarget.prototype.initEvents = function () {
		if (!this.events) {
			this.events = {};
		}
        if (!this.events._events) {
            this.events._events = [];
        }
    };
	
	EventTarget.prototype.initMobileEvent = function() {
		this.on("mousedown", function (that) {
			return function(evt) {
				that.events._lastEvent = evt;
			}
		}(this));

		this.on("mouseup", function (that) {
			return function(evt) {
				checkSwipe(that.events._lastEvent, evt, that);
			}
		}(this));
	};
	
	function checkDirection(lx, ly, x, y) {
		var xD, yD;
		xD = Math.abs(lx - x);
		yD = Math.abs(ly - y);
		if (xD >= yD) {
			if (lx - x > 0) {
				return("Left");
			} else {
				return("Right");
			}
		} else {
			if (ly - y > 0) {
				return("Up");
			} else {
				return("Down");
			}
		}	
	};
	
	function checkSwipe(lastEvt, evt, that) {
		var direction = checkDirection(lastEvt.clientX, lastEvt.clientY, evt.clientX, evt.clientY);
		var mvh = Math.abs(lastEvt.clientX - evt.clientX) > 30;
		var mvv = Math.abs(lastEvt.clientY - evt.clientY) > 30;
		if (mvh && (direction === "Left" || direction === "Right"))
			that.fire('swipe', direction);
		if (mvv && (direction === "Up" || direction === "Down"))
			that.fire('swipe', direction);
	};
	
    EventTarget.prototype.initCurrentEvent = function (param) {
		if (!this.events) {
			this.events = {};
		}
		this.events.currentEvent = param;
    };
    
    /**
     * Activates standard listeners on the given DOM element
     * Initializes the managable events
     * This method must be called before to try ANY management of ANY event.
     * This method MUST be called before to try any management of any event.
     * @param element (optional), the element to listen. If not given, WCP.canvas will be used by default
     */
    EventTarget.prototype.listen = function (element) {
		this.events = {};
        this.initEvents();
		this.events._keysdown = [];
        this.events._drawables = [];
		this.events._time = new Date();
		this.events._time.setTime(this.events._time.getTime());
		this.events._timeScheduler = new WCP.TimeScheduler();
		this.events._combos = new ComboManager();
        var domElement = element ? element : WCP.canvas;
        if (!domElement) {
            return;
        }
        
		var eventNames = {
			// Creating listeners
			// ---> PC <---
						
			"mouseover": true,
			"mouseout": true,
			"mousemove": true,
			"mousedown": true,
			"mouseup": true,
			"click": true,
			"dblclick": true,
			"keydown": true,
			"keypress": true,
			"keyup": true,
			
			// ---> MOBILE <---
			
			"touchstart": true,
			"touchmove": true,
			"touchend": true,
			"touchcancel": true,
			"drag": true,
			"dragstart": true,
			"dragmove": true,
			"dragend": true,
			"gesturestart": true,
			"gestureend": true,
			"gesturechange": true,
			
			// Scroll
			"scrollstart": true,
			"scrollstop": true,
			
			// Is triggered during a rotation gesture (two fingers rotating clockwise or counterclockwise).
			"rotate": true,
			"rotatecw": true,
			"rotateccw": true,
			
			// Is triggered during a pinch gesture (two fingers moving away from or towards each other).
			"pinch": true,
			"pinchopen": true,
			"pinchclose": true,
			
			
			// Triggers when a device orientation changes (by turning it vertically or horizontally).
			"orientationchange": true,
			
			// Mobile Tap --> Triggers after a quick, complete touch event.
			"tap": true,
			"taphold": true,
			"tapone": true,
			"taptwo": true,
			"tapthree": true,
			"dbltap": true,
			
			// Mobile Swipe --> Triggers when a horizontal drag of 30px or more (and less than 20px vertically) occurs within 1 second duration.
			"swipe": true,
			"swipemove": true,
			"swipeone": true,
			"swipetwo": true,
			"swipethree": true,
			"swipefour": true,
			"swipeup": true,
			"swiperightup": true,
			"swiperight": true,
			"swiperightdown": true,
			"swipedown": true,
			"swipeleftdown": true,
			"swipeleft": true,
			"swipeleftup": true
		};
		
		for (var i in eventNames) {
			this.events._events.push(new CustomEvent(i));
			domElement.addEventListener(i, function (that) {
				return function (evt) {
					that.handleEvents(evt);
				};
			}(this), false);
		}
		

		
		// listening canvas standard events


        window.addEventListener("keydown", function (that) {
                                return function (evt) {
                                    that.handleEvents(evt);
                                };
                            }(this));
        window.addEventListener("keyup", function (that) {
                                return function (evt) {
                                    that.handleEvents(evt);
                                };
                            }(this));
	};
  
    /**
     * Manages events triggering
     * Fires the triggering event using the standard event object as parameter
     * @private
    */

    EventTarget.prototype.handleEvents = function (evt) {
        if (typeof(this.events.currentEvent) !== 'undefined') {
            this.currentEvent(evt);
        }
		if (evt.type === "keydown") {
            this.events._combos.triggerKeydown(Event.keyCodes[evt.keyCode], evt);
			this.events._combos.update({key: Event.keyCodes[evt.keyCode], age: WCP.millitime() % 10000});
			if (this.events._keysdown.indexOf(Event.keyCodes[evt.keyCode]) === -1) {
				this.events._keysdown.push(Event.keyCodes[evt.keyCode]);
				this.events._combos.find({keys: this.events._keysdown, type: 'combo'}, function (combos) {
					for (var c in combos) {
						if (combos[c].keydown) {
							combos[c].keydown(evt);
						}
					}
				});
			}
		} else if (evt.type === "keyup") {
            this.events._combos.triggerKeyup(Event.keyCodes[evt.keyCode], evt);
			this.events._combos.find({keys: this.events._keysdown, type: 'combo'}, function (combos) {
				for (var c in combos) {
					if (combos[c].keyup) {
						combos[c].keyup(evt);
					}
				}
			});
			if (this.events._keysdown.indexOf(Event.keyCodes[evt.keyCode]) !== -1) {
				this.events._keysdown.splice(this.events._keysdown.indexOf(Event.keyCodes[evt.keyCode]), 1);
			}
		} else if (evt.type === "mousedown") {
            this.fire(evt.type, evt);
            for (var d in this.events._drawables) {
            var drawable = this.events._drawables[d];
                if (drawable.isPointInPath(evt.clientX, evt.clientY)) {
                    if (drawable._callbacks.mousedown) {
                        drawable._callbacks.mousedown(evt);
                    }
                }
            }
        } else {
			this.fire(evt.type, evt);
		}
    };

	EventTarget.prototype.keydown = function (key, action) {
		var combo = {
			keydown : action,
			sequence: false
		};
		this.events._combos.addKey(key, combo);
	};
	
	EventTarget.prototype.keyup = function (key, action) {
		var combo = {
			keyup : action,
			sequence: false
		};
		this.events._combos.addKey(key, combo);
	};
	
	EventTarget.prototype.combo = function (keys, action) {
		var combo = {
			keydown : action,
			sequence: false,
			ordered: true
		};
		this.events._combos.add(keys, combo);
	};
	
	EventTarget.prototype.sequence = function (keys, action) {
		var combo = {
			keydown : action,
			sequence: true
		};
		this.events._combos.add(keys, combo);
	};
	EventTarget.prototype.advancedCombo = function (combos) {
		for (var combo in combos) {
			this.events._combos.add(combo, combos[combo]);
		}
	};
	EventTarget.prototype.advancedSequence = function (sequences) {
		for (var sequence in sequences) {
			this.events._combos.addSequence(sequence, sequences[sequence]);
		}
	};
	
    /**
     * Returns the asked event, if event is an object, returns event.
     * @private
     * @param event is the event type or a CustomEvent object
     * @returns the required event
    */
    EventTarget.prototype.getEvent = function (event) {
        if (typeof event === "object") {
            return (event);
        } else {
            for (var i in this.events._events) {
                if (this.events._events[i].type === event) {
                    return this.events._events[i];
                }
            }
        }
    };
    
    /**
     * Store the management methods in given class's prototype allowing any instance of this class to manage the events of this event manager.
     * @param myClass is the class to register
    */
    EventTarget.prototype.register = function (myClass) {
        myClass.prototype.subscribe = function (that) {
            return function (event, action) {
                that.on(event, action);
            };
        }(this);
        myClass.prototype.on = function (event, action) {
            this.subscribe(event, action);
        };
        myClass.prototype.unsubscribe = function (that) {
            return function (event, action) {
                that.unsubscribe(event, action);
            };
        }(this);
        myClass.prototype.off = function (event, action) {
            this.unsubscribe(event, action);
        };
        myClass.prototype.custom = function (that) {
            return function (customId) {
                that.custom(customId);
            };
        }(this);
        myClass.prototype.keydown = function (that) {
            return function (key, action) {
                that.keydown(key, action);
            };
        }(this);
        myClass.prototype.keyup = function (that) {
            return function (key, action) {
                that.keyup(key, action);
            };
        }(this);
        myClass.prototype.sequence = function (that) {
            return function (keys, action) {
                that.sequence(keys, action);
            };
        }(this);
        myClass.prototype.combo = function (that) {
            return function (keys, action) {
                that.combo(keys, action);
            };
        }(this);
        myClass.prototype.advancedSequence = function (that) {
            return function (sequences) {
                that.advancedSequences(sequences);
            };
        }(this);
        myClass.prototype.advancedCombo = function (that) {
            return function (combos) {
                that.advancedCombo(combos);
            };
        }(this);
        myClass.prototype.fire = function (that) {
            return function (event, params) {
                that.fire(event, params);
            };
        }(this);
    }
    
    
    EventTarget.prototype.addDrawableController = function (drawable) {
        if (!drawable.isPointInPath) {
            throw new Error("You must implement the method isPointInPath in the object to register");
            return -1;
        }
        drawable._drawableId = this.events._drawables.length;
        drawable._callbacks = {
            mousemove : 0,
            mouseover : 0,
            mousedown : 0,
            mouseup : 0,
            click : 0
        }        
        drawable.on = function(that) {
            return function(evtName, action) {
                this.evtName(action);
            }
        }(this);
        drawable.mousedown = function(that) {
            return function(action) {
                this._callbacks.mousedown = action;
            }
        }(this);
        drawable.mousemove = function(that) {
            return function(action) {
                this._callbacks.mousemove = action;                
            }
        }(this);
        drawable.mouseover = function(that) {
            return function(action) {
                this._callbacks.mouseover = action;                
            }
        }(this);
        drawable.mouseup = function(that) {
            return function(evtName, action) {
                this._callbacks.mouseup = action;                
            }
        }(this);
        drawable.click = function(that) {
            return function(action) {
                this._callbacks.mousedown = action;      
            }
        }(this);        
        this.events._drawables.push(drawable);      
        return (this.events._drawables.length -1);
    };
    
    /**
    * Creates and store a custom event
    * @param customId, the type/name of the event
    * @returns CustomEvent object
    */
    
    EventTarget.prototype.custom = function (customId, override) {
        var evt = this.getEvent(customId);
        if (evt && override === true) {
            this.unsubscribe(customId);
        } else if (evt && !override) {
            return;
        }
        evt = new CustomEvent(customId);
        this.events._events.push(evt);
        return evt;
    };

    /**
    * Calls CustomEvent.subscribe of the given
    * @see CustomEvent.subscribe
    * @param event, the type/name of the event to subscribe
    * @param action, the action to add
    */
    EventTarget.prototype.on = function (event, action) {
        this.subscribe(event, action);
    };

    /**
    * Calls CustomEvent.subscribe
    * @see CustomEvent.subscribe
    * @param event, the type/name of the event to subscribe
    * @param action, the action to add
    */
    EventTarget.prototype.subscribe = function (event, action) {
		if (typeof event === "string") {
			this.parseEvent(event, action);
        } else if (typeof event === "object") {
			for (var e in event) {
				this.parseEvent(e, event[e]);
			}
		}
    };

    EventTarget.prototype.parseEvent = function (event, action) {
        var params = [];
        var evt = {};
		
		params = event.split(' ');
        evt = this.getEvent((params[0] !== undefined ? params[0] : event));
        if (evt) {
            evt.subscribe(action, (params.length === 2 ? params[1] : 0));
        }
	};
    
    /**
    * Calls CustomEvent.unsubscribe
    * @see CustomEvent.unsubscribe
    * @param event, the type/name of the event to subscribe
    *         if no event name is given, unsubscribe all callbacks for all events
    * @param action, the action to delete
    */

    EventTarget.prototype.unsubscribe = function (event, action) {
        var evt = this.getEvent(event);
        if (!event) {
            for (var i in this.events._events) {
                this.events._events[i].unsubscribe();
            }
        } else if (evt) {
            evt.unsubscribe(action);
        }
    };

	EventTarget.prototype.off = function (event, action) {
        this.unsubscribe(event, action);
    };
	
	function listEvent(evt, curEvt) {
		for (var i in curEvt) {
			if (typeof(evt[curEvt[i]]) !== "undefined") {
				document.getElementById("displayCE").innerHTML += evt[curEvt[i]] + ' ';
//				console.log(evt[curEvt[i]]);
			}
		}
	}
	
	EventTarget.prototype.currentEvent = function (evt) {
		var rect = WCP.canvas.getBoundingClientRect();
		var root = document.documentElement;
		var mouseX = evt.clientX - rect.top - root.scrollTop;
		var mouseY = evt.clientY - rect.left - root.scrollLeft;
		var displayCE = '';
		if (typeof(evt.clientX) !== "undefined" && typeof(evt.clientY !== "undefined")) {
			displayCE += ' - PosX = ' + mouseX + ' - PosY = ' + mouseY;
		}
		if (typeof(evt.keyCode) !== "undefined" && evt.keyCode !== 0) {
			displayCE += ' - Key = ' + evt.keyCode;
		}
		if (typeof(evt.buttons) !== "undefined" && evt.buttons !== 0) {
			displayCE += ' - Button = ' + evt.buttons;
		}
		if (typeof(this.events.currentEvent) === 'object') {
			listEvent(evt, this.events.currentEvent);
		} else if (this.events.currentEvent === false) {
			document.getElementById("displayCE").innerHTML += evt.type + displayCE;
			console.log(evt.type + displayCE);
		} else {
			if (typeof(evt.screenX) !== "undefined" && typeof(evt.screenY !== "undefined")) {
				displayCE += ' - ScreenX = ' + evt.screenX + ' - ScreenY = ' + evt.screenY;
			}
			if (typeof(evt.target) !== "undefined") {
				displayCE += ' - Target = ' + evt.target.localName;
			}
			document.getElementById("displayCE").innerHTML += evt.type + displayCE;
			console.log(evt);
		}
		document.getElementById("displayCE").innerHTML += '<br />';
		document.getElementById("displayCE").scrollTop = 10000;
    };

    /**
    * Calls CustomEvent.fire
    * @param event, the type/name of the event to subscribe
    * @param params, the parameters to send to the event's callbacks
    *
    * @see CustomEvent.fire
    */
    
    EventTarget.prototype.fire = function (event, params) {
        var evt = this.getEvent(event);
        if (evt) {
            evt.fire(params);
        }
    };
    
    /**
     * Symbol export
     */

     
    WCP.EventTarget = EventTarget;
    WCP.Event = Event;
    EventTarget.extendObject(WCP);
    
    // Here should be created the events needed in modules implementation
    WCP.initEvents();
    WCP.custom("canvasReady");
    
    
    var KEY_DOWN        = 40;
    var KEY_UP          = 38;
    var KEY_LEFT        = 37;
    var KEY_RIGHT       = 39;

    var KEY_END            = 35;
    var KEY_BEGIN        = 36;

    var KEY_BACK_TAB     = 8;
    var KEY_TAB            = 9;
    var KEY_SH_TAB      = 16;
    var KEY_ENTER        = 13;
    var KEY_ESC            = 27;
    var KEY_SPACE        = 32;
    var KEY_DEL            = 46;

    var KEY_A            = 65;
    var KEY_B            = 66;
    var KEY_C            = 67;
    var KEY_D            = 68;
    var KEY_E            = 69;
    var KEY_F            = 70;
    var KEY_G            = 71;
    var KEY_H            = 72;
    var KEY_I            = 73;
    var KEY_J            = 74;
    var KEY_K            = 75;
    var KEY_L            = 76;
    var KEY_M            = 77;
    var KEY_N            = 78;
    var KEY_O            = 79;
    var KEY_P            = 80;
    var KEY_Q            = 81;
    var KEY_R            = 82;
    var KEY_S            = 83;
    var KEY_T            = 84;
    var KEY_U            = 85;
    var KEY_V            = 86;
    var KEY_W            = 87;
    var KEY_X            = 88;
    var KEY_Y            = 89;
    var KEY_Z            = 90;

    var KEY_PF1            = 112;
    var KEY_PF2            = 113;
    var KEY_PF3            = 114;
    var KEY_PF4            = 115;
    var KEY_PF5            = 116;
    var KEY_PF6            = 117;
    var KEY_PF7            = 118;
    var KEY_PF8            = 119;
    
    var KEY_0            = 48;
    var KEY_1            = 49;
    var KEY_2            = 50;
    var KEY_3            = 51;
    var KEY_4            = 52;
    var KEY_5            = 53;
    var KEY_6            = 54;
    var KEY_7            = 55;
    var KEY_8            = 56;
    var KEY_9            = 57;

})(WCP);

