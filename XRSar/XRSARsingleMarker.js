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
// Page should look like:
// initThreeJs();
// initARToolKit();
// initMarker();
//
// //add your stuff here
//
// startLoop();

var renderer;
var onRenderFcts = [];
var scene;
var camera;
var controls;

var arToolkitSource;
var arToolkitContext;

var bTracking = false;
var markerRoot;
var artoolkitMarker;
var smoothedRoot;
var smoothedControls;

var arWorldRoot;

var lastTimeMsec = null;

function initThreeJs(){
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setClearColor(new THREE.Color('white'), 0);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );
    
    scene = new THREE.Scene();
    camera = new THREE.Camera();
    
    scene.add(camera);
}

function initARToolKit(){
    arToolkitSource = new THREEx.ArToolkitSource({sourceType : 'webcam'});
    arToolkitSource.init(function onReady(){onResize();});
    window.addEventListener('resize', function(){onResize();});
    
    arToolkitContext = new THREEx.ArToolkitContext({
                                                   cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
                                                   detectionMode: 'mono',
                                                   maxDetectionRate: 30,
                                                   canvasWidth: 80*3,
                                                   canvasHeight: 60*3
                                                   });
    
    arToolkitContext.init(function onCompleted(){camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());});
    
    onRenderFcts.push(function(){
                      if(arToolkitSource.ready === false) return;
                      arToolkitContext.update(arToolkitSource.domElement);
                      });
}

function onResize(){
    arToolkitSource.onResize()
    arToolkitSource.copySizeTo(renderer.domElement)
    if( arToolkitContext.arController !== null ){
        arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
    }
}

function initMarker(){
    markerRoot = new THREE.Group();
    scene.add(markerRoot);
    artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
                                                  type : 'pattern',
                                                  patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/XRSmarker.patt'
                                                  });
    artoolkitMarker.addEventListener('markerFound', function(event){bTracking=true;});
    
    smoothedRoot = new THREE.Group();
    scene.add(smoothedRoot);
    
    smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
                                                     lerpPosition: 0.4,
                                                     lerpQuaternion: 0.3,
                                                     lerpScale: 1
                                                     });
    onRenderFcts.push(function(delta){smoothedControls.update(markerRoot);});
    
    arWorldRoot = smoothedRoot;
    
}

function animate(nowMsec){
    bTracking = false;
    requestAnimationFrame(animate);
    lastTimeMsec = lastTimeMsec || nowMsec-1000/60;
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec = nowMsec;
    
    onRenderFcts.forEach(function(onRenderFct){onRenderFct(deltaMsec/1000, nowMsec/1000)});
}

function startLoop(){
    onRenderFcts.push(function(){renderer.render(scene, camera);});
    requestAnimationFrame(animate);
}
