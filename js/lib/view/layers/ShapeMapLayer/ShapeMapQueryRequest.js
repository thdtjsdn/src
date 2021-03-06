Xr.layers = Xr.layers || {};

Xr.layers.ShapeMapQueryRequest = Xr.Class({
	name: "ShapeMapQueryRequest",

	construct: function (/* string */ url, /* ShapeMapLayr */ layer, /* CoordMapper */ coordMapper,
                        /* MouseAction enum */ mouseAction, /* optional function */ onCompleted, /* optional function */ onFailed) {
		this._xhr = Xr.OperationHelper.createXMLHttpObject();
		this._xhr.open("GET", url);
		this._xhr.responseType = "arraybuffer";
		this._mouseAction = mouseAction;

		var caller = this;
		this._xhr.onreadystatechange = function(evt) {
			if(caller._xhr.readyState == 4) {
				if(caller._xhr.status == 200) {
					var arrayBuffer = caller._xhr.response;
					
					caller._parsingData(arrayBuffer, layer);
					caller._buildSVG(layer, coordMapper);
					
					if(onCompleted) onCompleted();
				} else {
					if(onFailed) onFailed();
					else alert("ShapeMapQueryRequest ERROR : " + url);
				}		
			}				
		}
	},

	methods: {
		_buildAttributeRows: function(attributeDataLength, data, offset, rowset, fids) {
		    var dataview = new DataView(data);

		    //rowset.reset();

		    var rows = rowset.rows();
		    for (var fid in rows) {
		        rows[fid].willBeDeleted = true;
		    }

			var fidIndex = 0;
			var cursor = offset;
			var fieldTypes = rowset.fieldSet().fieldTypes();
			var fieldsCount = fieldTypes.length;
			var FieldTypeEnum = Xr.data.FieldType;
			var OperationHelper = Xr.OperationHelper;
			var AttributeRowClass = Xr.data.AttributeRow;

			for(var fidIndex=0; fidIndex<fids.length; ++fidIndex) {
				var fid = fids[fidIndex];
				
				var chunkLength = dataview.getUint32(cursor, true);
				cursor += 4;

				if (rows[fid] != undefined) {
				    cursor += chunkLength;
				    rows[fid].willBeDeleted = false;
				} else {
				    var row = new AttributeRowClass(fid, fieldsCount);
				    for (var iField = 0; iField < fieldsCount; ++iField) {
				        var fieldType = fieldTypes[iField];
				        if (fieldType == FieldTypeEnum.DOUBLE) {
				            var doubleTypeValue = dataview.getFloat64(cursor, true);
				            cursor += 8;
				            row.setValue(iField, doubleTypeValue.toString());
				            //console.log(iField + " = " + doubleTypeValue);
				        }
				        else if (fieldType == FieldTypeEnum.FLOAT) {
				            var floatTypeValue = dataview.getFloat32(cursor, true);
				            cursor += 4;
				            row.setValue(iField, floatTypeValue.toString());
				            //console.log(iField + " = " + floatTypeValue);
				        }
				        else if (fieldType == FieldTypeEnum.INTEGER) {
				            var intTypeValue = dataview.getInt32(cursor, true);
				            cursor += 4;
				            row.setValue(iField, intTypeValue.toString());
				            //console.log(iField + " = " + intTypeValue);
				        }
				        else if (fieldType == FieldTypeEnum.SHORT) {
				            var shortTypeValue = dataview.getInt16(cursor, true);
				            cursor += 2;
				            row.setValue(iField, shortTypeValue.toString());
				            //console.log(iField + " = " + shortTypeValue);
				        }
				        else if (fieldType == FieldTypeEnum.STRING) {
				            var lenValue = dataview.getUint8(cursor, true);
				            cursor += 1;

				            var stringTypeValue = OperationHelper.stringUTF8(dataview, cursor, lenValue-1);
				            cursor += lenValue;

				            row.setValue(iField, stringTypeValue);

				            //if (iField == 20 || iField == 8) {
				            //    console.log(iField + " = " + stringTypeValue + " , lenValue = " + lenValue);
				            //}
				        }
				        else if (fieldType == FieldTypeEnum.VERYSHORT) {
				            var vertShortTypeValue = dataview.getInt8(cursor);
				            cursor += 1;
				            row.setValue(iField, vertShortTypeValue.toString());
				            //console.log(iField + " = " + vertShortTypeValue);						
				        } else {
				            alert("[_buildAttributeRows] Unknown Type: " + fieldType);
				        }
				    }

				    rowset.add(row);
				}	
			}

			for (var fid in rows) {
			    if (rows[fid].willBeDeleted) {
			        delete rows[fid];
			    }
			}
		},
	
		_buildPointRows: function(shapeDataLength, dataview, rowset, fids) {
		    var rows = rowset.rows();
		    for (var fid in rows) {
		        rows[fid].willBeDeleted = true;
		    }

			var fidIndex = 0;
			var cursor = 12;
			var MBRClass = Xr.MBR;
			var PointShapeDataClass = Xr.data.PointShapeData;
			var PointShapeRowClass = Xr.data.PointShapeRow;

			while((cursor-12) < shapeDataLength) {
				var fid = dataview.getUint32(cursor, true);
				cursor += 4;
			
				var chunkLength = dataview.getUint32(cursor, true);
				cursor += 4;
			
				if (rows[fid] != undefined) {
				    cursor += chunkLength;
				    rows[fid].willBeDeleted = false;
				} else {

				    var X = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var Y = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var mbr = new MBR(X, Y, X, Y);
				    var shapeData = new PointShapeDataClass(mbr);
				    var row = new PointShapeRowClass(fid, shapeData);

				    rowset.add(row);

				    //console.log(fids + " " + fidIndex + " " + fid);
				}

				fids[fidIndex++] = fid;
			}	
			
			for (var fid in rows) {
			    if (rows[fid].willBeDeleted) {
			        delete rows[fid];
			    }
			}

			return cursor;
		},
		
		_buildPolylineRows: function(shapeDataLength, dataview, rowset, fids) {
		    var rows = rowset.rows();
		    for (var fid in rows) {
		        rows[fid].willBeDeleted = true;
		    }

			var fidIndex = 0;
			var cursor = 12;
			var MBRClass = Xr.MBR;
			var PolylineShapeDataClass = Xr.data.PolylineShapeData;
			var PolylineShapeRowClass = Xr.data.PolylineShapeRow;

			while ((cursor - 12) < shapeDataLength) {
			    var fid = dataview.getUint32(cursor, true);
			    cursor += 4;

			    var chunkLength = dataview.getUint32(cursor, true);
			    cursor += 4;

			    if (rows[fid] != undefined) {
			        cursor += chunkLength;
			        rows[fid].willBeDeleted = false;
			    } else {
			        var mbrMinX = dataview.getFloat32(cursor, true);
			        cursor += 4;

			        var mbrMinY = dataview.getFloat32(cursor, true);
			        cursor += 4;

			        var mbrMaxX = dataview.getFloat32(cursor, true);
			        cursor += 4;

			        var mbrMaxY = dataview.getFloat32(cursor, true);
			        cursor += 4;

			        var mbr = new MBR(mbrMinX, mbrMinY, mbrMaxX, mbrMaxY);

			        var ringCount = dataview.getUint16(cursor, true);
			        cursor += 2;

			        var vtxCountsOfRings = new Array(ringCount);

			        for (var iRing = 0; iRing < ringCount; ++iRing) {
			            vtxCountsOfRings[iRing] = dataview.getUint32(cursor, true);
			            cursor += 4;
			        }

			        var shapeData = new PolylineShapeData(mbr);
			        var polylines = shapeData.data();

			        for (var iRing = 0; iRing < ringCount; ++iRing) {
			            var vertexCount = vtxCountsOfRings[iRing];
			            var polyline = new Array(vertexCount);
			            for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
			                var x = dataview.getFloat32(cursor, true);
			                cursor += 4;

			                var y = dataview.getFloat32(cursor, true);
			                cursor += 4;

			                var wp = new Xr.PointD(x, y);
			                polyline[iVtx] = wp;
			            }

			            polylines[iRing] = polyline;
			        }

			        var row = new PolylineShapeRow(fid, shapeData);
			        rowset.add(row);
			    }

			    fids[fidIndex++] = fid;
			}
			
			for (var fid in rows) {
			    if (rows[fid].willBeDeleted) {
			        delete rows[fid];
			    }
			}
			
			return cursor;
		},

		_buildPolygonRows: function(shapeDataLength, dataview, rowset, fids) {
		    var rows = rowset.rows();
		    for (var fid in rows) {
		        rows[fid].willBeDeleted = true;
		    }

			var fidIndex = 0;
			var cursor = 12;
			var MBRClass = Xr.MBR;
			var PolygonShapeDataClass = Xr.data.PolygonShapeData;
			var PolygonShapeRowClass = Xr.data.PolygonShapeRow;

			while((cursor-12) < shapeDataLength) {
				var fid = dataview.getUint32(cursor, true);
				cursor += 4;

				var chunkLength = dataview.getUint32(cursor, true);
				cursor += 4;
			
				if (rows[fid] != undefined) {
				    cursor += chunkLength;
				    rows[fid].willBeDeleted = false;
				} else {
				    var mbrMinX = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var mbrMinY = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var mbrMaxX = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var mbrMaxY = dataview.getFloat32(cursor, true);
				    cursor += 4;

				    var mbr = new MBRClass(mbrMinX, mbrMinY, mbrMaxX, mbrMaxY);

				    var ringCount = dataview.getUint16(cursor, true);
				    cursor += 2;

				    var vtxCountsOfRings = new Array(ringCount);

				    for (var iRing = 0; iRing < ringCount; ++iRing) {
				        vtxCountsOfRings[iRing] = dataview.getUint32(cursor, true);
				        cursor += 4;
				    }

				    var shapeData = new PolygonShapeDataClass(mbr);
				    var polygons = shapeData.data();

				    for (var iRing = 0; iRing < ringCount; ++iRing) {
				        var vertexCount = vtxCountsOfRings[iRing];
				        var polygon = new Array(vertexCount);
				        for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
				            var x = dataview.getFloat32(cursor, true);
				            cursor += 4;

				            var y = dataview.getFloat32(cursor, true);
				            cursor += 4;

				            var wp = new Xr.PointD(x, y);
				            polygon[iVtx] = wp;
				        }

				        polygons[iRing] = polygon;
				    }

				    var row = new PolygonShapeRowClass(fid, shapeData);
				    row.willBeDeleted = false;
				    rowset.add(row);
				}

				fids[fidIndex++] = fid;
			}

			for (var fid in rows) {
			    if (rows[fid].willBeDeleted) {
			        delete rows[fid];
			    }
			}

			return cursor;
		},

		_parsingData: function(data, layer) {
			var dataview = new DataView(data);
			var shpRowset = layer.shapeRowSet();
			var shapeType = shpRowset.shapeType();
			var offset;
			var fids = new Array();

			var totalDataLength = dataview.getUint32(0, true); // true -> Little Endian
			var shapeDataLength = dataview.getUint32(4, true);
			var attributeDataLength = dataview.getUint32(8, true);

			if(shapeType == Xr.data.ShapeType.POINT)
				offset = this._buildPointRows(shapeDataLength, dataview, shpRowset, fids);
			else if(shapeType == Xr.data.ShapeType.POLYLINE)
				offset = this._buildPolylineRows(shapeDataLength, dataview, shpRowset, fids);		
			else if(shapeType == Xr.data.ShapeType.POLYGON)
				offset = this._buildPolygonRows(shapeDataLength, dataview, shpRowset, fids);

			if (attributeDataLength > 0) {
			    var attRowSet = layer.attributeRowSet();
			    this._buildAttributeRows(attributeDataLength, data, offset, attRowSet, fids);
			}
		},

		_buildSVG: function(layer, coordMapper) {
			var svg = layer.container();
			var childNodes = svg.childNodes;
			var cntChildNodes = childNodes.length;	
			var childNode;

			var attRowSet = layer.attributeRowSet();
			var fieldSet = attRowSet.fieldSet();
			var attRows = attRowSet.rows();
			var theme = layer.theme();
			var layerName = layer.name();
			var labelDrawer = layer.labelDrawer();
			var label = layer.label();
			var mapScale = coordMapper.mapScale();
			var shpRows = layer.shapeRowSet().rows();
			var formatter = label.formatter();
			var labelTheme = label.theme();
			var labelSvg = labelDrawer.container();
			var bLabeling = label.enable() && label.visibility().needRendering(mapScale);

			for (var i = 0; i < cntChildNodes; i++) {
			    svg.removeChild(childNodes[0]);
			}

			labelDrawer.clean(layerName);

			if (layer.visibility().needRendering(mapScale)) {
			    for (var fid in shpRows) {
			        var shpRow = shpRows[fid];
			        var attRow = attRows[fid];
			        var sym = theme.symbol(shpRow, fieldSet, attRow);
			        var path = shpRow.createSVG(coordMapper, attRow, sym);

			        path.id = fid;
			        svg.appendChild(path);

			        if (bLabeling) {
			            var labelText = formatter.value(shpRow, fieldSet, attRow);
			            if (labelText.length > 0) {
			                var fontSym = labelTheme.symbol(shpRow, fieldSet, attRow);
			                text = attRow.createSVG(coordMapper, shpRow, labelText, fontSym); // creating SVG and setting Symbol

			                labelSvg.appendChild(text);

			                var bbox = text.getBBox();
			                var rPt = shpRow.shapeData().representativePoint();
			                var vp = coordMapper.W2V(rPt);
			                var minX = vp.x - (bbox.width / 2);
			                var maxX = vp.x + (bbox.width / 2);
			                var minY = vp.y + (bbox.height / 2);
			                var maxY = vp.y - (bbox.height / 2);

			                if (!labelDrawer.add(new Xr.MBR(minX, maxY, maxX, minY))) {
			                    labelSvg.removeChild(text);
			                } else {
			                    text.id = layerName + fid;
			                }
			            }
			        }
			    }
			}
		},
		
		request: function() {
			this._xhr.send(null);
		}
	}
});