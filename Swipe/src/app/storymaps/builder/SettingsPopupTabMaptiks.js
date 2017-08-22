define([], 
	function () {
		return function SettingsPopupTabMaptiks(titleContainer, contentcontainer) 
		{
			this.init = function(settings) 
			{	
              $("#maptiks-trackcode").prop("value", settings.maptiks.maptiksTrackcode);
              $("#maptiks-id").prop("value", settings.maptiks.maptiksId);
			};
			
			this.show = function()
			{
				// 
			};
			
			this.save = function()
			{		
                return {
					maptiksTrackcode: $(contentcontainer).find("#maptiks-trackcode").prop("value"),
                    maptiksId: $(contentcontainer).find("#maptiks-id").prop("value")
				};
			};

			this.initLocalization = function()
			{
				$(titleContainer).html('Maptiks');
				$(contentcontainer).find('.form-horizontal p').eq(0).html('Enter your Maptiks trackcode and an ID for this story map.');
                $(contentcontainer).find('.control-label').eq(0).html('Maptiks trackcode:');
                $(contentcontainer).find('.control-label').eq(1).html('Maptiks ID:');
			};
		};
	}
);