import React from 'react';
import Popup from './Popup.jsx'
import Legend from './Legend.jsx'
import Search from './Search.jsx';

const ReactDOM = require('react-dom');
const L = require('leaflet');

var config = {};


config.params = {
	center: [38.180546,-98.3345714],
	zoomControl: false,
	zoom: 4,
	maxZoom: 19,
	minZoom: 3,
	scrollwheel: false,
	scrollWheelZoom: false,
	legends: true,
	infoControl: false,
	attributionControl: true
}

config.tileLayer = {
  uri: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  params: {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    id: '',
    accessToken: ''
  }
};


const Map = React.createClass({
	
	getInitialState: function() {
		return {
			tileLayer: null,
			geojsonLayer: null,
			geojson: null
		};
	},


	map: null,
	primCol: '#66a61e',
	potCol: '#e7298a',



	componentDidMount: function() {
		this.getData();
		if(!this.map) this.init(this.getID());
	},


	componentWillUnmount: function() {
		this.map.remove();
	},


	updateMap: function() {
		this.setState({lasAdd: "hi"});
		console.log('map update state runs');
	},

	componentWillReceiveProps(nextProps) {
		console.log("next props: ", nextProps.lat, nextProps.lon, typeof(nextProps.lat));
		config.params.center[0] = nextProps.lon;
		config.params.center[1] = nextProps.lat;
		this.map.setView([nextProps.lat, nextProps.lon], 9);
	},

	getData: function() {
		var self = this;
		$.get('/mapData', function(data) {
			self.addGeoJSONLayer(data);
			console.log("Map getData(): ", data);
		});
	},


	addGeoJSONLayer: function(data) {
		
		if(this.state.geojsonLayer && data) {
			this.state.geojsonLayer.clearLayers();
		}

		this.setState({geojson: data});
		var geojsonLayer = L.geoJson(data, {
			// popup here if needed later
			pointToLayer: this.pointToLayer
		});
		geojsonLayer.addTo(this.map);
		this.setState({geojsonLayer: geojsonLayer});

	},



	pointToLayer: function(feature, latlng) {

		var primaryParams = {
			fillColor: this.primCol,
			weight: 0,
			opacity: 0.8,
			fillOpacity: 0.6
		};

		var potentialParams = {
			fillColor: this.potCol,
			weight: 0,
			opacity: 0.8,
			fillOpacity: 0.6
		}

		const halfMileMeter = 804;

		if (feature.properties.name === 'Primary Location') {
			return L.circle(latlng, halfMileMeter, primaryParams);
		} else {
			return L.circle(latlng, halfMileMeter, potentialParams);
		}
	},


	onEachFeature: function(feature, layer) {
		var popup = '<div><p>'+feature.properties.name+'</p></div>';
		layer.bindPopup(popup);
	},


	getID: function() {
		return ReactDOM.findDOMNode(this).querySelectorAll('#map')[0];
	},


	init: function(id) {
		if (this.map) return;
		
		this.map = L.map(id, config.params);
	    L.control.zoom({ position: "bottomleft"}).addTo(this.map);
	    L.control.scale({ position: "bottomright"}).addTo(this.map);

	    var tileLayer = L.tileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(this.map);
		this.setState({ tilelayer: tileLayer });
	},


	render: function() {
		return (
			<div id="mapUI">
				<Popup updater={()=>this.getData()}/>
				<Legend potCol={this.potCol} primCol={this.primCol} />
				<div id="map"></div>
			</div>
		);
	}

});


export default Map;