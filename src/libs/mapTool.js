import funTool from './funTool';
const globalConfig = {
  scale: 1,
  isAdd: true,
  bgLayer: []
};

let defaltOption = null;
let map = null;
export class MapTool {
  init(config) {
    defaltOption = {
      center: ol.proj.transform([121.52493735878126, 31.19617210534895], 'EPSG:4326', 'EPSG:3857'),
      zoom: 13,
      minZoom: 13,
      maxZoom: 19
    };

    let curOption = Object.assign(defaltOption, config);

    let view = new ol.View(curOption);

    let target = 'map';
    if (config && !funTool.IsNullorEmpty(config.target)) {
      target = config.target;
    }

    map = new ol.Map({
      controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false
        }
      }),
      target: target,
      view: view,
      loadTilesWhileInteracting: true,
      layers: [],
      overlays: []
    });

    return map;
  }

  // 初始化地图
  resetMap() {
    map.getView().animate({
      center: defaltOption.center,
      zoom: defaltOption.zoom
    });
  }

  getLayer(layerName) {
    let layers = map.getLayers().getArray();
    let layer = layers.find(p => p.get('layerName') === layerName);
    return layer;
  }

  clearBgLayer() {
    if (globalConfig.bgLayer.length > 0) {
      for (let index in globalConfig.bgLayer) {
        map.removeLayer(globalConfig.bgLayer[index]);
      }
      globalConfig.bgLayer = [];
    }
  }

  // 谷歌卫片
  addNewBgLayer(val) {
    this.clearBgLayer(); // 清空背景图层

    if (val == 'mapbox') {
      let sourceText = new ol.source.XYZ({
        url: 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlnaHQyMjYwMCIsImEiOiJjamw0aXJwdXUwN2F0M3Jxa3F1NDJ3eGxpIn0.BnJlFRgJHFKYtprOAPdWzw'
      });
      this.addBgTile(sourceText, {
        zIndex: 2
      });
    } else if (val == '谷歌') {
      let source = new ol.source.XYZ({
        url: 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}'
      });

      this.addBgTile(source, {
        zIndex: 1
      });

      let source2 = new ol.source.XYZ({
        url: 'http://t0.tianditu.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}'
      });
      this.addBgTile(source2, {
        zIndex: 2
      });
    }
  }

  // key：地图类型，如：百度，高德，mode：地图模式：卫星，平面
  addBgLayer(key, mode) {
    this.clearBgLayer(); // 清空背景图层

    if (key === '百度') {
      let projection = ol.proj.get('EPSG:3857');
      let resolutions = [];
      for (let i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
      }
      let tilegrid = new ol.tilegrid.TileGrid({
        origin: [0, 0],
        resolutions: resolutions
      });

      if (mode === '卫星') {
        let baiduSourceRaster = new ol.source.TileImage({
          tileGrid: tilegrid,
          tileUrlFunction: function (tileCoord, pixelRatio, proj) {
            let z = tileCoord[0];
            let x = tileCoord[1];
            let y = tileCoord[2];

            // 百度瓦片服务url将负数使用M前缀来标识
            if (x < 0) {
              x = 'M' + (-x);
            }
            if (y < 0) {
              y = 'M' + (-y);
            }
            return 'http://shangetu' + parseInt(Math.random() * 10) + '.map.bdimg.com/it/u=x=' + x +
              ';y=' + y + ';z=' + z + ';v=009;type=sate&fm=46&udt=20170606';
          }
        });

        this.addBgTile(baiduSourceRaster);

        let baiduSourceLabel = new ol.source.TileImage({
          tileGrid: tilegrid,
          tileUrlFunction: function (tileCoord, pixelRatio, proj) {
            let z = tileCoord[0];
            let x = tileCoord[1];
            let y = tileCoord[2];

            // 百度瓦片服务url将负数使用M前缀来标识
            if (x < 0) {
              x = 'M' + (-x);
            }
            if (y < 0) {
              y = 'M' + (-y);
            }
            return 'http://online' + parseInt(Math.random() * 10) + '.map.bdimg.com/onlinelabel/?qt=tile&x=' +
              x + '&y=' + y + '&z=' + z + '&styles=sl&udt=20170620&scaler=1&p=1';
          }
        });
        this.addBgTile(baiduSourceLabel);
      } else {
        let baidu_source = new ol.source.TileImage({
          projection: projection,
          tileGrid: tilegrid,
          tileUrlFunction: function (tileCoord, pixelRatio, proj) {
            if (!tileCoord) {
              return '';
            }
            let z = tileCoord[0];
            let x = tileCoord[1];
            let y = tileCoord[2];

            if (x < 0) {
              x = 'M' + (-x);
            }
            if (y < 0) {
              y = 'M' + (-y);
            }

            return 'http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=' + x + '&y=' + y + '&z=' + z + '&styles=pl&udt=20151021&scaler=1&p=1';
          }
        });
        this.addBgTile(baidu_source);
      }
    } else if (key === '高德地图') {
      if (mode === '卫星') {
        let source = new ol.source.XYZ({
          url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'
        });
        this.addBgTile(source);

        let sourcelable = new ol.source.XYZ({
          url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}'
        });
        this.addBgTile(sourcelable);
      } else {
        let source = new ol.source.XYZ({
          url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        });
        this.addBgTile(source);
      }
    } else if (key === '天地图') {
      if (mode === '卫星') {
        // 影像
        this.addBgTile(new ol.source.XYZ({
          url: 'http://t2.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}'
        }));
      } else {
        // 平面
        this.addBgTile(new ol.source.XYZ({
          url: 'http://t2.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}'
        }));
      }

      this.addBgTile(new ol.source.XYZ({
        url: 'http://t2.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}'
      }));
    } else if (key === '谷歌地图') {
      if (mode == '卫星') {
        let source = new ol.source.XYZ({
          url: 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}'
        });
        this.addBgTile(source);

        let sourceText = new ol.source.XYZ({
          url: 'http://www.google.cn/maps/vt?lyrs=h&x={x}&y={y}&z={z}'
        });
        this.addBgTile(sourceText);
      } else {
        let source = new ol.source.XYZ({
          url: 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i380072576!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0'
        });
        this.addBgTile(source);

        // let sourcedx = new ol.source.XYZ({
        //   url: 'http://www.google.cn/maps/vt?lyrs=t@189&gl=cn&x={x}&y={y}&z={z}'
        // });
        // this.addBgTile(sourcedx);
      }
    } else if (key === 'mapBox') {
      let source = new ol.source.XYZ({
        url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGlnaHQyMjYwMCIsImEiOiJjamw0aXN0cG8yNTRsM3FyMHo0Z2N0NWdrIn0.0vlRBZDcpgffEzikahIWHg'
      });
      this.addBgTile(source);
    }
  }

  addPipe(name, option) {
    let layerName = 'burst:' + name;
    let curOption = {
      source: new ol.source.ImageWMS({
        url: window.global.config.geoserverUrl,
        params: {
          FORMAT: 'image/png',
          VERSION: '1.1.1',
          LAYERS: layerName
        }
      }),
      visible: false,
      zIndex: 100
    };
    curOption = Object.assign(curOption, option);
    let layer = new ol.layer.Image(curOption);
    map.addLayer(layer);
    return layer;
  }

  // 要素转换geojson
  getGeojson(feature, option) {
    let defaltOption = {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    };

    defaltOption = Object.assign(defaltOption, option);

    let geoJson = null;
    if (!funTool.IsNullorEmpty(feature.length)) {
      geoJson = new ol.format.GeoJSON().writeFeatures(feature, defaltOption);
    } else {
      geoJson = new ol.format.GeoJSON().writeFeature(feature, defaltOption);
    }

    return geoJson;
  }

  // 读取geojson
  addGeojson(gjson, option) {
    var defaltOption = {
      zIndex: 10,
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        features: new ol.format.GeoJSON({
          featureProjection: 'EPSG:3857'
        }).readFeatures(gjson)
      })
    };

    defaltOption = Object.assign(defaltOption, option);

    // 添加layerName 图层，为 feature提供所属
    if (!funTool.IsNullorEmpty(defaltOption.layerName)) {
      defaltOption.source.set('layerName', defaltOption.layerName);
    }

    var layer = new ol.layer.Vector(defaltOption);

    map.addLayer(layer);
    return layer;
  }

  getGrade() {
    let step = 2;
    let zoom = map.getView().getZoom();
    let grade = parseInt((zoom - defaltOption.minZoom) / step);
    if (grade > 3) {
      grade = 3;
    }
    return grade;
  }

  addTile(source) {
    let layer = new ol.layer.Tile({
      source: source,
      zIndex: 10
    });
    map.addLayer(layer);
    return layer;
  }

  addBgTile(source, option) {
    let defaultOpion = {
      source: source,
      zIndex: 1
    };

    defaultOpion = Object.assign(defaultOpion, option);
    let layer = new ol.layer.Tile(defaultOpion);
    map.addLayer(layer);
    globalConfig.bgLayer.push(layer);

    return layer;
  }

  addTextAndIcon(row, style) {
    let coord = ol.proj.fromLonLat([row.x, row.y]);
    let iconFeature = new ol.Feature({
      geometry: new ol.geom.Point(coord)
    });

    // 名称
    if (!funTool.IsNullorEmpty(row.name)) {
      iconFeature.set('name', row.name);
    }

    if (!funTool.IsNullorEmpty(row.layerName)) {
      iconFeature.set('layerName', row.layerName);
    }

    iconFeature.setId(row.id + '');
    iconFeature.setStyle(style);
    return iconFeature;
  }

  addFeature(row, src) {
    if (funTool.IsNullorEmpty(src)) {
      src = '/assets/img/map1.png';
    }

    let iconStyle = new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1.2],
        src: src
      })

    });

    iconStyle.getImage().setScale(0.8);
    iconStyle.setZIndex(10);

    let iconFeature = this.addTextAndIcon(row, iconStyle);
    iconFeature.setId(row.id + '');

    return iconFeature;
  }

  // 添加圆形
  addRound(row) {
    if (funTool.IsNullorEmpty(row.color)) {
      row.color = '#FF69B4';
    }

    let style = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({
          color: row.color
        })

      })
    });

    let iconFeature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([row.x, row.y]))
    });

    iconFeature.setId(row.id + '');
    iconFeature.setStyle(style);
    return iconFeature;
  }

  // 特性动画
  featureAnimation(features, option) {
    let optionDefalt = {
      src: '/assets/img/map1.png',
      frequency: 30,
      minScale: 0.6,
      maxScale: 1.2,
      stepScale: 0.02
    };

    let curOption = Object.assign(optionDefalt, option);

    let styleJson = {
      image: new ol.style.Icon({
        src: curOption.src
      })
    };
    if (features != null && features.length > 0) {
      if (globalConfig.scale < curOption.maxScale & globalConfig.isAdd) {
        globalConfig.scale += curOption.stepScale;
      } else {
        globalConfig.isAdd = false;
        globalConfig.scale -= curOption.stepScale;
        if (globalConfig.scale < curOption.minScale) {
          globalConfig.isAdd = true;
        }
      }

      features.forEach(feature => {
        // 文字标注
        let name = feature.get('name');
        if (!funTool.IsNullorEmpty(name)) {
          styleJson.text = new ol.style.Text({
            textAlign: 'center',
            font: '6px Times New Roman',
            text: name,
            offsetY: 15,
            fill: new ol.style.Fill({
              color: '#ff0000'
            }),
            padding: [2, 2, 2, 2],
            backgroundFill: new ol.style.Fill({
              color: 'rgba(0, 0, 0,0.5)'
            })
          });
        }

        let iconStyle = new ol.style.Style(styleJson);
        feature.setStyle(iconStyle);
        iconStyle.getImage().setScale(globalConfig.scale);
        iconStyle.setZIndex(10);
      });
    }
    map.render();
  }

  // 初始化Feature
  initFeature(features, callback) {
    let iconStyle = new ol.style.Style({
      image: new ol.style.Icon({
        src: '/assets/img/map1.png'
      })
    });

    features.forEach(feature => {
      feature.setStyle(iconStyle);
      iconStyle.getImage().setScale(0.8);
      // iconStyle.setZIndex(1);
    });

    callback && callback();
  }

  setViewCenterByGeoJson(geojson, option) {
    option = option || {};
    let features = (new ol.format.GeoJSON({
      featureProjection: 'EPSG:3857'
    })).readFeatures(geojson);
    this.setViewCenterByfeatures(features, option);
  }

  setViewCenterByfeatures(features, option) {
    option = option || {};
    let coordinates = [];
    features.forEach(feature => {
      let coordinate = feature.getGeometry().getLastCoordinate();
      coordinates.push(coordinate);
    });

    if (coordinates.length > 0) {
      let extent = ol.extent.boundingExtent(coordinates); // 返回范围
      let viewCenter = ol.extent.getCenter(extent);

      let resolution = map.getView().getResolutionForExtent(extent, map.getSize());
      let zoom = map.getView().getZoomForResolution(resolution);

      if (!funTool.IsNullorEmpty(option.addZoom)) {
        zoom = zoom + option.addZoom;
      }

      map.getView().animate({
        center: viewCenter,
        zoom: zoom
      });
    }
  }

  // 画行政区域
  drawBoundary(name, points, redProvinces) {
    let region_source = new ol.source.Vector();

    if (!funTool.IsNullorEmpty(points) && points.length > 0) {
      points.forEach(point => {
        let coordinates = [];
        let curLngLats = point.region.split(',');
        curLngLats.forEach(curLngLat => {
          let coord = curLngLat.split(' ');
          coordinates.push([parseFloat(coord[0]), parseFloat(coord[1])]);
        });

        let polygon = new ol.geom.Polygon([coordinates]);
        polygon.transform('EPSG:4326', 'EPSG:3857');

        let border = new ol.Feature({
          geometry: polygon
        });

        region_source.addFeature(border);
      });
    }

    let curStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'blue',
        width: 1
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.1)'
      })
    });

    if (!funTool.IsNullorEmpty(redProvinces) && redProvinces.includes(name)) {
      curStyle.getStroke().setColor('red');
      curStyle.getFill().setColor('rgba(255, 0, 0, 0.1)');
    }

    let region_layer = new ol.layer.Vector({
      source: region_source,
      style: curStyle,
      zIndex: 10
    });

    map.addLayer(region_layer);
  }
  // 等值线
  drawContour(rows, option) {
    option = option || {};
    if (!option.step) {
      option.step = 1;
    }

    let points = {
      type: 'FeatureCollection',
      features: []
    };

    // 异常的点
    let abnormalPoints = {
      type: 'FeatureCollection',
      features: []
    };

    rows.forEach(function (row) {
      let point = {
        'type': 'Feature',
        'properties': {
          num: parseInt(row.Z)
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [parseFloat(row.X), parseFloat(row.Y)]
        }
      };

      points.features.push(point);

      // if (row.Z > -50 && row.Z < 1000) {
      //   points.features.push(point);
      // } else {
      //   abnormalPoints.features.push(point);
      // }
    });

    let pointGrid = turf.interpolate(points, 0.1, {
      gridType: 'points',
      property: 'num'
    });

    let optionLevels = option.breaks.map(function (item) {
      return item.level;
    });

    // 填补等级
    let curLevels = [];
    for (let i = optionLevels[0]; i < optionLevels[optionLevels.length - 1] + 50; i = i + option.step) {
      let color = funTool.getColor(i, option.breaks);
      curLevels.push({
        level: i,
        color: color
      });
    }

    let levels = curLevels.map(function (item) {
      return item.level;
    });

    let lines = turf.isolines(pointGrid, levels, {
      zProperty: 'num'
    });

    lines.features = lines.features.filter(p => p.geometry.coordinates.length > 0);

    // 边框线切割

    let borderLine = turf.polygonToLine(option.borderline);

    lines.features.forEach(feature => {
      let xjd = MapTool.cutLine(feature, borderLine);
      // if (xjd.length > 0) {
      feature.geometry.coordinates = xjd;
      // }
    });

    let featureslines = (new ol.format.GeoJSON({
      featureProjection: 'EPSG:3857'
    })).readFeatures(lines);

    featureslines.forEach(function (line) {
      let item = curLevels.find(function (item) {
        if (item.level == line.getProperties().num) {
          return item;
        }
      });

      if (item) {
        let style = new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: item.color,
            width: 1
          })
        });
        line.setStyle(style);
      }
    });

    // 正常点
    var features = (new ol.format.GeoJSON({
      featureProjection: 'EPSG:3857'
    })).readFeatures(points);
    for (var i = 0; i < features.length; i++) {
      let style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 8,
          fill: new ol.style.Fill({
            color: '#c6dbef'
          }),
          stroke: new ol.style.Stroke({
            color: '#5cadff',
            width: 2
          })
        }),
        text: new ol.style.Text({
          text: features[i].getProperties().num + '',
          font: ' 8px Times New Roman',
          fill: new ol.style.Fill({
            color: '#0d3054'
          })
        })
      });

      features[i].setStyle(style);
    }

    // 异常点
    let abnormaFeatures = (new ol.format.GeoJSON()).readFeatures(abnormalPoints);
    for (var i = 0; i < abnormaFeatures.length; i++) {
      let style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 12,
          fill: new ol.style.Fill({
            color: '#ff0000'
          }),
          stroke: new ol.style.Stroke({
            color: '#5cadff',
            width: 2
          })
        }),
        text: new ol.style.Text({
          text: abnormaFeatures[i].getProperties().num + '',
          font: ' 8px Times New Roman',
          fill: new ol.style.Fill({
            color: '#000'
          })
        })
      });

      abnormaFeatures[i].getGeometry().transform('EPSG:4326', 'EPSG:3857');
      abnormaFeatures[i].setStyle(style);
    }

    lines.features.forEach(p => {
      var pointxx = turf.lineIntersect(p, option.borderline);
      if (pointxx.features.length > 0) {
        pointxx.features.forEach(p2 => {
          p.geometry.coordinates.forEach(p3 => {
            var curLine = turf.lineString(p3);

            var isPointOnLine = turf.booleanPointOnLine(p2, curLine);

            if (isPointOnLine) {
              var split = turf.lineSplit(curLine, p2);
            }
          });
        });
      }
    });

    let vector = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: featureslines
      }),
      zIndex: 1000
    });

    features = features.concat(abnormaFeatures);
    let vectorPoint = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: features
      }),
      zIndex: 1001
    });

    map.addLayer(vector);
    map.addLayer(vectorPoint);

    mapTool.setViewCenterByfeatures(features);
    return [vector, vectorPoint];
  }

  // 按照边框切割线
  static cutLine(feature, borderLine) {
    let result = [];

    let polygon = turf.lineToPolygon(borderLine);

    if (feature.geometry.coordinates.length > 0) {
      feature.geometry.coordinates.forEach(p => {
        var line = turf.lineString(p);
        var split = turf.lineSplit(line, borderLine);

        if (split.features.length > 0) { // 边界有焦点，使用booleanContains
          split.features.forEach(p2 => {
            let polygon = turf.lineToPolygon(borderLine);
            let isContain = turf.booleanContains(polygon, p2);
            if (isContain) {
              result.push(p2.geometry.coordinates);
            }
          });
        } else // 边界无焦点，使用booleanWithin
        {
          let isWithin = turf.booleanWithin(line, polygon);
          result.push(line.geometry.coordinates);
        }
      });
    }

    return result;
  }

  drawHeatMap(rows) {
    let heatData = {
      type: 'FeatureCollection',
      features: []
    };

    res.data.forEach((item) => {
      heatData.features.push({
        type: 'Point',
        'coordinates': [parseFloat(item.x), parseFloat(item.y)],
        weight: Math.ceil(Math.random() * 10)
      });
    });

    let vectorSource = new ol.source.Vector({
      features: (new ol.format.GeoJSON()).readFeatures(heatData, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    });

    let vector = new ol.layer.Heatmap({
      source: vectorSource,
      blur: 10,
      radius: 5,
      zIndex: 400
    });
    self.map.addLayer(vector);
  }

  getAngle(px1, py1, px2, py2) {
    // 两点的x、y值,顺时针计算轴向
    let x = Math.abs(px2 - px1);
    let y = Math.abs(py2 - py1);

    let radian = 0;

    let hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    // 斜边长度
    let cos = y / hypotenuse;

    var radina = Math.acos(cos); // 用反三角函数求弧度
    var angle = 180 / (Math.PI / radina);

    if (px1 > px2 && py1 > py2) { // 鼠标在第四象限
      angle = 180 - angle;
    }

    if (px1 === px2 && py1 > py2) { // 鼠标在y轴负方向上
      angle = 180;
    }

    if (px1 > px2 && py1 === py2) { // 鼠标在x轴正方向上
      angle = 90;
    }

    if (px1 < px2 && py1 > py2) { // 鼠标在第三象限
      angle = 180 + angle;
    }

    if (px1 < px2 && py1 === py2) { // 鼠标在x轴负方向
      angle = 270;
    }

    if (px1 < px2 && py1 < py2) { // 鼠标在第二象限
      angle = 360 - angle;
    }
    radian = (angle * Math.PI / 180);

    return radian;
  }

  addOverlay(element) {
    let container = element;
    container.className = 'ol-popup';

    let content = document.createElement('div');
    content.className = 'popup-content';

    let closer = document.createElement('div');
    closer.className = 'ol-popup-closer';

    element.appendChild(content);
    element.appendChild(closer);

    let overlay = new ol.Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });

    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    map.addOverlay(overlay);

    return {
      content: content,
      overlay: overlay
    };
  }

  // 获取属性对应的html
  getpropertHtml(properts, names, callback) {
    let html = '';
    for (var key in names) {
      let name = names[key];
      let value = properts[key];
      if (name) {
        html += '<p><label>' + name + '：</label>' + value + '</p>';
      }
    }
    callback && callback(html);
    return html;
  }
}

export const mapTool = new MapTool();