//////////////////////
// USAGE:
//
// Import:
// - three.js
// - ar.js
//
// Set THREEx.ArToolkitContext.baseURL
// es: <script>THREEx.ArToolkitContext.baseURL = './ar/'</script>
//
// SINGLE MARKER:
//      XRSAR.initSingleMarker();
//
//      //add your stuff here
//
//      XRSAR.startLoop();

var XRSAR = new function(){
    this.renderer;
    this.onRenderFcts = [];
    this.scene;
    this.camera;
    this.controls;

    this.arToolkitSource;
    this.arToolkitContext;

    this.bTracking = false;
    this.markerRoot;
    this.artoolkitMarker;
    this.smoothedRoot;
    this.smoothedControls;

    this.arWorldRoot;

    this.lastTimeMsec = null;
    
    this.initSingleMarker = function(){
        this.initThreeJs();
        //this.initARToolKit();
        //this.initMarker();
    };

    this.initThreeJs = function(){
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
    };

    this.initARToolKit = function(){
        this.arToolkitSource = new THREEx.ArToolkitSource({sourceType : 'webcam'});
        this.arToolkitSource.init(function onReady(){this.onResize();});
        window.addEventListener('resize', function(){this.onResize();});
    
        this.arToolkitContext = new THREEx.ArToolkitContext({
                                                   cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
                                                   detectionMode: 'mono',
                                                   maxDetectionRate: 30,
                                                   canvasWidth: 80*3,
                                                   canvasHeight: 60*3
                                                   });
    
        //this.arToolkitContext.init(function onCompleted(){this.camera.projectionMatrix.copy(this.arToolkitContext.getProjectionMatrix());});
    
        this.arToolkitContext.init(function onCompleted(){
            this.camera.projectionMatrix;
        });

        this.onRenderFcts.push(function(){
                      if(this.arToolkitSource.ready === false) return;
                        this.arToolkitContext.update(this.arToolkitSource.domElement);
                      });

    };

    this.onResize = function(){
        this.arToolkitSource.onResize()
        this.arToolkitSource.copySizeTo(this.renderer.domElement)
        if( this.arToolkitContext.arController !== null ){
            this.arToolkitSource.copySizeTo(this.arToolkitContext.arController.canvas)
        }
    };

    this.initMarker = function(){
        this.markerRoot = new THREE.Group();
        this.scene.add(this.markerRoot);
        this.artoolkitMarker = new THREEx.ArMarkerControls(this.arToolkitContext, this.markerRoot, {
                                                  type : 'pattern',
                                                  patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/XRSmarker.patt'
                                                  });
        this.artoolkitMarker.addEventListener('markerFound', function(event){bTracking=true;});
    
        this.smoothedRoot = new THREE.Group();
        this.scene.add(this.smoothedRoot);
    
        this.smoothedControls = new THREEx.ArSmoothedControls(this.smoothedRoot, {
                                                     lerpPosition: 0.4,
                                                     lerpQuaternion: 0.3,
                                                     lerpScale: 1
                                                     });
        this.onRenderFcts.push(function(delta){this.smoothedControls.update(this.markerRoot);});
    
        this.arWorldRoot = this.smoothedRoot;

    };

    this.animate = function(nowMsec){
        this.bTracking = false;
        this.requestAnimationFrame(this.animate);
        this.lastTimeMsec = this.lastTimeMsec || nowMsec-1000/60;
        var deltaMsec = Math.min(200, nowMsec - this.lastTimeMsec);
        this.lastTimeMsec = nowMsec;
    
        this.onRenderFcts.forEach(function(onRenderFct){onRenderFct(deltaMsec/1000, nowMsec/1000)});
    };

    this.startLoop = function(){
        this.onRenderFcts.push(function(){this.renderer.render(this.scene, this.camera);});
        requestAnimationFrame(this.animate);
    }
};
