var THREEx = THREEx || {};
var XRSar = XRSar || {};

var AppStateEnum = {
    STATE_WAIT_TAP: 0,
    STATE_NEVER_FOUND_MARKER: 1,
    STATE_LOADING_ASSETS: 2,
    STATE_INSIDE_ANIM: 3,
    STATE_OUTSIDE_ANIM: 4,
    STATE_FADE_IN: 5,
    STATE_LOOPING: 6
};

var curState = AppStateEnum.STATE_WAIT_TAP;
var updateDemoFcts = [];

var startTime;
var stopTime;
var insideAnimTotTime = 1.0;
var outsideAnimTotTime = 1.0;
var fadeInTotTime = 1.0;
var welcomeSndTime = 4.0;
var welcomeSndStartTime;
var welcomeSndStopTime;

var finalSize = 0.4;
var finalInsidePos;
var finalOutsidePos;

var mixer;
var animations;

var audioWelcome;
var audioLoop;

var meshUnderWorld;
var meshMarkerBorder;
var meshBorderWalls;
var meshMarkerInside;
var meshStartLogo;
var meshWelcomePanel;

var topDiv;

var bLoopSndStarted = false;
var bLoadedModels = false;
var bLoadedAudio = false;
var bTouched = false;
var bUseAstronaut = true;

function initDemo(){
    document.addEventListener('click', onClick, false);
    document.addEventListener("touchstart", touchStart, false);

    addEnvMap();
    addLights();
    makeUnderWorld();
    addModels();
}

//html5
function onClick(){
    firstTouch();
}

function touchStart(){
    console.log('tap');
    firstTouch();
}

function firstTouch(){
     if(!bTouched){
        bTouched = true;
        addAudio();
        hide(document.getElementById('welcome_panel'));
    }
}

function hide (elements) {
  elements = elements.length ? elements : [elements];
  for (var index = 0; index < elements.length; index++) {
    elements[index].style.display = 'none';
  }
}

//audio

function addAudio(){
    audioWelcome = makeAudio("../../sound/AR_welcome.ogg", "../../sound/AR_welcome.wav");
    audioLoop = makeAudio("../../sound/AR_atmospheric.ogg", "../../sound/AR_atmospheric.wav");
    audioLoop.loop = true;
    if(typeof audioLoop.loop == 'boolean'){
        audioLoop.loop = true;
    }else{
        audioLoop.addEventListener('ended', function(){
            audioLoop.currentTime = 0;
            audioLoop.play();
        }, false);
    }

    bLoadedAudio = true;
}

function makeAudio(_ogg, _wav){
    var _audio = new Audio();
    var srcOgg = document.createElement("source");
    srcOgg.src = _ogg;
    srcOgg.type = "audio/ogg";
    var srcWav = document.createElement("source");
    srcWav.src = _wav;
    srcWav.type = "audio/wav";
    _audio.appendChild(srcOgg);
    _audio.appendChild(srcWav);
    return _audio;
}

function startLoopSound(){
    if(!bTouched)return;
    if(!bLoopSndStarted){
        var now =  lastTimeMsec/1000;
        if(now>welcomeSndStopTime){
            if(bTouched)audioLoop.play();
            bLoopSndStarted = true;
        }
    }
}

function playWelcomeSound(){
    audioWelcome.play();
    welcomeSndStartTime = lastTimeMsec/1000;
    welcomeSndStopTime = welcomeSndStartTime + welcomeSndTime;
}

//3d
function addEnvMap(){
    var pth = "../../textures/Bridge2/";
    var format = '.jpg';
    envMap = new THREE.CubeTextureLoader().load( [
                    pth + 'posx' + format, pth + 'negx' + format,
                    pth + 'posy' + format, pth + 'negy' + format,
                    pth + 'posz' + format, pth + 'negz' + format
                ] );
}

function addLights(){
    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
    ar.threeJsContext.scene.add( ambientLight );
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    directionalLight.position.set( 1, 1, - 1 );
    ar.threeJsContext.scene.add( directionalLight );
    //
    light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
    light.position.set( 0, 1, 0 );
    ar.threeJsContext.scene.add( light );
}

