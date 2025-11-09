let isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
let isPaused = false;
let lastFrameTime = 0;
const MIN_FRAME_INTERVAL = 1000 / 20; // Ограничение до 30 FPS

let container, camera, scene, renderer, uniforms, texture;


// Шейдеры
const shader = {
  vertex: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragment: `
    precision mediump float;
    
    uniform vec2 resolution;
    uniform vec2 mouse;
    uniform float time;
    uniform float isMobile;
    
    const float rndc = 43758.5453123;
    
    float rand(float n) { 
      return fract(sin(n) * rndc);
    }
    
    vec2 rand2(in vec2 p) {
      return fract(vec2(
        sin(p.x * 591.32 + p.y * 154.077),
        cos(p.x * 391.32 + p.y * 49.077)
      ));
    }
    
    float noise1(float p) {
      float fl = floor(p), fc = fract(p);
      return mix(rand(fl), rand(fl + 1.000004), fc);
    }
    
    float voronoi(vec2 x) {
      vec2 p = floor(x), f = fract(x), res = vec2(8.0);
      for(int j = -1; j <= 1; j++) {
        for(int i = -1; i <= 1; i++) {
          vec2 b = vec2(i, j);
          vec2 r = vec2(b) - f + rand2(p + b);
          float d = max(abs(r.x), abs(r.y));
          if(d < res.x) {
            res.y = res.x;
            res.x = d;
          } else if(d < res.y) {
            res.y = d;
          }
        }
      }
      return res.y - res.x;
    }
    
    void main(void) {
      // Для мобильных — упрощённый шейдер
      if (isMobile > 0.5) {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        uv = (uv - 0.5) * 2.0;
        uv.x *= resolution.x / resolution.y;
        
        float v = 0.15 * sin(time * 0.2 + uv.x * 8.0 + uv.y * 4.0);
        v += 0.1 * cos(time * 0.3 + uv.y * 6.0);
        
        vec3 col = vec3(
          abs(v) * 0.7,
          abs(v) * 0.4,
          abs(v) * 0.2
        );
        
        gl_FragColor = vec4(col, 0.6);
        return;
      }
      
      // Полный шейдер для десктопов
      vec4 channelA, channelB;
      vec2 xy = gl_FragCoord.xy / resolution.xy;
      xy = (xy - 0.5) * 2.0;
      vec2 xy2 = xy;
      xy.x *= resolution.x / resolution.y;
      
      float v = 0.0;
      v = 0.21 - length(xy) * 0.21;
      xy /= 0.6 + sin(time * 0.07) * 0.22;
      xy += time * 0.12;
      
      float a = 0.7, f = 1.0;
      for(int i = 0; i < 3; i++) {
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
        if(i == 0) {
          v += v2;
        }
        f *= 3.0;
        a *= 0.7 + abs(sin(time / 3.0)) / 3.0;
      }
      
      v *= exp(-0.6 * length(xy2)) * 1.2;
      vec3 cexp = vec3(4.0, 1.5, 1.2);
      cexp *= 1.012;
      vec3 col = vec3(
        pow(abs(v), cexp.x),
        pow(abs(v), cexp.y),
        pow(abs(v), cexp.z)
      ) * 4.0;
      
      gl_FragColor = vec4(col, 0.5);
    }
  `
};



init();
animate();

function init() {
  container = document.getElementById('bg-19');
  
  // Камера и сцена
  camera = new THREE.Camera();
  camera.position.z = 1;
  scene = new THREE.Scene();
  
  // Геометрия
  const geometry = new THREE.PlaneBufferGeometry(2, 2);
  
  // Униформы с флагом мобильного устройства
  uniforms = {
    time: { type: 'f', value: 1.0 },
    resolution: { type: 'v2', value: new THREE.Vector2() },
    mouse: { type: 'v2', value: new THREE.Vector2() },
    isMobile: { type: 'f', value: isMobile ? 1.0 : 0.0 }
  };
  
  // Материал с шейдерами
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertex,
    fragmentShader: shader.fragment
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
  // Рендерер
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  
  
  // Обработчики событий
  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });
}

function onWindowResize() {
  // Ограничение максимального размера для мобильных
  const maxWidth = isMobile ? 800 : window.innerWidth;
  const maxHeight = isMobile ? 600 : window.innerHeight;
  
  const width = Math.min(container.offsetWidth, maxWidth);
  const height = Math.min(container.offsetHeight, maxHeight);
  
  renderer.setSize(width, height);
  uniforms.resolution.value.x = width;
  uniforms.resolution.value.y = height;
}

function animate(timestamp) {
  // Приоритет: пауза при неактивной вкладке
  if (isPaused) {
    requestAnimationFrame(animate);
    return;
  }
  
  // Контроль FPS
  if (timestamp - lastFrameTime < MIN_FRAME_INTERVAL) {
    requestAnimationFrame(animate);
    return;
  }
  lastFrameTime = timestamp;
  
  render();
  requestAnimationFrame(animate);
}

function render() {
  uniforms.time.value += 0.01;
  renderer.render(scene, camera);
}