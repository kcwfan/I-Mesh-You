import React from 'react';
import Popup from './Popup.jsx'
import Legend from './Legend.jsx'
import Search from './Search.jsx';
const ReactDOM = require('react-dom');
//const L = require('leaflet');
//require('leaflet.markercluster');

var config = {};
var marker;

config.params = {
	center: [32.5220242,-102.2896495],
	zoomControl: false,
	zoom: 4,
	maxZoom: 12,
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

var PrimIcon = new L.icon({
	iconUrl: 'primary.png',
	iconSize: [60,60],
	iconAnchor: [30,30]
});

var PotIcon = new L.icon({
	iconUrl: 'potential.png',
	iconSize: [60,60],
	iconAnchor: [30,30]
});


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
	zoom: null,

	componentDidMount: function() {
		this.getData();
		if(!this.map) this.init(this.getID());
	},


	componentWillUnmount: function() {
		this.map.remove();
	},


	updateMap: function() {
		this.setState({lasAdd: "hi"});
	},

	componentWillReceiveProps(nextProps) {
		config.params.center[0] = nextProps.lon;
		config.params.center[1] = nextProps.lat;
		this.map.setView([nextProps.lat, nextProps.lon], 11);
	},

	getData: function() {
		console.log('get data');
		var self = this;
		$.get('/mapData', function(data) {
			self.addGeoJSONLayer(data);
			console.log("Map getData(): ", data);
		});
	},


	addGeoJSONLayer: function(data) {
		

		if(this.state.geojsonLayer && data) {
			console.log('inside clear')
			this.state.geojsonLayer.clearLayers();
		}

		this.setState({geojson: data});
		var geojsonLayer = L.geoJson(data, {
			// popup here if needed later
			pointToLayer: this.pointToLayer
		});
		var markers = new L.MarkerClusterGroup(
			{
				disableClusteringAtZoom: 10,
       			maxClusterRadius: 100,
       			spiderfyOnMaxZoom: false,
       			showCoverageOnHover: false
			});

		markers.addLayer(geojsonLayer);
		
		this.map.addLayer(markers);
		this.setState({geojsonLayer: geojsonLayer});
	},



	pointToLayer: function(feature, latlng) {

		if (feature.properties.name === 'Primary Location') {
			marker = L.marker(latlng, {icon: PrimIcon});
			return marker;

		} else {
			return L.marker(latlng, {icon: PotIcon});
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