var XRSar = function(){
    this.threeJsScene = new XRSarThreeJs();
    this.arToolkit = new XRSarToolkit();

    this.initSingleMarker = function(){
        this.threeJsScene.init();

        this.arToolkit.onContextCompleted = function(){
            console.log("cippa");
            this.threeJsScene.camera.projectionMatrix;
        }

        this.arToolkit.init(this.threeJsScene.camera);
    };
};

var XRSarThreeJs = function(){
    this.renderer;
    this.onRenderFcts = [];
    this.scene;
    this.camera;
    this.controls;
    
    this.init = function(){
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
}

var XRSarToolkit = function(){
    this.arToolkitSource;
    this.arToolkitContext;

    this.bTracking = false;
    this.markerRoot;
    this.artoolkitMarker;

    this.onContextCompleted;

    this.init = function(){ 
        this.arToolkitSource = new THREEx.ArToolkitSource({sourceType : 'webcam'});
        this.arToolkitSource.init(this.onResize());
        window.addEventListener('resize', this.onResize());

        this.arToolkitContext = new THREEx.ArToolkitContext({
                                                   cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
                                                   detectionMode: 'mono',
                                                   maxDetectionRate: 30,
                                                   canvasWidth: 80*3,
                                                   canvasHeight: 60*3
                                                   });

        this.arToolkitContext.init(this.onContextCompleted);
    };

    this.onResize = function(){
        console.log("cippa");
    }
};
