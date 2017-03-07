
var state = true; // `true` when the simulation is running

var viewport = document.getElementById( 'viewport' ); // The canvas element we're going to use

var renderer = new THREE.WebGLRenderer({ canvas: viewport }); // Create the renderer

var scene = new THREE.Scene; // Create the scene
var camera = new THREE.PerspectiveCamera( 35, 1, 1, 1000 );

var large_ball_geometry = new THREE.SphereGeometry( 4 ); // Create the ball geometry with a radius of `4`
var large_ball_material = new THREE.MeshLambertMaterial({ color: 0x00ff00, overdraw: true }); // Large balls are be green
var bouncy_mat = new CANNON.Material();
var ground_mat = new CANNON.Material();

var time_last_run = (new Date()).getTime(); // used to calculate simulation delta

var world; // This will hold the Cannon.js objects
var lastBall;
var lastBallBody;
var lastVelocity, lastAcceleration;

renderer.setSize( viewport.clientWidth, viewport.clientHeight );

camera.position.set( -10, 30, -200 );
camera.lookAt( scene.position ); // Look at the center of the scene
scene.add( camera );

function addLights() {
	var ambientLight = new THREE.AmbientLight( 0x555555 );
	scene.add( ambientLight );

	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( -.5, .5, -1.5 ).normalize();
	scene.add( directionalLight );
}

function buildScene() {

	// Create the physics world
	world = new CANNON.World;
	world.gravity.set( 0, -50, 0 );
	world.broadphase = new CANNON.NaiveBroadphase();
	world.solver.iterations = 10; // Use 10 iterations each time the simulation is run

	var material_red = new THREE.MeshLambertMaterial({ color: 0xdd0000, overdraw: true });
	var material_green = new THREE.MeshLambertMaterial({ color: 0x00bb00, overdraw: true });

	// Create the floor
	var floor = new THREE.Mesh( new THREE.BoxGeometry( 100, 1, 100 ), material_red );
	scene.add( floor );
	floor.position.y = -15; // position the floor

	var shape = new CANNON.Box(new CANNON.Vec3( 50, .05, 50 )); // "50" is half the floor's width, ".01" is a small number representing a plane, and "50" is half the depth
	var body = new CANNON.Body( {mass: 0, shape: shape, material: ground_mat} ); // a mass of "0" indicates this object is static
	body.position.set( 0, -15, 0 );
	body.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI / 32 );

	world.add( body );

	world.addContactMaterial(new CANNON.ContactMaterial(ground_mat, bouncy_mat, { friction: 0.0, restitution: 0.25 }));
}

function addBall() {
	var ball, shape, mass, body;

	if ( !state ) return;

	if (lastBall && lastBallBody) {
		scene.remove(lastBall);
		world.remove(lastBallBody);
		lastVelocity = 0;
	}

	ball = new THREE.Mesh( large_ball_geometry, large_ball_material );
	shape = new CANNON.Sphere( 4 ); // radius is "4"
	mass = 10;

	scene.add( ball );

	body = new CANNON.Body( {mass: mass, shape: shape, material:bouncy_mat} );
	body.mesh = ball; // Save a reference to the 3D mesh

	ball.position.set(
		Math.random() * 40 - 20, // Random positon between -20 and 20
		50,
		Math.random() * 2 - 1
	);

	body.position.set(
		ball.position.x, ball.position.y, ball.position.z
	);

	world.add( body );

	lastBall = ball;
	lastBallBody = body;
}

function updateWorld() {
	requestAnimationFrame( updateWorld );

	if ( !state ) return;

	var delta, now = (new Date()).getTime(),
		i;

	if ( time_last_run ) {
		delta = ( now - time_last_run ) / 1000;
	} else {
		delta = 1 / 60;
	}
	time_last_run = now;

	lastVelocity = Object.assign({}, lastBallBody.velocity);

	world.step( delta * 2 ); // double the speed of the simulation

	lastAcceleration = {
		x: lastBallBody.velocity.x - lastVelocity.x,
		y: lastBallBody.velocity.y - lastVelocity.y,
		z: lastBallBody.velocity.z - lastVelocity.z,
	};

	// Update the scene objects
	lastBallBody.mesh.position.copy( lastBallBody.position);
	lastBallBody.mesh.quaternion.copy( lastBallBody.quaternion);

	renderer.render( scene, camera );
}

function getBallAcceleration() {
	return lastAcceleration;
}

addLights();
buildScene();
addBall();
setInterval( addBall, 3000 );

updateWorld();


