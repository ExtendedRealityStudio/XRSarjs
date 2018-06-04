var AppStateEnum = {
    STATE_WAIT_TAP: 0,
    STATE_NEVER_FOUND_MARKER: 1,
    STATE_LOADING_ASSETS: 2,
    STATE_FADE_IN: 3,
    STATE_LOOPING: 4
};

var curState = AppStateEnum.STATE_WAIT_TAP;
var updateDemoFcts = [];
var meshUnderWorld;
var meshStartLogo;
var meshWelcomePanel;
var startTime;
var stopTime;
var fadeInTotTime = 1.0;
var welcomeSndTime = 4.0;
var welcomeSndStartTime;
var welcomeSndStopTime;
var bLoopSndStarted = false;
var meshHelmet;
var envMap;
var finalSize = 0.8;

var mixer;
var animations;

var audioWelcome;
var audioLoop;

var topDiv;

var bLoadedModels = false;
var bLoadedAudio = false;
var bTouched = false;

var bUseAstronaut = true;

function initDemo(){
   
    document.addEventListener('click', onClick, false);
    document.addEventListener("touchstart", touchStart, false);

    addEnvMap();
    addLights();
    //makeUnderWorld();
    //addStartLogo();
    addModels();

    updateDemoFcts.push(updateWaitTap);
    updateDemoFcts.push(updateNeverFoundMarker);
    updateDemoFcts.push(updateLoadingAssets);
    updateDemoFcts.push(updateFadeIn);
    updateDemoFcts.push(updateLooping);

    onRenderFcts.push(updateDemo);

    
}

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
    scene.add( ambientLight );
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    directionalLight.position.set( 1, 1, - 1 );
    scene.add( directionalLight );
    //
    light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
    light.position.set( 0, 1, 0 );
    scene.add( light );
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
    //meshUnderWorld.material.envMap = envMap;
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
    var loader = new THREE.MTLLoader();
    loader.setPath('../../models/');
    loader.load('SM_TXT_XRS_Logo.mtl',function(materials){
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('../../models/');
        objLoader.load('SM_TXT_XRS_Logo.obj', function(object){
            object.traverse(function(child){
                if(child.isMesh){
                    child.material.envMap = envMap;
                }
            });
            meshStartLogo = object;
            meshStartLogo.position.y += 0.5;
            meshStartLogo.rotation.x = THREE.Math.radToDeg(90);
            arWorldRoot.add(meshStartLogo);
        },
        function(xhr){},
        function(error){}
        );
    });
    
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
                    meshHelmet.position.y -= 1;
                    meshHelmet.position.x += 0.5;
                    
                    bLoadedModels = true;
                } );

    }
}

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

function updateDemo(_delta, _now){
    updateDemoFcts[curState](_delta, _now);
}


function updateWaitTap(_delta, _now){
    if(bTouched){
        curState = AppStateEnum.STATE_NEVER_FOUND_MARKER;
    }
}

function updateNeverFoundMarker(_delta, _now){
    if(bTracking){
        console.log('1st marker found');
        audioWelcome.play();
        welcomeSndStartTime = lastTimeMsec/1000;
        welcomeSndStopTime = welcomeSndStartTime + welcomeSndTime;
        curState = AppStateEnum.STATE_LOADING_ASSETS;
        //arWorldRoot.add(meshStartLogo);
    }
}

function updateLoadingAssets(_delta, _now){
    if(bLoadedAudio && bLoadedModels){
        curState = AppStateEnum.STATE_FADE_IN;
        audioLoop.play();
        startTime = lastTimeMsec/1000;
        stopTime = startTime+fadeInTotTime;
        arWorldRoot.add(meshHelmet);
        startLoopSound();
    }
}

function updateFadeIn(_delta, _now){
    var now = lastTimeMsec/1000;
    if(now<stopTime){
        var pct = THREE.Math.mapLinear(now, startTime, stopTime, 0.0, finalSize);
        meshHelmet.scale.set(pct,pct,pct);
    }else{
        meshHelmet.scale.set(finalSize,finalSize,finalSize);
        curState = AppStateEnum.STATE_LOOPING;
        
        if(animations){
            if(animations.length){
                if(animations && animations.length){
                    mixer = new THREE.AnimationMixer(meshHelmet);
                    for(var i=0;i<animations.length;i++){
                        console.log("triggering animation "+i);
                        var animation = animations[i];
                        var action = mixer.clipAction(animation);
                        action.play();
                    }
                }
            }else{
                console.log("model has 0 animations");
            }
        }else{
            console.log("model animations is undefined");
        }
        
    }
    startLoopSound();
}

function updateLooping(_delta, _now){
    meshHelmet.rotation.y += 0.003;
    startLoopSound();
    if(mixer){
        mixer.update(_delta);
    }
}

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
