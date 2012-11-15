/*
 *	WeCanPlay : Library for html5 games
 *	http://www.wecanplay.fr/
 *  WCP.draw : draw any kind of polygon
 *
 *	Author: Thomas FLORELLI
 */
 
(function (WCP) {
    "use strict";
    
    function Shape() {
    }
    
    Shape.prototype = new WCP.Drawable();
    
    Shape.prototype.buildPath = function(ctx) {
        throw new Error("You have to override the buildPath(ctx) method");
    }
        
	Shape.prototype.draw = function (ctx) {
        if (!ctx) {
            ctx = WCP.Draw.ctx
        }
        ctx.save();
        ctx.beginPath();
        this.buildPath(ctx);
        for (var opt in this.style) {
            ctx[opt.toString()] = this.style[opt];
        }
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
//		WCP.Draw.draw(this.style);
        ctx.restore();
	};

    Shape.prototype.isPointInPath = function (x, y, ctx) {
        if (!ctx) {
            ctx = WCP.Draw.ctx
        }        
        ctx.save();
        ctx.beginPath();
        this.buildPath(ctx);
        for (var opt in this.style) {
            ctx[opt.toString()] = this.style[opt];
        }
        ctx.fill();
        ctx.stroke();
        var pointInPath = ctx.isPointInPath(x,y);
        ctx.closePath();
        ctx.restore();
        return pointInPath;
    }
    
    function Draw() {
		
        this.styles = {};
        
        this.options = {
            strokeStyle : "Black",
            fillStyle : "White",
            lineWidth : 1
        };
        
        this.ctx = WCP.ctx;
        var setContext = function (that) {
            return function () {
                that.ctx = WCP.ctx;
            };
        }(this);
        WCP.on("canvasReady", setContext);
    }
	
    Draw.prototype.setContext = function (context) {
        this.ctx = context;
    };
    
	Draw.prototype.draw = function (ctx, style) {
        if (!ctx) {
            ctx = this.ctx;
       }
		for (var opt in style) {
            ctx[opt.toString()] = style[opt];
        }
        ctx.fill();
        ctx.stroke();
	};

	
	Draw.prototype.defaultStyle = function (style) {
		for (var opt in this.options) {
			if (style[opt] === undefined) {
				style[opt] = this.options[opt];
			}
		}
		this.options = style;
	};
    
	Draw.prototype.newStyle = function () {
		return {};
	};
    
	Draw.prototype.addStyle = function (style, id) {
		if (id !== undefined) {
			this.styles[id] = style;
		}
	};
    
	Draw.prototype.removeStyle = function (id) {
		if (this.styles[id]) {
			this.styles[id] = 0;
			return true;
		}
		return false;
	};
    
	Draw.prototype.newPolygon = function () {
		return {
			array : [],
			length : 0,
			add : function (posx, posy) {
				var point = {x : posx, y : posy};
				this.array[this.length++] = point;
			}
		};
	};
    
    
	Draw.prototype.point = function (x, y, size, color) {
        return new this.Point(x, y, size, color);
    };

	Draw.prototype.Point = function (x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    };

    Draw.prototype.Point.prototype = new Shape();
    
	Draw.prototype.Point.prototype.buildPath = function () {
        if (!this.size) {
            this.size = 1;
        }
        if (this.color) {
            WCP.Draw.ctx.fillStyle = this.color;
        }
		WCP.Draw.ctx.fillRect(this.x - (this.size / 2 >= 1 ? this.size / 2 : 0), this.y - (this.size / 2 >= 1 ? this.size / 2 : 0), this.size, this.size);
	};

	Draw.prototype.line = function (x1, y1, x2, y2, style) {
        return new this.Line(x1, y1, x2, y2, style);
    };

	Draw.prototype.Line = function (x1, y1, x2, y2, style) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.style = style;
    };
    
    Draw.prototype.Line.prototype = new Shape();

    Draw.prototype.Line.prototype.buildPath = function (ctx) {
		ctx.moveTo(this.x1, this.y1);
		ctx.lineTo(this.x2, this.y2);
    }
        
    Draw.prototype.circle = function (x, y, radius, style) {
        return new this.Circle(x, y, radius, style);
    };
    
	Draw.prototype.Circle = function (x, y, radius, style) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.style = style;
	};
    
    Draw.prototype.Circle.prototype = new Shape();

    Draw.prototype.Circle.prototype.buildPath = function (ctx) {
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    };

	Draw.prototype.ellipse = function (x, y, width, height, style) {
        return new this.Ellipse(x, y, width, height, style);
    };
    
	Draw.prototype.Ellipse = function (x, y, width, height, style) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.style = style;
    };

    Draw.prototype.Ellipse.prototype = new Shape();
    
    Draw.prototype.Ellipse.prototype.buildPath = function (ctx) {
		ctx.moveTo(this.x, this.y - this.height / 2); // A1
		ctx.bezierCurveTo(
			this.x + this.width / 2, this.y - this.height / 2, // C1
			this.x + this.width / 2, this.y + this.height / 2, // C2
			this.x, this.y + this.height / 2); // A2
		ctx.bezierCurveTo(
			this.x - this.width / 2, this.y + this.height / 2, // C3
			this.x - this.width / 2, this.y - this.height / 2, // C4
			this.x, this.y - this.height / 2); // A1
	};

	Draw.prototype.rect = function (x, y, width, height, style) {
        return new this.Rect(x, y, width, height, style);
    };
    
	Draw.prototype.Rect = function (x, y, width, height, style) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.style = style;
    };

	Draw.prototype.Rect.prototype = new Shape();

	Draw.prototype.Rect.prototype.buildPath = function (ctx) {
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x + this.width, this.y);
		ctx.lineTo(this.x + this.width, this.y + this.height);
		ctx.lineTo(this.x, this.y + this.height);
		ctx.lineTo(this.x, this.y);
	};

    
	Draw.prototype.polygon = function (points, style) {
        return new this.Polygon(points, style);
    };

	Draw.prototype.Polygon = function (points, style) {
		if (points.array !== undefined) {
			if (points.array instanceof Array) {
				this.points = points.array;
			}
		} else {
            this.points = points;
        }
		this.style = style;
    };
    
    Draw.prototype.Polygon.prototype = new Shape();

    Draw.prototype.Polygon.prototype.buildPath = function (ctx) {
		if (this.points instanceof Array) {
			var points = this.points;
            points.reverse();
			var firstPoint = points.pop();
			ctx.moveTo(firstPoint.x, firstPoint.y);
			while (points.length > 0) {
				var point = points.pop();
				if (point) {
					ctx.lineTo(point.x, point.y);
				}
			}
			ctx.lineTo(firstPoint.x, firstPoint.y);
		}
	};

    
	Draw.prototype.quadraCurve = function (x1, y1, cpx, cpy, x2, y2, style) {
        return new this.QuadraCurve(x1, y1, cpx, cpy, x2, y2, style);
    };

	Draw.prototype.QuadraCurve = function (x1, y1, cpx, cpy, x2, y2, style) {
        this.x1 = x1;
        this.y1 = y1;
        this.cpx = cpx;
        this.cpy = cpy;
        this.x2 = x2;
        this.y2 = y2;
        this.style = style;
    };

	Draw.prototype.QuadraCurve.prototype = new Shape();
    
	Draw.prototype.QuadraCurve.prototype.buildPath = function (ctx) {
		ctx.moveTo(this.x1, this.y1);
		ctx.quadraticCurveTo(this.cpx, this.cpy, this.x2, this.y2);
	};

	Draw.prototype.bezierCurve = function (x1, y1, cpx1, cpy1, cpx2, cpy2, x2, y2, style) {
        return new this.BezierCurve(x1, y1, cpx1, cpy1, cpx2, cpy2, x2, y2, style);
    };
    
	Draw.prototype.BezierCurve = function (x1, y1, cpx1, cpy1, cpx2, cpy2, x2, y2, style) {
        this.x1 = x1;
        this.y1 = y1;
        this.cpx1 = cpx1;
        this.cpy1 = cpy1;
        this.cpx2 = cpx2;
        this.cp2y = cpy2;
        this.x2 = x2;
        this.y2 = y2;
        this.style = style;
    };
    
    Draw.prototype.BezierCurve.prototype = new Shape();

	Draw.prototype.BezierCurve.prototype.buildPath = function (ctx) {
		ctx.moveTo(this.x1, this.y1);
		ctx.bezierCurveTo(this.cpx1, this.cpy1, this.cpx2, this.cpy2, this.x2, this.y2);
	};

    WCP.Draw = new Draw();

})(WCP);