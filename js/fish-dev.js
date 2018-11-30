'use strict';

Physijs.scripts.worker = 'js/physijs/physijs_worker.js';
Physijs.scripts.ammo = 'examples/js/ammo.js';

var initScene, render, renderer, scene, sceneText, composer, ground, light, camera, controls, spawnChair, composer, customPass, customPassTitle,
    ground_material, windowHalfX, windowHalfY, chair_material, loader, mouseX = 0, iterMin = 15, iterMax = 100, donutRange = 200, baseColorOffset = 25, isMobile = false,
    mouseY = 0,
    count = 0,
    countMax = 200,
    detectMob;

initScene = function() {

    if (detectMob) {
        countMax = 5;
        iterMin = 500;
        iterMax = 600;
        donutRange = 100;
        baseColorOffset = 80;
        isMobile = true;
    }

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.autoClear = false;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMapSoft = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('viewport').appendChild(renderer.domElement);

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    scene = new Physijs.Scene;
    sceneText = new Physijs.Scene;
    scene.setGravity(new THREE.Vector3(0, -50, 0));
    scene.addEventListener(
        'update',
        function() {
            scene.simulate(undefined, 2);
        }
    );

    camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        800
    );
    camera.position.set(0, 90, 150);
    camera.lookAt(scene.position);
    scene.add(camera);

    // Add mobile controls
    // if (isMobile) {
    //   controls = new THREE.DeviceOrientationControls( camera );
    // }

    // Light
    light = new THREE.DirectionalLight(0xfff3e4);
    light.position.set(40, 60, -15);
    light.target.position.copy(scene.position);
    light.castShadow = true;
    light.shadowCameraLeft = -60;
    light.shadowCameraTop = -60;
    light.shadowCameraRight = 60;
    light.shadowCameraBottom = 60;
    light.shadowCameraNear = 20;
    light.shadowCameraFar = 200;
    light.shadowBias = -.0001
    light.shadowMapWidth = light.shadowMapHeight = 2048;
    light.shadowDarkness = .7;
    scene.add(light);
    //sceneText.add( light );

    // TODO: Refactor into a function to grab random colors
    var randomColors = new Array(3);
    var randomInvertedColors = new Array(3);
    for (var i = 0; i < randomColors.length; i++) {
        randomColors[i] = parseInt(Math.random() * 150 + baseColorOffset);
        randomInvertedColors[i] = 255 - randomColors[i];
    }
    var strColors = "rgb(" + randomColors.join(', ') + ")";
    var strInvertedColors = "rgb(" + randomInvertedColors.join(', ') + ")";

    var ambientlight = new THREE.AmbientLight(strColors); // soft white light  <- randomize!
    scene.add(ambientlight);

    // Loader
    loader = new THREE.TextureLoader();

    // Materials
    ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            map: loader.load('js/physijs/examples/images/rocks.jpg')
        }),
        .8, // high friction
        .4 // low restitution
    );
    ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
    ground_material.map.repeat.set(3, 3);

    chair_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            map: loader.load('js/physijs/examples/images/wood.jpg')
        }),
        .6, // medium friction
        .2 // low restitution
    );
    chair_material.map.wrapS = chair_material.map.wrapT = THREE.RepeatWrapping;
    chair_material.map.repeat.set(.25, .25);

    // Ground
    ground = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1000, 1, 1000),
        ground_material,
        0 // mass
    );;
    ground.receiveShadow = true;
    scene.add(ground);

    spawnChair();

    // Beginning font loading
    var fontloader = new THREE.FontLoader();
    var xMid, text;
    // var color = 0xa8f3dc;
    var color = strInvertedColors;
    var matDark = new THREE.LineBasicMaterial({
        color: color,
        side: THREE.DoubleSide
    });
    var matLite = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide
    });
    fontloader.load('fonts/Tiempo_Regular.json', function(font) {
        var messageFirst = "Anson";
        var shapes = font.generateShapes(messageFirst, 8);
        var geometry = new THREE.ShapeBufferGeometry(shapes);
        geometry.computeBoundingBox();
        xMid = -0.6 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        geometry.translate(xMid, 30, 30);
        // make shape ( N.B. edge view not visible )
        text = new THREE.Mesh(geometry, matLite);
        text.position.z = -0;
        //sceneText.add( text );
        scene.add(text);
    });

    fontloader.load('fonts/Gotham_Book.json', function(font) {
        var messageSecond = "Software Engineer / UX Designer \nSite under development \nContact hello@ansonli.ca";
        var shapes = font.generateShapes(messageSecond, 0.8);
        var geometry = new THREE.ShapeBufferGeometry(shapes);
        geometry.computeBoundingBox();
        xMid = -0.9 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        geometry.translate(xMid, 25, 25);
        // make shape ( N.B. edge view not visible )
        text = new THREE.Mesh(geometry, matDark);
        text.position.z = -0;
        // sceneText.add( text );
        scene.add(text);
    }); //end load function

    var clearMaskPass = new THREE.ClearMaskPass();
    var renderMask = new THREE.MaskPass(sceneText, camera);
    var renderMaskInverse = new THREE.MaskPass(sceneText, camera);
    renderMaskInverse.inverse = true;

    //custom shader pass
    composer = new THREE.EffectComposer(renderer);

    var outputPass = new THREE.ShaderPass(THREE.CopyShader);
    outputPass.renderToScreen = true;

    var effectColorify = new THREE.ShaderPass(THREE.ColorifyShader);
    effectColorify.uniforms['color'].value.setRGB(0.5, 0.5, 1);
    effectColorify.renderToScreen = true;

    var myEffect = {
        uniforms: {
            "tDiffuse": {
                value: null
            },
            "amount": {
                value: 2.0
            }
        },
        vertexShader: [
            "varying vec2 vUv;",
            "void main() {",
            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join("\n"),
        fragmentShader: [
            "uniform float amount;",
            "uniform sampler2D tDiffuse;",
            "varying vec2 vUv;",
            "void main() {",
            "vec4 color = texture2D( tDiffuse, vUv );",
            "vec3 c = color.rgb;",
            "color.r = c.r / 1.8 + 0.5;",
            "color.g = c.g / 1.8 + 0.3;",
            "color.b = c.b / 1.8 + 0.3;",
            "gl_FragColor = vec4( color.rgb , color.a );",
            "}"
        ].join("\n")
    }
    customPass = new THREE.ShaderPass(myEffect);
    customPass.renderToScreen = true;

    var myEffectTitle = {
        uniforms: {
            "tDiffuse": {
                value: null
            },
            "amount": {
                value: 2.0
            }
        },
        vertexShader: [
            "varying vec2 vUv;",
            "void main() {",
            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join("\n"),
        fragmentShader: [
            "uniform float amount;",
            "uniform sampler2D tDiffuse;",
            "varying vec2 vUv;",
            "void main() {",
            "vec4 color = texture2D( tDiffuse, vUv );",
            "vec3 c = color.rgb;",
            "color.r = c.r / 1.8 + 0.5;",
            "color.g = c.g / 1.8 + 0.5;",
            "color.b = c.b / 1.8 + 0.8;",
            "gl_FragColor = vec4( color.rgb , color.a );",
            "}"
        ].join("\n")
    }
    customPassTitle = new THREE.ShaderPass(myEffectTitle);
    //customPassTitle.renderToScreen = true;

    var renderBG = new THREE.RenderPass(scene, camera);
    var renderTitle = new THREE.RenderPass(sceneText, camera);
    renderTitle.clear = false;

    composer.addPass(renderBG);
    composer.addPass(renderTitle);
    composer.addPass(renderMaskInverse);
    composer.addPass(customPass);
    //composer.addPass(effectColorify);
    composer.addPass(clearMaskPass);
    //composer.addPass(renderMask);
    //composer.addPass(customPassTitle);
    //composer.addPass(renderTitle);
    //composer.addPass(clearMaskPass);
    //composer.addPass(maskPass2);
    composer.addPass(outputPass);
    // end shaders

    requestAnimationFrame(render);
    scene.simulate();
};

detectMob = (function() {
    if (navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    ) {
        return true;
    } else {
        return false;
    }
})();

spawnChair = (function() {
    var buildBack, buildLegs, doSpawn, getRandomInt, mouseMove, randomOutsideRange, randomRange, generateXZ;

    buildBack = function() {
        var back, _object;

        back = new Physijs.BoxMesh(
            new THREE.BoxGeometry(5, 1, .5),
            chair_material
        );
        back.position.y = 5;
        back.position.z = -2.5;
        back.castShadow = true;
        back.receiveShadow = true;

        // rungs - relative to back
        _object = new Physijs.BoxMesh(
            new THREE.BoxGeometry(1, 5, .5),
            chair_material
        );
        _object.position.y = -3;
        _object.position.x = -2;
        _object.castShadow = true;
        _object.receiveShadow = true;
        back.add(_object);

        _object = new Physijs.BoxMesh(
            new THREE.BoxGeometry(1, 5, .5),
            chair_material
        );
        _object.position.y = -3;
        _object.castShadow = true;
        _object.receiveShadow = true;
        back.add(_object);

        _object = new Physijs.BoxMesh(
            new THREE.BoxGeometry(1, 5, .5),
            chair_material
        );
        _object.position.y = -3;
        _object.position.x = 2;
        _object.castShadow = true;
        _object.receiveShadow = true;
        back.add(_object);

        return back;
    };

    buildLegs = function() {
        var leg, _leg;

        // back left
        leg = new Physijs.BoxMesh(
            new THREE.BoxGeometry(.5, 4, .5),
            chair_material
        );
        leg.position.x = 2.25;
        leg.position.z = -2.25;
        leg.position.y = -2.5;
        leg.castShadow = true;
        leg.receiveShadow = true;

        // back right - relative to back left leg
        _leg = new Physijs.BoxMesh(
            new THREE.BoxGeometry(.5, 4, .5),
            chair_material
        );
        _leg.position.x = -4.5;
        _leg.castShadow = true;
        _leg.receiveShadow = true;
        leg.add(_leg);

        // front left - relative to back left leg
        _leg = new Physijs.BoxMesh(
            new THREE.BoxGeometry(.5, 4, .5),
            chair_material
        );
        _leg.position.z = 4.5;
        _leg.castShadow = true;
        _leg.receiveShadow = true;
        leg.add(_leg);

        // front right - relative to back left leg
        _leg = new Physijs.BoxMesh(
            new THREE.BoxGeometry(.5, 4, .5),
            chair_material
        );
        _leg.position.x = -4.5;
        _leg.position.z = 4.5;
        _leg.castShadow = true;
        _leg.receiveShadow = true;
        leg.add(_leg);

        return leg;
    };

    getRandomInt = function(min, max) {
        return Math.random() * (max - min) + min;
    };

    mouseMove = function(event) {
        mouseX = (event.clientX - windowHalfX) / 100;
        mouseY = (event.clientY - windowHalfY) / 100;
    }

    generateXZ = function(range) {
        var xOrZ = Math.random() - 0.5;
        var xzCoord = new Array(2);
        if (xOrZ > 0) {
            xzCoord[0] = randomRange(range);
            xzCoord[1] = randomOutsideRange(range);
        } else {
            xzCoord[0] = randomOutsideRange(range);
            xzCoord[1] = randomRange(range);
        }
        return xzCoord;
    }

    randomRange = function(range) {
        return Math.random() * range - (range / 2);
    }

    randomOutsideRange = function(range) {
        var lessOrMore = Math.random() - 0.5;
        if (lessOrMore > 0) {
            return Math.random() * (range / 4) + (range / 4);
        } else {
            return -1 * Math.random() * (range / 4) - (range / 4);
        }
    }

    doSpawn = function() {
        var chair, back, legs;

        // seat of the chair
        chair = new Physijs.BoxMesh(
            new THREE.BoxGeometry(5, 1, 5),
            chair_material
        );
        chair.castShadow = true;
        chair.receiveShadow = true;

        // back - relative to chair ( seat )
        back = buildBack();
        chair.add(back);

        // legs - relative to chair ( seat )
        legs = buildLegs();
        chair.add(legs);

        chair.position.y = 30;

        var xzCoord = generateXZ(donutRange);
        chair.position.x = xzCoord[0];
        chair.position.z = xzCoord[1] - 50;

        chair.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        chair.addEventListener('ready', spawnChair);
        if (count < countMax) {
            scene.add(chair);
            count++;
        }
    };

    $(document).click(function(event) {
        event.preventDefault();
        countMax = countMax + 5;
        doSpawn();
    });
    document.addEventListener('mousemove', mouseMove, false);

    render = function() {

        if (isMobile) {
          // controls.update();
          camera.position.x += (mouseX - camera.position.x) * .05;
          camera.position.y += (mouseY - camera.position.y + 80) * .05;
          camera.lookAt(scene.position);
        } else {
          camera.position.x += (mouseX - camera.position.x) * .05;
          camera.position.y += (mouseY - camera.position.y + 80) * .05;
          camera.lookAt(scene.position);
        }

        // composer.render();
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    };

    return function() {
        setTimeout(doSpawn, getRandomInt(iterMin, iterMax));
    };
})();

window.onload = initScene;
document.onselectstart = function() {
    return false;
}
document.onmousedown = function() {
    return false;
}