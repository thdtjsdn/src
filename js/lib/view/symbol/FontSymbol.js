﻿Xr.symbol = Xr.symbol || {};

Xr.symbol.FontSymbol = Xr.Class({
    name: "FontSymbol",

    construct: function (/* Object */ propertyObj) {
        var attributes = propertyObj || {};

        this._fontFamily = attributes['fontFamily'] || undefined;
        this._size = attributes['size'] || 12;
        this._color = attributes['color'] || 0xffffff;
        this._weight = attributes['weight'] || undefined;

        this._strokeColor = attributes['strokeColor'] || undefined;
        this._strokeWidth = attributes['strokeWidth'] || 3;
        this._strokeLineCap = attributes['strokeLineCap'] || undefined;
        this._strokeLineJoin = attributes['strokeLineJoin'] || undefined;
        this._strokeOpacity = attributes['strokeOpacity'] || 1;
    },

    methods: {
        /* string */ fontFamily: function (/* optional string */ v) {
            if (arguments.length == 0) {
                return this._fontFamily;
            } else {
                this._fontFamily = v;
            }
        },

        /* number */ size: function (/* number */ v) {
            if (arguments.length == 0) {
                return this._size;
            } else {
                this._size = v;
            }
        },

        /* String, #ffffff or rgb(255,255,255) */ color: function (/* optional String */ v) {
            if (arguments.length == 0) {
                return this._color;
            } else {
                this._color = v;
            }
        },

        /* string, bold or 100, 200, 400, 600, ... */ weight: function (/* optional string, bold or 100, 600, ... */ v) {
            if (arguments.length == 0) {
                return this._weight;
            } else {
                this._weight = v;
            }
        },

        /* String, #ffffff or rgb(255,255,255) */ strokeColor: function (/* optional String, #ffffff or rgb(255,255,255) */ v) {
            if (arguments.length == 0) {
                return this._strokeColor;
            } else {
                this._strokeColor = v;
            }
        },

        /* number, 0~1 */ strokeOpacity: function (/* optional number, 0~1 */ v) {
            if (arguments.length == 0) {
                return this._strokeOpacity;
            } else {
                this._strokeOpacity = v;
            }
        },

        /* number */ strokeWidth: function (/* optional number */ v) {
            if (arguments.length == 0) {
                return this._strokeWidth;
            } else {
                this._strokeWidth = v;
            }
        },

        /* string */ strokeLineJoin: function (/* optional string */ v) {
            if (arguments.length == 0) {
                this._strokeLineJoin;
            } else {
                this._strokeLineJoin = v;
            }
        },

        /* number */ strokeOpacity: function (/* optional number */ v) {
            if (arguments.length == 0) {
                return this._strokeOpacity;
            } else {
                this._strokeOpacity = v;
            }
        },

        attributeForStroke: function (/* SVG Element */ svg) {
            /*
			svg.setAttribute("font-size", 12);
			svg.setAttribute("stroke", "#000000");
			svg.setAttribute("stroke-width", "3px");
			svg.setAttribute("stroke-linecap", "butt");
			svg.setAttribute("stroke-linejoin", "round");
			svg.setAttribute("stroke-opacity", "1");
            */

            if(this._fontFamily) svg.setAttribute('font-family', this._fontFamily);            
            svg.setAttribute("font-size", this._size);
            if(this._weight) svg.setAttribute("font-weight", this._weight);
            if(this._strokeColor) svg.setAttribute('stroke', this._strokeColor);
            if (this._strokeWidth) svg.setAttribute('stroke-width', this._strokeWidth);
            if(this._strokeLineCap) svg.setAttribute('stroke-linecap', this._strokeLineCap);
            if(this._strokeLineJoin) svg.setAttribute('stroke-linejoin', this._strokeLineJoin);
            svg.setAttribute('stroke-opacity', this._strokeOpacity);
        },

        attribute: function (/* SVG Element */ svg) {
            /*
			text.setAttribute("font-size", 12);
			text.setAttribute("fill", "#ffffff");
			*/

            if (this._fontFamily) svg.setAttribute('font-family', this._fontFamily);
            svg.setAttribute('font-size', this._size);
            if (this._weight) svg.setAttribute('font-weight', this._weight);
            svg.setAttribute("fill", this._color);
        },

        needStroke: function () {
            return (this._strokeColor != undefined);
        }
    }
});