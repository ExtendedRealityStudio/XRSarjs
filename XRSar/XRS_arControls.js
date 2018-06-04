var THREEx = THREEx || {};
var XRSar = XRSar || {};

XRSar.ArControlsStateEnum = {
    HIDDEN: 0,
    SNAP_IN_PLACE: 1,
    TRACKING: 2,
    UNTRACKED: 3,
    LERPING_IN_PLACE: 4
};

XRSar.ArControls = function(object3d, parameters){
    var _this = this;

    THREEx.ArBaseControls.call(this, object3d);

    this.object3d.visible = false;
    this.firstMarkerFound = false;
    
    this.arControlsState = XRSar.ArControlsStateEnum.HIDDEN;

    this._lastLerpStepAt = null;
    this._visibleStartedAt = null;
    this._unvisibleStartedAt = null;
    
    

    parameters = parameters || {};
    this.parameters = {
        // lerp coeficient for the position - between [0,1] - default to 1
		lerpPosition: 0.8,
		// lerp coeficient for the quaternion - between [0,1] - default to 1
		lerpQuaternion: 0.2,
		// lerp coeficient for the scale - between [0,1] - default to 1
		lerpScale: 0.7,
		// delay for lerp fixed steps - in seconds - default to 1/120
		lerpStepDelay: 1/60,
		// minimum delay the sub-control must be visible before this controls become visible - default to 0 seconds
		minVisibleDelay: 0.0,
		// minimum delay the sub-control must be unvisible before this controls become unvisible - default to 0 seconds
		minUnvisibleDelay: 0.2,
    };

    setParameters(parameters);
    function setParameters(parameters){
        if(parameters === undefined)return;

        for(var key in parameters){
            var newValue = parameters[ key ]

			if( newValue === undefined ){
				console.warn( "XRSar.ArSmoothedControls: '" + key + "' parameter is undefined." )
				continue
			}

			var currentValue = _this.parameters[ key ]

			if( currentValue === undefined ){
				console.warn( "XRSar.ArSmoothedControls: '" + key + "' is not a property of this material." )
				continue
			}

			_this.parameters[ key ] = newValue
        }
    };

    
};

XRSar.ArControls.prototype.onMarkerLost = function(){
    //this.arControlsState = XRSar.ArControlsStateEnum.UNTRACKED;
};

XRSar.ArControls.prototype.onNewMarker = function(){
    if(!this.firstMarkerFound){
        this.firstMarkerFound = true;
        this.object3d.visible = true;

        this.arControlsState = XRSar.ArControlsStateEnum.SNAP_IN_PLACE;
    }else{
        //this.arControlsState = XRSar.ArControlsStateEnum.LERPING_IN_PLACE;
    }
};

XRSar.ArControls.prototype.update = function(targetObject3d){
    var object3d = this.object3d;
    var parameters = this.parameters;
    var wasVisible = object3d.visible;
    var present = performance.now()/1000;
    
    switch(this.arControlsState){
        case XRSar.ArControlsStateEnum.HIDDEN:
            break;
        case XRSar.ArControlsStateEnum.SNAP_IN_PLACE:
            snapInPlace();
            this.arControlsState = XRSar.ArControlsStateEnum.TRACKING;
            break;
        case XRSar.ArControlsStateEnum.TRACKING:
            if( this._lastLerpStepAt === null ){
		        applyOneSlerpStep()
		        this._lastLerpStepAt = present
	        }else{
		        var nStepsToDo = Math.floor( (present - this._lastLerpStepAt)/this.parameters.lerpStepDelay )
		        for(var i = 0; i < nStepsToDo; i++){
			        applyOneSlerpStep()
			        this._lastLerpStepAt += this.parameters.lerpStepDelay
		        }
	        }
	        this.object3d.updateMatrix();
            break;
        /*case XRSar.ArControlsStateEnum.UNTRACKED:
            
            break;
        case XRSar.ArControlsStateEnum.LERPING_IN_PLACE:
            if( this._lastLerpStepAt === null ){
		        applyOneSlerpStep()
		        this._lastLerpStepAt = present
	        }else{
		        var nStepsToDo = Math.floor( (present - this._lastLerpStepAt)/this.parameters.lerpStepDelay )
		        for(var i = 0; i < nStepsToDo; i++){
			        applyOneSlerpStep()
			        this._lastLerpStepAt += this.parameters.lerpStepDelay
		        }
	        }
	        this.object3d.updateMatrix();
            break;*/
        default:
            break;
    }
    
    /*function updateTracking(_present){
        if( this._lastLerpStepAt === null ){
		    applyOneSlerpStep()
		    this._lastLerpStepAt = present
	    }else{
	        var nStepsToDo = Math.floor( (_present - this._lastLerpStepAt)/this.parameters.lerpStepDelay )
	        for(var i = 0; i < nStepsToDo; i++){
		        applyOneSlerpStep()
		        this._lastLerpStepAt += this.parameters.lerpStepDelay
	       }
	    }
	    this.object3d.updateMatrix();
    }*/

    function snapInPlace(){
        object3d.position.copy( targetObject3d.position );
        object3d.quaternion.copy( targetObject3d.quaternion );
        object3d.scale.copy( targetObject3d.scale );
        object3d.updateMatrix();
    }

    function applyOneSlerpStep(){
		object3d.position.lerp(targetObject3d.position, parameters.lerpPosition)
		object3d.quaternion.slerp(targetObject3d.quaternion, parameters.lerpQuaternion)
		object3d.scale.lerp(targetObject3d.scale, parameters.lerpScale)
	}

};
