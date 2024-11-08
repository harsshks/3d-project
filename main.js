import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { gsap } from 'gsap'

//scene
const scene = new THREE.Scene();
//camera 
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 10;

//renderer
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#canvas'), antialias: true, alpha: true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Post processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0010;
composer.addPass(rgbShiftPass);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();


// Load HDRI environment map
new RGBELoader()
    .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/metro_noord_1k.hdr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = pmremGenerator.fromEquirectangular(texture).texture;
        
    });

//load gltf model
const loader = new GLTFLoader();
let model;

loader.load(
    './DamagedHelmet.gltf',
    function (gltf) {
        model = gltf.scene;
        scene.add(model);
        model.position.set(0, 0, 0);
        model.scale.set(2, 2, 2);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error happened:', error);
    }
);

window.addEventListener('mousemove', (e) => {
    if (model) {
        const rotationX = (e.clientX / window.innerWidth- 0.5) * Math.PI * .11;
        const rotationY = (e.clientY / window.innerHeight- 0.5) * Math.PI * .11;
        gsap.to(model.rotation, {
            x: rotationY,
            y: rotationX,
            duration: 0.9,  
            ease: "power2.out"
        });
    }
});

window.addEventListener('resize', () => {
    composer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
//render
function animate() {
    window.requestAnimationFrame(animate);
    if (model) {
       
    }
    composer.render();
}

animate();
