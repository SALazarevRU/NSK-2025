
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 800;
}

const isMobile = isMobileDevice();
const targetFPS = isMobile ? 30 : 60;
const MIN_FRAME_INTERVAL = 1000 / targetFPS;
let isPaused = false;
let lastFrameTime = 0;

let container, camera, scene, renderer, uniforms;

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

    vec2 rand2(vec2 p) {
      return fract(vec2(
        sin(p.x * 591.32 + p.y * 154.077),
        cos(p.x * 391.32 + p.y * 49.077)
      ));
    }

    float voronoi(vec2 x) {
      vec2 p = floor(x), f = fract(x);
      float res = 8.0;
      for(float j = -1.0; j <= 1.0; j += 1.0) {
        for(float i = -1.0; i <= 1.0; i += 1.0) {
          vec2 b = vec2(i, j);
          vec2 r = b - f + rand2(p + b);
          float d = dot(r, r);
          if (d < res) res = d;
        }
      }
      return res;
    }

    void main() {
      if (isMobile == 1.0) {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        uv = (uv - 0.5) * 2.0;
        uv.x *= resolution.x / resolution.y;

        float v = sin(time * 0.2 + uv.x * 4.0) * 0.3;
        vec3 col = vec3(abs(v) * 0.7, abs(v) * 1.8, abs(v) * 0.2);
        gl_FragColor = vec4(col, 0.6);
        return;
      } else {
        vec2 xy = gl_FragCoord.xy / resolution.xy;
        xy = (xy - 0.5) * 2.0;
        xy.x *= resolution.x / resolution.y;

        float v = 0.21 - length(xy) * 0.21;
        xy /= 0.6 + sin(time * 0.07) * 0.22;
        xy += time * 0.12;

        float a = 0.7, f = 1.0;
        for(int i = 0; i < 1; i++) {  // Уменьшено с 2 до 1
          float v1 = voronoi(xy * f + 5.0);
          v1 = v1 < 0.12 ? (1.0 - v1 / 0.12) : 0.0;  // Вместо smoothstep
          v += a * v1 * v1;  // Вместо pow(v1, 2.0)
          f *= 3.0;
          a *= 0.7 + abs(sin(time / 3.0)) / 3.0;
        }

        float dist = length(xy);
        v *= max(0.0, 1.0 - 0.4 * dist);
        vec3 col = vec3(v * v, v, v * v * 0.5) * 2.0;
        gl_FragColor = vec4(col, 1.0);
      }
    }
  `
};

function init() {
  container = document.getElementById('bg-19');
  const canvas = document.getElementById('webgl-canvas');

  camera = new THREE.Camera();
  camera.position.z = 1;
  scene = new THREE.Scene();

  const geometry = new THREE.PlaneBufferGeometry(2, 2);

  uniforms = {
    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2() },
    mouse: { value: new THREE.Vector2() },
    isMobile: { value: isMobile ? 1.0 : 0.0 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertex,
    fragmentShader: shader.fragment,
    transparent: false
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'low-power',
      premultipliedAlpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  } catch (e) {
    console.error('WebGL error:', e);
    container.innerHTML = '<p style="color:white;">WebGL недоступен</p>';
    return;
  }

  // СКРЫВАЕМ СООБЩЕНИЕ О ЗАГРУЗКЕ
 const loader = document.querySelector('.loading-message');
if (loader) {
  loader.classList.add('fade-out');
  // Удаляем элемент после анимации
  setTimeout(() => loader.remove(), 500);
}

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });

  window.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    uniforms.mouse.value.x = touch.clientX;
    uniforms.mouse.value.y = touch.clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    uniforms.mouse.value.x = touch.clientX;
    uniforms.mouse.value.y = touch.clientY;
  }, { passive: true });
}

function onWindowResize() {
  const width = container.offsetWidth;
  const height = container.offsetHeight;

  // Защита от нулевых размеров
  if (width === 0 || height === 0) return;

  renderer.setSize(width, height);
  uniforms.resolution.value.set(width, height);
}

function animate(timestamp) {
  if (isPaused) {
    requestAnimationFrame(animate);
    return;
  }

  // Ограничение FPS
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

  // Отладка FPS (раскомментировать при необходимости)
  // console.log('FPS:', 1000 / (performance.now() - lastFrameTime));

  renderer.render(scene, camera);
}

// Запуск приложения
init();
animate();

// Дополнительная защита от потери контекста WebGL
window.addEventListener('pagehide', () => {
  if (renderer) renderer.dispose();
});

// Обработка восстановления страницы
window.addEventListener('pageshow', () => {
  if (!renderer) init();
});