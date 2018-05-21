var AppStateEnum = {
    STATE_NEVER_FOUND_MARKER: 0,
    STATE_START_FADE_IN: 1,
    STATE_LOADING_SCENE: 2
};

var curState = AppStateEnum.STATE_NEVER_FOUND_MARKER;
var updateDemoFcts = [];
var meshUnderWorld;
var meshStartLogo;
var clock;
var startTime;
var stopTime;
var fadeInTotTime = 1.0;

function initDemo(){
    clock = new THREE.Clock();

    addLights();
    makeUnderWorld();
    addStartLogo();

    updateDemoFcts.push(updateNeverFoundMarker);
    updateDemoFcts.push(updateStartFadeIn);
    updateDemoFcts.push(updateLoadingScene);

    onRenderFcts.push(updateDemo);

    clock.start();
}

function addLights(){
    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
    scene.add( ambientLight );
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    directionalLight.position.set( 1, 1, - 1 );
    scene.add( directionalLight );
}

function makeUnderWorld(){
    var boxGeometry = new THREE.Geometry();
    var minX = -0.5;
    var maxX = 0.5;
    var minY = -1;
    var maxY = 0;
    var minZ = -0.5;
    var maxZ = 0.5;
    
    //top
    boxGeometry.vertices.push(new THREE.Vector3(minX,minY,minZ));
    boxGeometry.vertices.push(new THREE.Vector3(maxX,minY,minZ));
    boxGeometry.vertices.push(new THREE.Vector3(maxX,maxY,minZ));
    boxGeometry.vertices.push(new THREE.Vector3(minX,maxY,minZ));
    
    //bottom
    boxGeometry.vertices.push(new THREE.Vector3(minX,minY,maxZ));
    boxGeometry.vertices.push(new THREE.Vector3(maxX,minY,maxZ));
    boxGeometry.vertices.push(new THREE.Vector3(maxX,maxY,maxZ));
    boxGeometry.vertices.push(new THREE.Vector3(minX,maxY,maxZ));

    boxGeometry.vertices.push(new THREE.Vector3(minX,minY,minZ));
    boxGeometry.vertices.push(new THREE.Vector3(minX,maxY,minZ));
    boxGeometry.vertices.push(new THREE.Vector3(minX,maxY,maxZ));
    boxGeometry.vertices.push(new THREE.Vector3(minX,minY,maxZ));

    boxGeometry.vertices.push(new THREE.Vector3(maxX,minY,minZ));
    boxGeometry.vertices.push(new THREE.Vector3(maxX,maxY,minZ));
    boxGeometry.vertices.push(new THREE.Vector3(maxX,maxY,maxZ));
    boxGeometry.vertices.push(new THREE.Vector3(maxX,minY,maxZ));

    boxGeometry.vertices.push(new THREE.Vector3(minX,minY,minZ));
    boxGeometry.vertices.push(new THREE.Vector3(minX,minY,maxZ));
    boxGeometry.vertices.push(new THREE.Vector3(maxX,minY,maxZ));
    boxGeometry.vertices.push(new THREE.Vector3(maxX,minY,minZ));

    boxGeometry.faces.push(new THREE.Face3(0,2,1));
    boxGeometry.faces.push(new THREE.Face3(0,3,2));

    boxGeometry.faces.push(new THREE.Face3(4,5,6));
    boxGeometry.faces.push(new THREE.Face3(4,6,7));

    boxGeometry.faces.push(new THREE.Face3(8,10,9));
    boxGeometry.faces.push(new THREE.Face3(8,11,10));

    boxGeometry.faces.push(new THREE.Face3(12,13,14));
    boxGeometry.faces.push(new THREE.Face3(12,14,15));

    boxGeometry.faces.push(new THREE.Face3(16,18,17));
    boxGeometry.faces.push(new THREE.Face3(16,19,18));

    var boxMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        opacity: 1.0,
        transparent: false,
        side: THREE.BackSide,
        shading: THREE.FlatShading
    }); 

    meshUnderWorld = new THREE.Mesh(boxGeometry, boxMaterial);
    arWorldRoot.add(meshUnderWorld);

    var maskW = 2;
    var maskH = 2;
    var maskDiffHor = (maskW - 1.0)/2.0;
    var maskDiffVer = (maskH - 1.0)/2.0;
    var minHor = -maskW/2;
    var maxHor = maskW/2;
    var minVer = -maskH/2;
    var maxVer = maskH/2;
    var mid1Hor = minHor+maskDiffHor;
    var mid2Hor = maxHor-maskDiffHor;
    var mid1Ver = minVer+maskDiffVer;
    var mid2Ver = maxVer-maskDiffVer;

    //var geomPTop = new THREE.PlaneGeometry(maskW,maskDiffVer);
    var geomMask = new THREE.Geometry();
    // 0--------1
    // 8 4----5 9
    // | |    | |
    //10 7----6 11
    // 3--------2
    geomMask.vertices.push(new THREE.Vector3(minHor,0,minVer));//0
    geomMask.vertices.push(new THREE.Vector3(maxHor,0,minVer));//1
    geomMask.vertices.push(new THREE.Vector3(maxHor,0,maxVer));//2
    geomMask.vertices.push(new THREE.Vector3(minHor,0,maxVer));//3
    geomMask.vertices.push(new THREE.Vector3(mid1Hor,0,mid1Ver));//4
    geomMask.vertices.push(new THREE.Vector3(mid2Hor,0,mid1Ver));//5
    geomMask.vertices.push(new THREE.Vector3(mid2Hor,0,mid2Ver));//6
    geomMask.vertices.push(new THREE.Vector3(mid1Hor,0,mid2Ver));//7
    geomMask.vertices.push(new THREE.Vector3(minHor,0,mid1Ver));//8
    geomMask.vertices.push(new THREE.Vector3(maxHor,0,mid1Ver));//9
    geomMask.vertices.push(new THREE.Vector3(minHor,0,mid2Ver));//10
    geomMask.vertices.push(new THREE.Vector3(maxHor,0,mid2Ver));//11

    geomMask.faces.push(new THREE.Face3(0,8,1));
    geomMask.faces.push(new THREE.Face3(8,9,1));
    geomMask.faces.push(new THREE.Face3(10,3,11));
    geomMask.faces.push(new THREE.Face3(3,2,11));
    geomMask.faces.push(new THREE.Face3(8,10,4));
    geomMask.faces.push(new THREE.Face3(10,7,4));
    geomMask.faces.push(new THREE.Face3(5,6,9));
    geomMask.faces.push(new THREE.Face3(6,11,9));

    var matMask = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.FrontSide});

    var meshMask = new THREE.Mesh(geomMask, matMask);
    arWorldRoot.add(meshMask);
}

