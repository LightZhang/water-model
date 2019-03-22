/* eslint-disable no-undef */
import {
  mapTool
} from '@/libs/mapTool';
import funTool from '@/libs/funTool';
import nodes from '../data/节点.json';
import pipes from '../data/管网.json';
import result from '../data/水流结果.json';
import hydraulicModelConfig from '../data/config/图例水力模型.json';
let flowarrow = require('@/assets/flowarrow2.png');

let Instance = null;

let _map = null;
let linePointArray = [];
let waterAnimite = null;

class WaterFlowMove {
  init(curMap) {
    _map = curMap;
    let layerNames = ['管网', '水流动画图层', '节点'];
    let layers = _map.getLayers().getArray().filter(p => layerNames.indexOf(p.get('layerName')) > -1);

    layers.forEach(p => {
      _map.removeLayer(p);
    });

    waterAnimite = new ol.layer.Vector({
      layerName: '水流动画图层',
      source: new ol.source.Vector({
        features: []
      }),
      zIndex: 4
    });

    this.addNodes();

    this.addPipeLayer();

    _map.addLayer(waterAnimite);

    if (result) {
      // 展示水流的 id
      let linesStr = result.map(p => {
        let order = p.Link.Flow > 0 ? 1 : 0;
        let item = {
          id: p.Link.Link,
          order: order
        };
        return item;
      });

      // 转换水流方向
      let lines = [];
      linesStr.forEach(j => {
        let line = pipes.features.find(p => p.properties.ID === j.id);
        if (line) {
          var newline = JSON.parse(JSON.stringify(line));
          if (j.order === 0) {
            newline.geometry.coordinates = funTool.reverse(newline.geometry.coordinates);
          }

          lines.push(newline);
        }

      });

      lines.forEach(curLine => {
        let points = [];
        let lineLength = turf.length(curLine, {
          units: 'kilometers'
        });

        let chunkStep = lineLength / 5;
        let chunkLenght = chunkStep < 0.01 ? chunkStep : 0.01;

        let chunk = turf.lineChunk(curLine, chunkLenght, {
          units: 'kilometers'
        });

        chunk.features.forEach(feature => {
          let curPoints = turf.getCoords(feature);

          points.push(curPoints[0]);
        });

        let arrowNum = parseInt(lineLength / 2);
        if (arrowNum < 1) {
          arrowNum = 1;
        }

        let linePoint = {
          points: [],
          values: points
        };

        for (var i = 0; i < arrowNum; i++) {
          var row = {
            id: curLine.properties.ID,
            y: points[0][1],
            x: points[0][0]
          };

          let curPoint = this.addFeature(row);

          linePoint.points.push({
            point: curPoint,
            num: 1
          });
        }

        linePointArray.push(linePoint);
      });
    }
    return waterAnimite;
  }

  stop() {
    // 可以取消该次动画。
    if (Instance) {
      window.clearInterval(Instance);
    }
  }

  start() {
    waterFlowMove.stop();
    Instance = setInterval(function () {
      waterFlowMove.moveFeature();
    }, 100);
  }

