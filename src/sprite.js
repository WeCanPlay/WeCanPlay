/*
 *	WeCanPlay : Library for html5 games
 *	http://www.wecanplay.fr/
 *  WCP.sprite : manage Sprites
 *
 *	Author: Clement DEBIAUNE, Marc EPRON
 */

(function (WCP) {
    "use strict";
    
    var spriteId = 1;
    
    // private const
    var ORIGIN_TYPE_PX = 0;
    var ORIGIN_TYPE_RATIO = 1;
    
    function Sprite(image, x, y) {
        this.img = image;
        this.x = x || 0;
        this.y = y || 0;
        this.width = image.width;
        this.height = image.height;
        this.sliceX = 0;
        this.sliceY = 0;
        this.sliceWidth = this.width;
        this.sliceHeight = this.height;
        this.alpha = 1;
        this.id = spriteId++;
        this.originX = 0;
        this.originY = 0;
        this.originType = ORIGIN_TYPE_PX;
        this.rotation = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.matrix = [1, 0, 0, 1, 0, 0];
        this.symmetryX = this.symmetryY = false;
        this.animationsData = [];
        this.animation = new WCP.Animation(this);
        this.mainAnimation = null;
        
        // private property
        //this._zindex = 100;
        //this._parent = null;
    }

    Sprite.prototype = new WCP.Drawable();

    function SliceSprite(Image, x, y, width, height) {
        var s = new Sprite(Image, 0, 0);
        s.setSlice(x, y, width, height);
        return (s);
    }
    
    Sprite.prototype.clone = function (x, y) {
        var o = new WCP.Sprite(this.img, x, y);
        for (var i in this) {
            if ( this.hasOwnProperty(i) && i !== "id"
                 && this.hasOwnProperty(i) && i !== "x"
                 && this.hasOwnProperty(i) && i !== "y" ) {
                o[i] = this[i];
            }
        }
        return (o);
    };
    
    // Sprite.prototype.setZIndex = function (v) {
    //     if (v >= 9999) {
    //         v = 9999;
    //     }
        
    //     if (v < 0) {
    //         v = 0;
    //     }
        
    //     var old = this._zindex;
    //     this._zindex = v;
        
    //     if (this._parent) {
    //         this._parent._notifyZIndexChange(this, old, v);
    //     }
    // };
    
    // Sprite.prototype.getZIndex = function () {
    //     return (this._zindex);
    // };
    
    Sprite.prototype.setSubRect = function (rect) {
        this.sliceX = rect.x;
        this.sliceY = rect.y;
        this.sliceWidth = rect.width;
        this.sliceHeight = rect.height;
    };
    
    Sprite.prototype.setSlice = function (x, y, width, height) {
        this.width = width;
        this.height = height;
        this.sliceX = x;
        this.sliceY = y;
        this.sliceWidth = width;
        this.sliceHeight = height;
    };
    
    Sprite.prototype.draw = function (ctx) {
        ctx = ctx || WCP.ctx;
    
        ctx.save();
        ctx.globalAlpha = this.alpha;
        // console.log(this.img, this.sliceX, this.sliceY, this.sliceWidth,
        // this.sliceHeight, originX, originY, this.width, this.height);
    
        // translation
        
        var origX, origY;
        var width = this.width;/* * this.scaleX*/
        var height = this.height;/* * this.scaleY*/
    
        if (this.originType === ORIGIN_TYPE_PX) {
            origX = this.originX;
            origY = this.originY;
        } else {
            origX = (width * this.originX);
            origY = (height * this.originY);
        }
    
        var scaleX = (this.symmetryX === true ? -1 : 1);
        var scaleY = (this.symmetryY === true ? -1 : 1);
        if (scaleX === -1) {
            origX += this.width;
        }
        if (scaleY === -1) {
            origY += this.height;
        }
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(scaleX, scaleY);
    
        ctx.drawImage(this.img, this.sliceX, this.sliceY, this.sliceWidth,
                this.sliceHeight, -origX, -origY, width, height);
        ctx.restore();
    };
    
    Sprite.prototype.move = function (x, y) {
        this.x += x;
        this.y += y;
    };
    
    Sprite.prototype.position = function (x, y) {
        this.x = x;
        this.y = y;
    };
    
    Sprite.prototype.scale = function (x, y) {
        if (typeof y === 'undefined') {
            y = x;
        }
    
        this.scaleX = x;
        this.scaleY = y;
        this.width = this.sliceWidth * this.scaleX;
        this.height = this.sliceHeight * this.scaleY;
    };
    
    Sprite.prototype.symmetry = function (x, y) {
        this.symmetryX = x;
        this.symmetryY = y;
    };
    
    Sprite.prototype.vector = function () {
        return (new WCP.Vector(this.x, this.y));
    };
    
    Sprite.prototype.getPos = function () {
        return ({
            x: this.x,
            y: this.y
        });
    };
    
    Sprite.prototype.getRect = function () {
        return ({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });
    };
    
    Sprite.prototype.animations = function (animations) {
        this.animationsData = animations;
    };
    
	Sprite.prototype.addAnimation = function (animation) {
        for (var n in this.animationsData[animation]) {
            var slice = this.animationsData[animation][n];
            this.animation.setSlice(slice.x, slice.y, slice.width, slice.height);
            if (typeof(this.animationsData.frameRate) !== "undefined") {
                this.animation.wait(this.animationsData.frameRate);
            }
            else if (typeof(this.animationsData.timeRate) !== "undefined") {
                this.animation.waitTime(this.animationsData.timeRate);
            }
        }		
	};
	
    Sprite.prototype.setAnimation = function (animation, finish, finishFunction) {
        if (typeof(this.animationsData[animation]) === "undefined") {
            return;
        }
    
        this.animation.clean();
		this.addAnimation(animation);
		
		if (typeof(finish) === "number") {
			this.animation.repeat(finish - 1);
			this.animation.clear();
			if (typeof(finishFunction) === "function") {
				this.animation.execute(finishFunction);
				this.animation.clear();
			}
			if (this.mainAnimation !== null) {
				this.addAnimation(this.mainAnimation);
				this.animation.repeat();
			}
		}
		else {
			this.animation.repeat();
			this.mainAnimation = animation;
		}
        this.animation.start();
    };
    
    Sprite.prototype.setOrigin = function (ratioX, ratioY) {
        if (!ratioY && typeof ratioX[0] !== 'undefined') {
            this.originX = ratioX[0];
            this.originY = ratioX[1];
        } else {
            this.originX = ratioX;
            this.originY = ratioY;
        }
    
        this.originType = ORIGIN_TYPE_RATIO;
    };
    
    Sprite.prototype.setOriginPos = function (x, y) {
        this.originX = x;
        this.originY = y;
        this.originType = ORIGIN_TYPE_PX;
    };
    
    Sprite.ORIGIN_TOPLEFT = [0, 0];
    Sprite.ORIGIN_TOP = [0.5, 0];
    Sprite.ORIGIN_TOPRIGHT = [1, 0];
    Sprite.ORIGIN_LEFT = [0, 0.5];
    Sprite.ORIGIN_CENTER = [0.5, 0.5];
    Sprite.ORIGIN_RIGHT = [1, 0.5];
    Sprite.ORIGIN_BOTLEFT = [0, 1];
    Sprite.ORIGIN_BOT = [0.5, 1];
    Sprite.ORIGIN_BOTRIGHT = [1, 1];
    
    WCP.Sprite = Sprite;
    WCP.SliceSprite = SliceSprite;
})(WCP);