function addStartLogo(){
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setBaseUrl('../../models/');
    mtlLoader.setPath('../../models/');
    mtlLoader.load('SM_TXT_XRS_Logo.mtl', function(materials){
                   materials.preload();
                   
                   var objLoader = new THREE.OBJLoader();
                   objLoader.setMaterials(materials);
                   objLoader.load(
                                  '../../models/SM_TXT_XRS_Logo.obj',
                                  function(object){
                                  //onLoaded
                                  
                                  object.position.y += 0.5;
                                  object.rotation.x = THREE.Math.radToDeg(90);
                                    object.scale.set(0,0,0);
                                  arWorldRoot.add(object);
                                  meshStartLogo = object;
                                  },
                                  function(xhr){
                                  //onProgress
                                  console.log((xhr.loaded/xhr.total*100)+'% loaded');
                                  },
                                  function(error){
                                  console.log('cannot load model');
                                  }
                                  );
                   
                   });
}

function updateDemo(){
    updateDemoFcts[curState]();
}

function updateNeverFoundMarker(){
    if(bTracking){
        console.log('1st marker found');
        curState = AppStateEnum.STATE_START_FADE_IN;
        startTime = clock.elapsedTime;
        stopTime = startTime+fadeInTotTime;
        arWorldRoot.add(meshStartLogo);
    }
}

function updateStartFadeIn(){
    //var now = clock.elapsedTime;
    console.log('cippa '+lastTimeMsec+" "+startTime+" "+stopTime+" "+clock.running);
    //if(now<stopTime){
        //var pct = THREE.Math.mapLinear(now, startTime, stopTime, 0.0, 1.0);
        //meshStartLogo.scale.set(pct, pct, pct);
    //}else{
    //    meshStartLogo.scale.set(1,1,1);
    //    curState = AppStateEnum.STATE_LOADING_SCENE;
    //}
}

function updateLoadingScene(){}

