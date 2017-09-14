define(['dojo/topic'],
  function(topic) {
    topic.subscribe("SWIPE_READY", function() {
      require(['maptiks'], function (mapWrapper) {
        if (app.data.getWebAppData().values.maptiks) {
          var appMaps = app.maps.length > 0 ? app.maps : [app.map];
          for (var i=0;i<appMaps.length;i++) {
            var container = appMaps[i].container;
            var maptiksMapOptions = {
                maptiks_trackcode: app.data.getWebAppData().values.maptiks.maptiksTrackcode, // from Builder map options
                maptiks_id: app.data.getWebAppData().values.maptiks.maptiksId + ":" + appMaps[i].id // from Builder map options, ID:mapID
            };
            mapWrapper(container, maptiksMapOptions, appMaps[i]);
          }
        }
        topic.publish('maptiks-ready', mapWrapper);
      });
    });
  }
);