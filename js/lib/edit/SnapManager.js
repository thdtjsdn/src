Xr.edit = Xr.edit || {};

Xr.edit.SnapManager = Xr.Class({
    name: "SnapManager",

	construct: function(/* EditManager */ editManager) {
	    this._targets = new Array();
	    this._editManager = editManager;
	    this._bVertexSnapMode = false;
	    this._bEdgeSnapMode = false;
	},
 	
	methods: {
		/* boolean */ add: function (/* ISnap */ target) {
		    var cntTargets = this._targets.length;
		    for (var i = 0; i < cntTargets; i++) {
		        if (this._targets[i] == target) {
		            return false;
		        }
		    }

		    this._targets.push(target);
		    return true;
		},

		remove: function(/* ISnap */ target) {
		    var cntTargets = this._targets.length;
		    for (var i = 0; i < cntTargets; i++) {
		        if (this._targets[i] == target) {
		            this._targets.splice(i, 1);
		        }
		    }
		},

		vertexSnapMode: function (/* optional boolean */ bEnable) {
		    if (arguments.length == 1) {
		        this._bVertexSnapMode = bEnable;
		    } else {
		        return this._bVertexSnapMode;
		    }
		},

		edgeSnapMode: function (/* optional boolean */ bEnable) {
		    if (arguments.length == 1) {
		        this._bEdgeSnapMode = bEnable;
		    } else {
		        return this._bEdgeSnapMode;
		    }
		},

		clear: function() {
		    this._targets.length = 0;
		},

	    /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        var cntTargets = this._targets.length;
	        var result = undefined;

	        for (var i = 0; i < cntTargets; i++) {
	            result = this._targets[i].vertexSnap(mapPt, tol)
	            if (result) break;
	        }

	        return result;
	    },

	    /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        var cntTargets = this._targets.length;
	        var result = undefined;

	        for (var i = 0; i < cntTargets; i++) {
	            result = this._targets[i].edgeSnap(mapPt, tol)
	            if (result) break;
	        }

	        return result;
	    }
	}
});