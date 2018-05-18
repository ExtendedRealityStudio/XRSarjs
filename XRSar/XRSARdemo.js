var AppStateEnum = {
    STATE_LOADING: 0,
    STATE_MODEL_LOADED: 1,
    STATE_SHOW_MODEL: 2
};

var curState = AppStateEnum.STATE_LOADING;
var mixer;
var mixers = [];
var meshLogo;
var meshModel;

var updateDemoFcts = [];

function initDemo(){

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);

    addLights();
    addLogo();
   
    loadModel();

    updateDemoFcts.push(updateLoading);
    updateDemoFcts.push(updateModelLoaded);
    updateDemoFcts.push(updateShowModel);

    onRenderFcts.push(updateDemo);
}

function addLights(){
    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
    scene.add( ambientLight );
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    directionalLight.position.set( 1, 1, - 1 );
    scene.add( directionalLight );
}

function addLogo(){
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
                                  object.rotation.x += THREE.Math.radToDeg(90);
                                  arWorldRoot.add(object);
                                  meshLogo = object;
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

/*function loadModel(){
    var loader = new THREE.ColladaLoader();
    loader.load('../../models/astronaut/Dae_Char_Astronaut@SpaceWalk.dae', function ( collada ) {
        var animations = collada.animations;
        var avatar = collada.scene;
        avatar.scale.set(0.17,0.17,0.17);
        avatar.rotation.x -= THREE.Math.degToRad(90);
        avatar.rotation.z += THREE.Math.degToRad(180);
        avatar.position.z -= 0.55;
        avatar.position.y += 0.5;
        mixer = new THREE.AnimationMixer( avatar );
        var action = mixer.clipAction( animations[ 0 ] ).play();
        //arWorldRoot.add( avatar );
        meshModel = avatar;
        goStateModelLoaded();
    });
                
    onRenderFcts.push(function(){
        var delta = clock.getDelta();
        if ( mixer !== undefined ) {
            mixer.update( delta );
        }
    });
}*/

function loadModel(){
    var loader = new THREE.GLTFLoader();
    loader.load('../../models/astronaut/gltf_out/gltf.gltf', function ( data ) {
        meshModel = data.scene;
        
        meshModel.scale.set(0.5,0.5,0.5);
        
        var animations = data.animations;
        if(animations && animations.length){
            console.log("cippa");
            mixer = new THREE.AnimationMixer(meshModel);
            for(var i=0;i<animations.length;i++){
                var animation = animations[i];
                var action = mixer.clipAction(animation);
                action.play();
            }
        }

        goStateModelLoaded();
        /*var animations = collada.animations;
        var avatar = collada.scene;
        avatar.scale.set(0.17,0.17,0.17);
        avatar.rotation.x -= THREE.Math.degToRad(90);
        avatar.rotation.z += THREE.Math.degToRad(180);
        avatar.position.z -= 0.55;
        avatar.position.y += 0.5;
        mixer = new THREE.AnimationMixer( avatar );
        var action = mixer.clipAction( animations[ 0 ] ).play();
        //arWorldRoot.add( avatar );
        meshModel = avatar;
        goStateModelLoaded();*/
    });
                
    onRenderFcts.push(function(){
        var delta = clock.getDelta();
        if ( mixer !== undefined ) {
            mixer.update( delta );
        }
    });
}

function goStateModelLoaded(){
    curState = AppStateEnum.STATE_MODEL_LOADED;
    if(meshLogo != undefined){
         meshLogo.rotation.x = THREE.Math.degToRad(-90);
    }
}

function goStateShowModel(){
    curState = AppStateEnum.STATE_SHOW_MODEL;
    if(meshModel != undefined){
        arWorldRoot.add(meshModel);
    }
}

function updateDemo(){
    updateDemoFcts[curState]();
}

function updateLoading(){
    if(meshLogo != undefined){
        meshLogo.rotation.x += 0.05;
    }
}

function updateModelLoaded(){
    
}

function updateShowModel(){

}

function onDocumentMouseDown(event){
    event.preventDefault();

    switch(curState){
        case AppStateEnum.STATE_MODEL_LOADED:
            goStateShowModel();
            break;
        default:
            break;
    }
}

function onDocumentMouseUp(event){
    event.preventDefault();

    switch(curState){
        case AppStateEnum.STATE_MODEL_LOADED:

            break;
        default:
            break;
    }
}
