      var mouseX = 0, mouseY = 0,

      windowHalfX = window.innerWidth / 2,
      windowHalfY = window.innerHeight / 2,

      SEPARATION = 200,
      AMOUNTX = 10,
      AMOUNTY = 10,

      camera, scene, renderer;

      init();
      animate();

      function loadModel(xTranslate, yTranslate) {

        var loader = new THREE.JSONLoader();
        loader.load("../assets/fish.json",function(model, loadedMat) {
          var material = new THREE.MeshBasicMaterial( { color: 0xffc98d, transparent: true, blending: THREE.AdditiveBlending } );
          material.morphTargets = true;
          
          var mesh = new THREE.Mesh(model, material);
          mesh.translateX(xTranslate);
          mesh.translateY(yTranslate);
          mesh.scale = new THREE.Vector3(3, 3, 3);

          mesh.rotation.y = Math.PI / 2;
          scene.add(mesh);
        });
      }

      function init() {

        var container, separation = 100, amountX = 50, amountY = 50,
        particles, particle;

        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera( 315, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 310;

        scene = new THREE.Scene();

        renderer = new THREE.CanvasRenderer( { alpha: true }); // gradient
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );
        loadModel(0, -3);

        loadModel(50, -100);
        // particles

        var PI2 = Math.PI * 2;
        var material = new THREE.SpriteCanvasMaterial( {

          color: 0xFFD7AB,
          program: function ( context ) {

            context.beginPath();
            context.arc( 0, 0, 0.6, 0, PI2, true );
            context.fill();

          }

        } );

        var geometry = new THREE.Geometry();

        for ( var i = 0; i < 10; i ++ ) {

          particle = new THREE.Sprite( material );
          particle.position.x = Math.random() * 3 - 1;
          particle.position.y = Math.random() * 2 - 1;
          particle.position.z = Math.random() * 5 - 1;
          particle.position.normalize();
          particle.position.multiplyScalar( Math.random() * 120 + 350 );
          particle.scale.x = particle.scale.y = Math.random() * 3;
          scene.add( particle );

          geometry.vertices.push( particle.position );

        }

        // lines

        var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x6B6B6B, opacity: 0.3, linewidth: 0.5 } ) );
        scene.add( line );

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );

        //

        window.addEventListener( 'resize', onWindowResize, false );

      }

      function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

      }

      //

      function onDocumentMouseMove(event) {

        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;

      }

      function onDocumentTouchStart( event ) {

        if ( event.touches.length > 1 ) {

          event.preventDefault();

          mouseX = event.touches[ 0 ].pageX - windowHalfX;
          mouseY = event.touches[ 0 ].pageY - windowHalfY;

        }

      }

      function onDocumentTouchMove( event ) {

        if ( event.touches.length == 1 ) {

          event.preventDefault();

          mouseX = event.touches[ 0 ].pageX - windowHalfX;
          mouseY = event.touches[ 0 ].pageY - windowHalfY;

        } else {
          mouseX += 0.05;
          mouseY -= 0.05;
        }

      }

      //

      function animate() {

        requestAnimationFrame( animate );

        render();

      }

      function render() {
        camera.position.x += ( mouseX - camera.position.x ) * .015;
        camera.position.y += ( - mouseY + 200 - camera.position.y ) * .015;
        camera.lookAt( scene.position ); 

        renderer.render( scene, camera );

      }
