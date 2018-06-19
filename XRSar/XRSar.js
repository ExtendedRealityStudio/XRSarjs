var THREEx = THREEx || {};
var XRSar = XRSar || {};

XRSar.MarkerStateEnum = {
    MARKER_NOT_FOUND: 0,
    MARKER_JUST_LOST: 1,
    MARKER_JUST_FOUND: 2,
    MARKER_FOUND: 3
};

//three.js ---
XRSar.ThreeJsContext = function(){
    var _this = this;

    this.renderer;
    this.scene;
    this.camera;
};

XRSar.ThreeJsContext.prototype.init = function(){
    this.renderer = new THREE.WebGLRenderer({alpha: true});
    this.renderer.setClearColor(new THREE.Color('white'), 0);
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0px'
    this.renderer.domElement.style.left = '0px'
    document.body.appendChild( this.renderer.domElement );
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    
    this.scene.add(this.camera);
}

//--- three.js

//artoolkit---
XRSar.ARToolKit = function(){
    var _this = this;
    
    this.arToolkitSource;
    this.arToolkitContext;

}

XRSar.ARToolKit.prototype.onResize = function(_tjsContext){
    this.arToolkitSource.onResize()
    this.arToolkitSource.copySizeTo(_tjsContext.renderer.domElement)
    if( this.arToolkitContext.arController !== null ){
        this.arToolkitSource.copySizeTo(this.arToolkitContext.arController.canvas)
    }

}

XRSar.ARToolKit.prototype.init = function(_tjsContext){
    var _this = this;
    this.arToolkitSource = new THREEx.ArToolkitSource({sourceType : 'webcam'});
    this.arToolkitSource.init(onReady);
    window.addEventListener('resize', function(){_this.onResize(_tjsContext);});

    this.arToolkitContext = new THREEx.ArToolkitContext({
                                                   cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
                                                   detectionMode: 'mono',
                                                   maxDetectionRate: 30,
                                                   canvasWidth: 80*3,
                                                   canvasHeight: 60*3
                                                   });

    this.arToolkitContext.init(onCompleted);

    function onReady(){
        _this.onResize(_tjsContext);
    }

    function onCompleted(){
        _tjsContext.camera.projectionMatrix.copy(_this.arToolkitContext.getProjectionMatrix());
    }
}
//---artoolkit

//marker---
XRSar.Marker = function(){
    var _this = this;

    this.markerRoot;
    this.artoolkitMarker;
    this.smoothedRoot;
    this.smoothedControls;
}

XRSar.Marker.prototype.init = function(_tjsContext, _atk){
    this.markerRoot = new THREE.Group();
    _tjsContext.scene.add(this.markerRoot);
    this.artoolkitMarker = new THREEx.ArMarkerControls(_atk.arToolkitContext, this.markerRoot, {
        type : 'pattern',
        patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/XRSmarker.patt'
    });

    this.smoothedRoot = new THREE.Group();
    _tjsContext.scene.add(this.smoothedRoot);

    this.smoothedControls = new XRSar.ArControls(this.smoothedRoot, {
        lerpPosition: 0.4,
        lerpQuaternion: 0.3,
        lerpScale: 1
    });
}
//---marker

XRSar.Ar = function(){
    var _this = this;
    
    this.curMarkerState = XRSar.MarkerStateEnum.MARKER_NOT_FOUND;
    this.onRenderFcts = [];
    this.lastTimeMsec = null;
    this.lastTimeMarkerEvent = 0;
    this.maxTimeMarkerEvent = 1000/30;

    this.arWorldRoot;
    
    this.threeJsContext = new XRSar.ThreeJsContext();
    this.artoolkit = new XRSar.ARToolKit();
    this.marker = new XRSar.Marker();
};

XRSar.Ar.prototype.initSingleMarker = function(){
    var _this = this;
    _this.threeJsContext.init();
    _this.artoolkit.init(_this.threeJsContext);
    _this.addARToolkitCallbacks();
    _this.marker.init(_this.threeJsContext, _this.artoolkit);
    _this.addMarkerCallbacks();
}

XRSar.Ar.prototype.addARToolkitCallbacks = function(){
    this.onRenderFcts.push(function(){
        if(this.artoolkit.arToolkitSource.ready === false) return;
        this.artoolkit.arToolkitContext.update(this.artoolkit.arToolkitSource.domElement);
    });
}

XRSar.Ar.prototype.addMarkerCallbacks = function(){
    this.marker.artoolkitMarker.addEventListener('markerFound', this.onMarkerEvent);
    
    this.onRenderFcts.push(function(delta){
        this.marker.smoothedControls.update(this.marker.markerRoot);
    });

    this.arWorldRoot = this.marker.smoothedRoot;
}

XRSar.Ar.prototype.onMarkerEvent = function(){
    this.lastTimeMarkerEvent = this.lastTimeMsec;
}

XRSar.Ar.prototype.startLoop = function(){
    var _this = this;
    this.onRenderFcts.push(function(){
        this.threeJsContext.renderer.render(this.threeJsContext.scene, this.threeJsContext.camera);
    });
    this.onRenderFcts.push(this.updateMarker);
    //requestAnimationFrame(this.animate);
    
    requestAnimationFrame(animate);

    function animate(nowMsec){
        requestAnimationFrame(animate);
        _this.lastTimeMsec = _this.lastTimeMsec || nowMsec-1000/60;
        var deltaMsec = Math.min(200, nowMsec - _this.lastTimeMsec);
        _this.lastTimeMsec = nowMsec;
    }
}

XRSar.Ar.prototype.onMarkerLost = function(){
    console.log('marker lost');
    this.marker.smoothedControls.onMarkerLost();
}

XRSar.Ar.prototype.onNewMarker = function(){
    console.log("new marker");
    this.marker.smoothedControls.onNewMarker();
}

XRSar.Ar.prototype.updateMarker = function(){
    var d = this.lastTimeMsec-this.lastTimeMarkerEvent;
    if(d>this.maxTimeMarkerEvent){
        if(this.curMarkerState>XRSar.MarkerStateEnum.MARKER_JUST_LOST){
            this.curMarkerState = XRSar.MarkerStateEnum.MARKER_JUST_LOST;
            this.onMarkerLost();
        }else{
            this.curMarkerState = XRSar.MarkerStateEnum.MARKER_NOT_FOUND;
        }
    }else{
        if(this.curMarkerState<XRSar.MarkerStateEnum.MARKER_JUST_FOUND){
            this.curMarkerState = XRSar.MarkerStateEnum.MARKER_JUST_FOUND;
            onNewMarker();
        }else{
            this.curMarkerState = XRSar.MarkerStateEnum.MARKER_FOUND;
        }
    }
}