function makeMaskGeometry(_maskW, _maskH, _holeSz){
    var maskDiffHor = (_maskW - _holeSz)/2.0;
    var maskDiffVer = (_maskH - _holeSz)/2.0;
    var minHor = -_maskW/2;
    var maxHor = _maskW/2;
    var minVer = -_maskH/2;
    var maxVer = _maskH/2;
    var mid1Hor = minHor+maskDiffHor;
    var mid2Hor = maxHor-maskDiffHor;
    var mid1Ver = minVer+maskDiffVer;
    var mid2Ver = maxVer-maskDiffVer;

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
    
    return geomMask;
}

function makeUnderWorld(){
    var boxSz = 1.05;
    var geomUw = new THREE.CubeGeometry(boxSz,boxSz*2,boxSz);
    var txtLoader = new THREE.TextureLoader();
    var txtUw = txtLoader.load('../../textures/tiles.jpg');
    var matUw = new THREE.MeshLambertMaterial({
        transparent: true,
        map: txtUw,
        side: THREE.BackSide
    });

    meshUnderWorld = new THREE.Mesh(geomUw, matUw);
    meshUnderWorld.position.y = -boxSz;

    meshUnderWorld = new THREE.Mesh(geomUw, matUw);
    meshUnderWorld.position.y = -boxSz;

    var maskW = 9;
    var maskH = 9;
    
    var geomCloak = makeMaskGeometry(maskW, maskH, boxSz);
    var matCloak = new THREE.MeshBasicMaterial( {
        //color: 0xffff00, 
        side: THREE.DoubleSide,
        colorWrite: false
    });
    var meshCloak = new THREE.Mesh( geomCloak, matCloak );
    
    var geomBorder = makeMaskGeometry(boxSz, boxSz, boxSz/2);
    var matBorder =  new THREE.MeshBasicMaterial( {
        color: 0x000000, 
        side: THREE.FrontSide
    });
    meshMarkerBorder = new THREE.Mesh(geomBorder, matBorder);

    var geomBorderWalls = new THREE.CubeGeometry(boxSz/2, boxSz, boxSz/2);
    meshBorderWalls = new THREE.Mesh(geomBorderWalls, matUw);
    meshBorderWalls.position.y = -boxSz/2;
    
    var txtLoaderInside = new THREE.TextureLoader();
    var txtInside = txtLoaderInside.load('../../textures/markerInside.png');
    var geomInside = new THREE.PlaneGeometry(boxSz/2, boxSz/2);
    var matInside = new THREE.MeshLambertMaterial({
        map: txtInside,
        side: THREE.FrontSide
    });
    
    meshMarkerInside = new THREE.Mesh(geomInside, matInside);
    meshMarkerInside.rotation.x = -Math.PI/2;
    
    finalInsidePos = -boxSz*0.95;
    finalOutsidePos = -boxSz;

    meshMarkerBorder.add(meshBorderWalls);
    meshMarkerBorder.add(meshMarkerInside);

    ar.arWorldRoot.add(meshUnderWorld);
    ar.arWorldRoot.add(meshCloak);
    ar.arWorldRoot.add(meshMarkerBorder);

}

function addModels(){
    var loader = new THREE.GLTFLoader();
    if(!bUseAstronaut){
        loader.load('../../models/DamagedHelmet/glTF/DamagedHelmet.gltf', function(gltf){
    					gltf.scene.traverse(function(child){
					    if(child.isMesh){
					        child.material.envMap = envMap;
					    }
					});
                    meshHelmet = gltf.scene;
                    meshHelmet.scale.set(0.5,0.5,0.5);
                    meshHelmet.scale.set(0,0,0);
                    meshHelmet.rotation.x -= THREE.Math.degToRad(90);
                    meshHelmet.position.y += 1;
                    
                    bLoadedModels = true;
                } );
    }else{
        loader.load('../../models/Astronaut_Test01/Astronaut.glTF', function(gltf){
					gltf.scene.traverse(function(child){
					    if(child.isMesh){
					        child.material.envMap = envMap;
					    }
					});
                    
                    meshHelmet = gltf.scene;
                    
                    console.log("gltf animations: "+gltf.animations);
			        animations = gltf.animations;

                    finalSize *= 0.01;
                    meshHelmet.scale.set(0,0,0);
                    //meshHelmet.rotation.x -= THREE.Math.degToRad(90);
                    //meshHelmet.position.y -= 1;
                    //meshHelmet.position.x += 0.5;
                    meshHelmet.position.z += 3.1;
                    meshHelmet.position.y -= 1.0;
                    
                    bLoadedModels = true;
                } );

    }

}
