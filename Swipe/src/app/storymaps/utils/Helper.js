define(["dojo/cookie",
		"dojo/has",
		"esri/arcgis/utils",
		"esri/urlUtils",
		"esri/geometry/webMercatorUtils",
		"esri/geometry/Point",
		"esri/geometry/Extent",
		"esri/geometry/Polygon",
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/layers/ArcGISTiledMapServiceLayer",
		"esri/layers/OpenStreetMapLayer"],
	function(
		cookie,
		has,
		arcgisUtils,
		urlUtils,
		webMercatorUtils,
		Point,
		Extent,
		Polygon,
		ArcGISDynamicMapServiceLayer,
		ArcGISTiledMapServiceLayer,
		OpenStreetMapLayer)
	{
		/**
		 * Helper
		 * @class Helper
		 *
		 * Collection of helper functions
		 */
		return {
			isMobile: function()
			{
				return navigator.userAgent.match(/iPhone|iPad|iPod/i)
						|| navigator.userAgent.match(/Android/i)
						|| navigator.userAgent.match(/BlackBerry/i)
						|| navigator.userAgent.match(/IEMobile/i);
			},
			browserSupportHistory: function()
			{
				return !!(window.history && history.pushState);
			},
			// Get URL parameters IE9 history not supported friendly
			getUrlParams: function()
			{
				var urlParams = urlUtils.urlToObject(document.location.search).query;
				if ( urlParams )
					return urlParams;

				if( ! this.browserSupportHistory() && ! urlParams )
					return urlUtils.urlToObject(document.location.hash).query || {};

				return {};
			},
			getWebmapsIDs: function(isProd)
			{
				var urlParams = urlUtils.urlToObject(document.location.search).query || {};
				var webmaps = urlParams.webmaps;

				if( webmaps && webmaps.indexOf(',') != -1) {
					configOptions.layerIndex = 0;
					return webmaps.split(',');
				}
				else if( urlParams.webmap && urlParams.webmap.indexOf(',') != -1) {
					configOptions.layerIndex = 0;
					return urlParams.webmap.split(',');
				}
				else if ( urlParams.webmaps ) {
					configOptions.layerIndex = 0;
					return [urlParams.webmaps];
				}
				else if ( urlParams.webmap ) {
					configOptions.layerIndex = 0;
					return [urlParams.webmap];
				}
				else if ( configOptions && configOptions.webmaps && configOptions.webmaps.length && configOptions.webmaps[0]  )
					return configOptions.webmaps;
				else
					return "";
			},
			getAppID: function(isProd)
			{
				var urlParams = urlUtils.urlToObject(document.location.search).query || {};

				if( configOptions && configOptions.appid )
					return configOptions.appid;

				if ( this.isArcGISHosted() || ! isProd )
					return urlParams.appid;

				// Only authorize URL params outside of arcgis.com if a webmap/app owner is specified
				if( configOptions.authorizedOwners && configOptions.authorizedOwners.length > 0 && configOptions.authorizedOwners[0] )
					return urlParams.appid;
			},
			getSharingHost: function() {
 				var urlParams = urlUtils.urlToObject(document.location.search).query || {};

 				if (urlParams.sharinghost) {
 					return '//' + urlParams.sharinghost;
 				}
 				else {
 					return '';
 				}
 			},
			isArcGISHosted: function()
			{
				return (/(\/apps\/|\/home\/)(StorytellingSwipe\/)/).test(document.location.pathname);
			},
			getBlankAppJSON: function()
			{
				return {
					"itemType": "text",
					"guid": null,
					"name": null,
					"type": "Web Mapping Application",
					"typeKeywords": ["JavaScript", "Map", "Mapping Site", "Online Map", "Ready To Use", "selfConfigured", "Web Map", "Story Maps", "SwipeSpyglass"],
					"description": null,
					"tags": ["Story Map", "Swipe", "Spyglass"],
					"snippet": null,
					"thumbnail": "thumbnail/ago_downloaded.png",
					"documentation": null,
					"extent": [],
					"lastModified": -1,
					"spatialReference": null,
					"accessInformation": null,
					"licenseInfo": null,
					"culture": "en-us",
					"properties": null,
					/*"url": "http://story.maps.arcgis.com/apps/MapTour/index.html?appid=353325e3cd4d4059b3e1972d00c210e0&webmap=2972b44e39314972807f683215cf0652",*/
					"size": 116,
					"appCategories": [],
					"industries": [],
					"languages": [],
					"largeThumbnail": null,
					"banner": null,
					"screenshots": [],
					"listed": false,
					"ownerFolder": null,
					"commentsEnabled": true,
					"numComments": 0,
					"numRatings": 0,
					"avgRating": 0.0,
					"numViews": 1
				};
			},
			getGraphicsLayerByName: function(map, name)
			{
				var layer;
				for (var i = 0; i < map.graphicsLayerIds.length; i++) {
					layer = map.getLayer(map.graphicsLayerIds[i]);
					if (layer.name == name)
						return layer;
				}
				return null;
			},
			getWebMapExtentFromItem: function(item)
			{
				if( ! item.extent || item.extent.length != 2 )
					return null;

				var bottomLeft = webMercatorUtils.geographicToWebMercator(
					new Point(
						item.extent[0][0],
						item.extent[0][1]
					)
				);

				var topRight = webMercatorUtils.geographicToWebMercator(
					new Point(
						item.extent[1][0],
						item.extent[1][1]
					)
				);

				return new Extent({
					xmax: topRight.x,
					xmin: bottomLeft.x,
					ymax: topRight.y,
					ymin: bottomLeft.y,
					spatialReference: {
						wkid: 102100
					}
				});
			},
			serializeExtentToItem: function(extent)
			{
				if( ! extent || ! extent.spatialReference )
					return null;

				var extentWgs = extent.spatialReference.wkid == 4326 ? extent : webMercatorUtils.webMercatorToGeographic(extent);

				return [
					[Math.round(extentWgs.xmin*10000)/10000, Math.round(extentWgs.ymin*10000)/10000],
					[Math.round(extentWgs.xmax*10000)/10000, Math.round(extentWgs.ymax*10000)/10000]
				];
			},
			serializedExtentEquals: function(extent1, extent2)
			{
				return extent1
						&& extent2
						&& extent1.length == extent2.length
						&& extent1.length == 2
						&& extent1[0][0] == extent2[0][0]
						&& extent1[0][1] == extent2[0][1]
						&& extent1[1][0] == extent2[1][0]
						&& extent1[1][1] == extent2[1][1];
			},
			/*
			 * Clone Bing/OSM/Tile/Dynamic Map layer
			 * Default to light grey canvas if bing or not tile/dynamic
			 */
			cloneLayer: function(layer)
			{
				if( layer.url && layer.url.match(/virtualearth\./) )
					return new ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer");
				else if(layer instanceof ArcGISTiledMapServiceLayer)
					return new ArcGISTiledMapServiceLayer(layer.url);
				else if (layer instanceof ArcGISDynamicMapServiceLayer)
					return new ArcGISDynamicMapServiceLayer(layer.url);
				else if (layer.id == "OpenStreetMap")
					return new OpenStreetMapLayer();

				return new ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer");
			},
			extentToPolygon: function(extent)
			{
				var p = new Polygon(extent.spatialReference);
				p.addRing(
					[
						[extent.xmin, extent.ymin],
						[extent.xmin, extent.ymax],
						[extent.xmax, extent.ymax],
						[extent.xmax, extent.ymin],
						[extent.xmin, extent.ymin]
					]
				);
				return p;
			},
			getFirstLevelWhereExtentFit: function(extent, map)
			{
				var mapWidth = map.width;
				var mapHeight = map.height;
				var lods = map._params.lods;

				for (var l = lods.length - 1; l >= 0; l--) {
					if( mapWidth * map._params.lods[l].resolution > extent.getWidth() && mapHeight * map._params.lods[l].resolution > extent.getHeight() )
						return l;
				}

				return -1;
			},
			getPortalUser: function()
			{
				var esriCookie = cookie('esri_auth');
				if( ! esriCookie )
					return;

				esriCookie = JSON.parse(esriCookie.replace('"ssl":undefined','"ssl":""'));

				// If the cookie is not set on the same organization
				if( esriCookie.urlKey
						&& esriCookie.customBaseUrl
						&& (esriCookie.urlKey + '.' + esriCookie.customBaseUrl).toLowerCase() != document.location.hostname.toLowerCase())
					return;

				return esriCookie ? esriCookie.email : null;
			},
			getPortalRole: function()
			{
				var esriCookie = cookie('esri_auth');

				if( ! esriCookie )
					return;

				esriCookie = JSON.parse(esriCookie.replace('"ssl":undefined','"ssl":""'));

				// If the cookie is not set on the same organization
				if( esriCookie.urlKey
						&& esriCookie.customBaseUrl
						&& (esriCookie.urlKey + '.' + esriCookie.customBaseUrl).toLowerCase() != document.location.hostname.toLowerCase())
					return;

				return esriCookie ? esriCookie.role : null;
			},
			getMyStoriesURL: function()
			{
				if ( app.isPortal ){
					return arcgisUtils.arcgisUrl.split('/sharing/')[0] + '/apps/MyStories/';
				}
				else {
					return '//storymaps.arcgis.com/en/my-stories/';
				}
			},
			getWebmapViewerLinkFromSharingURL: function(sharingUrl)
			{
				var portalUrl = sharingUrl.split('/sharing/')[0];
				return portalUrl + '/home/webmap/viewer.html';
			},
			getItemURL: function(sharingUrl, id)
			{
				var portalUrl = sharingUrl.split('/sharing/')[0];
				return portalUrl + '/home/item.html?id=' + id;
			},
			getMyContentURL: function(sharingurl)
			{
				return sharingurl.split('/sharing/')[0] + '/home/content.html';
			},
			browserSupportAttachementUsingFileReader: function()
			{
				return !! window.FileReader
						&& !! window.FormData
						&& !! this.browserSupportCanvas()
						&& !! window.Blob
						/*&& has("ie") != 10*/; // IE10 unexpectedly fail to do the addAttachment request (with CORS or proxy)
			},
			browserSupportCanvas: function()
			{
				var elem = document.createElement('canvas');
				return !!(elem.getContext && elem.getContext('2d'));
			},
			browserSupportFileReaderBinaryString: function()
			{
				if( ! window.FileReader )
					return false;

				var f = new window.FileReader();
				return !! ('readAsArrayBuffer' in f);
			},
			getBinaryStringFromArrayBuffer: function(file)
			{
				var arr = new Uint8Array(file);
				var str = '';
				for (var i = 0; i < arr.length; i++)
					str += String.fromCharCode(arr[i]);
				return str;
			},
			addCSSRule: function(style)
			{
				if( has("ie") <= 8 )
					return;

				$("<style>")
			    	.prop("type", "text/css")
			    	.html(style)
			    	.appendTo("head");
			},
			hex2rgba: function(x, a)
			{
				var r = x.replace('#','').match(/../g),g=[],i;
				for(i in r){
					g.push(parseInt(r[i],16));
				}
				g.push(a);
				return 'rgba('+g.join()+')';
			},
			prependURLHTTP: function(url)
			{
				if ( ! url || url == "" || url.match(/^mailto:/))
	        		return url;

				if ( ! /^(https?:\/\/)|^(\/\/)/i.test(url) )
					return 'http://' + url;

				return url;
	        },
		};
	}
);
