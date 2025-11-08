const shader = {
	vertex: `void main() {
	gl_Position = vec4( position, 1.0 );
    }`,
	fragment: `precision mediump float;
	uniform	vec2 resolution;
	uniform vec2 mouse;
	uniform	float time;
	const	float	rndc = 43758.5453123;
	
	float rand (float n) { return fract(sin(n) * rndc); }
	
	vec2 rand2 (in vec2 p) { return fract(vec2(sin(p.x * 591.32 + p.y * 154.077), cos(p.x * 391.32 + p.y * 49.077))); }
	
	float noise1 (float p) { float fl = floor(p), fc = fract(p); return mix(rand(fl), rand(fl + 1.000004), fc); }
	
	float voronoi (vec2 x) {
	vec2 p = floor(x), f = fract(x), res = vec2(8.0);
	for(int j = -1; j <= 1; j ++)
	for(int i = -1; i <= 1; i ++) {
	vec2 b = vec2(i, j), r = vec2(b) - f + rand2(p + b);
	float d = max(abs(r.x), abs(r.y));
	if(d < res.x) { res.y = res.x; res.x = d; } else if(d < res.y) { res.y = d; }
    }
    return res.y - res.x;
	}
	
	void main (void) {
    vec4 channelA, channelB;
    vec2 xy = gl_FragCoord.xy / resolution.xy;
    xy = (xy - 0.5) * 2.0;
    vec2 xy2 = xy;
    xy.x *= resolution.x / resolution.y;
    float v = 0.0; v = 0.21 - length(xy) * 0.21;
    xy /= 0.6 + sin(time * 0.07) * 0.22;
    xy += time * 0.12;
    float a = 0.7, f = 1.0;
    for(int i = 0; i < 3; i ++) {
	float v1 = voronoi(xy * f + 5.0);
	float v2 = 0.0;
	if(i > 0) {
	float va = 0.0, vb = 0.0;
	if (i == 1) {
	va = 1.0 - smoothstep(0.0, 0.12, v1);
	v2 = voronoi(xy * f * 0.5 / 5.0 + 8694.0 + time / 7.0);
	vb = 1.0 - smoothstep(0.0, 0.1, v2);
	} else {
	va = 1.0 - smoothstep(0.0, 0.1, v1);
	v2 = voronoi(xy * f * 0.5 + 50.0 + time / 5.0);
	vb = 1.0 - smoothstep(0.0, 0.03, v2);
	}
	v += a * pow(va * (0.5 + vb), 2.0);
	}
	v1 = 1.0 - smoothstep(0.0, 0.2, v1);
	v2 = mix(0.12, a * (noise1(v1 * 7.5 + 0.3)), sin(time / 7.0));
	if(i == 0) { v += v2; }
	f *= 3.0;
	a *= 0.7 + abs(sin(time / 3.0)) / 3.0;
    }
    v *= exp(-0.6 * length(xy2)) * 1.2;
    vec3 cexp = vec3(4.0, 1.5, 1.2);
    cexp *= 1.012;
    vec3 col = vec3(pow(abs(v), cexp.x), pow(abs(v), cexp.y), pow(abs(v), cexp.z)) * 4.0;
    gl_FragColor = vec4(col, 0.5);
	}`
};	
var container;
var camera, scene, renderer;
var uniforms;

init();
animate();

function init() {
	container = document.getElementById( 'bg-19' );
	camera = new THREE.Camera();
	camera.position.z = 1;
	scene = new THREE.Scene();
	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
	uniforms = {
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2() },
		mouse: { type: "v2", value: new THREE.Vector2() }
	};
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: shader.vertex,
		fragmentShader: shader.fragment
	});
	var mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	container.appendChild( renderer.domElement );
	
	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize( event ) {
  	renderer.setSize( container.offsetWidth, container.offsetHeight );
	uniforms.resolution.value.x = renderer.domElement.width;
	uniforms.resolution.value.y = renderer.domElement.height;
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	uniforms.time.value += 0.01;
	renderer.render( scene, camera );
}