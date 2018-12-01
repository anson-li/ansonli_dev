      var mouseX = 0, mouseY = 0,

      windowHalfX = window.innerWidth / 2,
      windowHalfY = window.innerHeight / 2,

      SEPARATION = 200,
      AMOUNTX = 10,
      AMOUNTY = 10,

      camera, scene, renderer, geometry, particles;

      init();
      animate();

      function init() {

        var container, separation = 100, amountX = 50, amountY = 50,
        particles, particle;

        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera( 315, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 650;

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.autoClear = false;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.shadowMapSoft = true;

        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        // particles

        var PI2 = Math.PI * 2;
        var material = new THREE.SpriteMaterial( {

          color: 0x999999,
        
        } );

        geometry = new THREE.Geometry();
        particles = [];

        for ( var i = 0; i < 100; i ++ ) {

          particle = new THREE.Sprite( material );
          particle.position.x = Math.random() * 3 - 1;
          particle.position.y = Math.random() * 2 - 1;
          particle.position.z = Math.random() * 5 - 1;
          particle.position.normalize();
          particle.position.multiplyScalar( Math.random() * 12 + 350 );
          particle.scale.x = particle.scale.y = Math.random() * 3;
          scene.add( particle );

          particles.push( particle );
          geometry.vertices.push( particle.position );

        }

        // lines

        var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffe5ce, opacity: 1, linewidth: 0.5 } ) );
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
        camera.position.y += ( - mouseY - camera.position.y ) * .015;
        camera.lookAt( scene.position );
        renderer.render( scene, camera );

      }