  // 开始移动
  moveFeature() {
    if (linePointArray.length > 0) {
      linePointArray.forEach(p => {
        p.points.forEach(p2 => {
          let curPoint = p2.point;

          if (p2.num > p.values.length) {
            p2.num = 1;
          }

          var curc = p.values[p2.num - 1];

          var coord = ol.proj.fromLonLat([curc[0], curc[1]]);
          var s4 = curPoint.getGeometry().getCoordinates();

          var jd = mapTool.getAngle(s4[1], s4[0], coord[1], coord[0]);

          if (jd !== 0) {
            curPoint.setStyle(function () {
              let iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                  src: flowarrow,
                  rotation: jd
                })
              });

              return iconStyle;
            });
          }

          curPoint.getGeometry().setCoordinates(coord);

          p2.num++;
        });
      });
    }
  }

  addPipeLayer() {
    mapTool.addGeojson(pipes, {
      zIndex: 3,
      layerName: '管网',
      style: function (feature) {
        let zoom = _map.getView().getZoom();

        feature.set('layerName', '管网');
        let propert = feature.getProperties();

        let row = result.find(p => p.Link.Link === propert.ID);
        if (row) {
          for (var key in row.Link) {
            if (key !== 'Link') {
              let value = key === 'Flow' ? Math.abs(row.Link[key]) : row.Link[key];
              feature.set(key, value);
            }
          }

          let color = waterFlowMove.getLableColor('管道', row.Link.Velocity);
          let style = new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: color,
              lineCap: 'butt',
              lineJoin: 'square',
              width: 3
            })
          });

          if (zoom > 16) {
            var lableText = propert.LENGTH + '-' + propert.DIAMETER + '-' + row.Link.Velocity;
            lableText += '\n' + Math.abs(row.Link.Flow) + '-' + row.Link.Headloss;
            // eslint-disable-next-line no-undef
            var text = new ol.style.Text({
              font: ' 15px 黑体 New Roman',
              offsetX: 0,
              offsetY: 0,
              placement: 'line',
              text: lableText,
              fill: new ol.style.Fill({
                color: '#168B16'
              })

            });

            style.setText(text);
          }

          let visible = feature.get('visible');
          if (visible !== false) {
            return style;
          }
        }
      }
    });
  }

  addNodes() {
    mapTool.addGeojson(nodes, {
      zIndex: 5,
      layerName: '节点',
      style: function (feature) {
        let propert = feature.getProperties();
        let zoom = _map.getView().getZoom();
        let node = null;
        feature.set('layerName', '节点');

        let row = result.find(p => p.StartNode.Node === propert.ID); // 开始节点取值
        node = row !== undefined ? row.StartNode : node;

        if (!node) {
          row = result.find(p => p.EndNode.Node === propert.ID); // 结束节点取值
          node = row !== undefined ? row.EndNode : node;
        }

        if (node) {
          for (var key in node) {
            if (key !== 'ID') {
              feature.set(key, node[key]);
            }
          }

          var lableText = propert.Pressure + '';

          let color = waterFlowMove.getLableColor('节点', propert.Pressure);

          let style = new ol.style.Style({
            image: new ol.style.Circle({
              radius: 5,
              fill: new ol.style.Fill({
                color: color
              })
            })

          });

          if (zoom > 15) {
            let text = new ol.style.Text({
              font: ' 14px 黑体 New Roman',
              offsetY: 15,
              text: lableText,
              fill: new ol.style.Fill({
                color: '#000'
              })
            });
            style.setText(text);
          }

          return style;
        }
      }
    });
  }

  addFeature(row) {
    let coord = ol.proj.fromLonLat([row.x, row.y]);
    let iconFeature = new ol.Feature({
      geometry: new ol.geom.Point(coord)
    });

    iconFeature.set('id', row.id); // 设置id

    iconFeature.setStyle(function () {
      let iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
          src: flowarrow
        }),
        stroke: new ol.style.Stroke({
          color: 'red',
          width: 2
        })
      });

      return iconStyle;
    });

    waterAnimite.getSource().addFeature(iconFeature);

    return iconFeature;
  }

  getLableColor(key, num) {
    let color = '#fff';
    let curLable = hydraulicModelConfig.find(p => p.key === key);
    if (curLable) {
      curLable.lables.forEach(p => {
        if (p.name.indexOf('~') > -1) {
          let nums = p.name.split('~');
          if (nums.length === 2) {
            if (num >= parseFloat(nums[0]) && num < parseFloat(nums[1])) {
              color = p.color;
            }
          }
        } else if (p.name.indexOf('>') > -1) {
          if (num > parseFloat(p.name.replace('>', ''))) {
            color = p.color;
          }
        } else if (p.name.indexOf('<') > -1) {
          if (num < parseFloat(p.name.replace('<', ''))) {
            color = p.color;
          }
        }
      });
      return color;
    }
  }
}

export const waterFlowMove = new WaterFlowMove();