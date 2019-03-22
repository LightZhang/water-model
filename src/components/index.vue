<template >
  <div class="map-view">

    <div id="city_map2" class="map" style="flex:1;"></div>

    <div id="popup"></div>

    <div class="legend-box" v-if="legends">
      <div class="legend-ul" v-for="legend in  legends" :key="legend.name">
        <strong>{{legend.name}}</strong>
        <ul>
          <li v-for="row in  legend.lables" :class="row.isEnable==false?'legend-li usable':'legend-li'  " :key="row.name"
            @click="setLayer($event,row)">
            <div :class="row.className" :style="{'background-color':(row.color!=null? row.color:'none'),'border-color':(row.color!=null? row.color:'none') }"></div>
            <label class="lableBox">{{row.name}}</label>
          </li>
        </ul>
      </div>
    </div>

    <div class="legend-box legend2">
      <strong>管径标注</strong>
      <ul>
        <li style="border-bottom:solid 2px">管长(m)-管径(mm)-流速(m/s)</li>
        <li>流量(m³/h)-单位水头损失(m/km)</li>
      </ul>
    </div>

  </div>
</template>
<script>
import hydraulicModelConfig from './data/config/图例水力模型.json';
import funTool from '../libs/funTool';
import { mapTool } from '../libs/mapTool';
import { waterFlowMove } from './js/waterFlowMove';
import { debug, debuglog } from 'util';



let IsFrist = null;

export default {
  name: 'pipe',
  data() {
    return {
      map: null,
      popupObj: null,
      legends: null,
      lastDay: null
    };
  },
  components: {

  },
  mounted() {
    var _this = this;
    this.$nextTick(function () {
      _this.init();
    });

  },
  beforeDestroy() {

  },
  methods: {
    init: function () {
      var _this = this;
      _this.legends = hydraulicModelConfig;

      $('#city_map2').html('');
      _this.map = mapTool.init({
        target: 'city_map2',
        minZoom: 13,
        center: ol.proj.transform([115.7493281, 33.83495194], 'EPSG:4326', 'EPSG:3857'),
        zoom: 15
      });

      waterFlowMove.init(_this.map);

      waterFlowMove.start();

      _this.bindEvent();


      _this.popupObj = mapTool.addOverlay(document.getElementById('popup'));

    },
    bindEvent() {
      let _this = this;
      _this.map.on('click', function (evt) {
        let coordinate = evt.coordinate;
        let IsFrist = true;
        _this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
          let layerName = feature.get('layerName');
          if (feature && layerName != undefined) {
            if (IsFrist) {
              IsFrist = false;
              let propert = feature.getProperties();
              console.log(propert.ID);
              propert.flow = feature.get("flow");
              _this.setpropertHtml(coordinate, layerName, propert);
            }
          }
        });
      });

      let curWaterModelLayer = _this.map.getLayers().getArray().find(p => p.get("layerName") === "水流动画图层")
      isShowWaterModelLayer();
      _this.map.getView().on("change:resolution", function () {
        isShowWaterModelLayer();
      });

      function isShowWaterModelLayer() {
        let zoom = _this.map.getView().getZoom();
        if (zoom > 14) {
          curWaterModelLayer.setVisible(true);
        }
        else {
          curWaterModelLayer.setVisible(false);
        }
      }

    },
    setpropertHtml(coordinate, layerName, propert) {
      let _this = this;
      let param = {};
      if (layerName === "管网") {
        param = { "DIAMETER": "管径(mm)", "LENGTH": "管长(m)", "Velocity": "流速(m/s)", "Flow": "流量(m³/h)", "Headloss": "单位水头损失(m/km)" };
      }
      else if (layerName === "节点") {
        param = { "Demand": "节点流量(m³/h)", "ELEVATION": "节点标高(m)", "Head": "节点水头(m)", "Pressure": "自由水压(m)" };
      }


      mapTool.getpropertHtml(propert, param, function (html) {
        if (html) {
          _this.popupObj.content.innerHTML = html;
          _this.popupObj.overlay.setPosition(coordinate);
        }
      });
    }
  }
};
</script>
<style lang="css" scoped>
.map-view {
  height: 100%;
  flex: 1;
}

.legend-ul {
  margin-top: 10px;
}

.legend-box {
  bottom: 105px;
  width: 120px;
  position: absolute;
  left: 10px;
  font-size: 12px;
  width: 150px;
  background-color: rgba(4, 51, 82, 0.6);
  border-radius: 3px;
  padding: 3px;
  color: #fff;
  padding: 10px;
}
.legend2 {
  bottom: 5px;
  width: 220px;
}

.fillet {
  width: 13px;
  height: 13px;
}
.ol-popup {
  position: absolute;
  background-color: #fff;
  -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #ccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
  font-size: 10px;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
}
</style>
