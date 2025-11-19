import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats.js'
import World from './scene/World.js'



// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}



// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 8
camera.position.y = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Post-processing
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import lensingVertexShader from './shaders/lensing/vertex.glsl?raw'
import lensingFragmentShader from './shaders/lensing/fragment.glsl?raw'
import * as dat from 'dat.gui'

// Debug
const gui = new dat.GUI()
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)



// Composer
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

// Bloom
const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 1.5, 0.4, 0.85)
bloomPass.threshold = 0.2
bloomPass.strength = 1.5
bloomPass.radius = 0.5
composer.addPass(bloomPass)

const lensingPass = new ShaderPass({
    uniforms: {
        tDiffuse: { value: null },
        uResolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
        uBlackHolePositionScreen: { value: new THREE.Vector3(0.5, 0.5, 0) },
        uMass: { value: 0 }
    },
    vertexShader: lensingVertexShader,
    fragmentShader: lensingFragmentShader
})
composer.addPass(lensingPass)

// UI
const folderBlackHole = gui.addFolder('Black Hole')
folderBlackHole.add(lensingPass.uniforms.uMass, 'value').min(0).max(5).step(0.01).name('Mass')
folderBlackHole.open()

const folderBloom = gui.addFolder('Bloom')
folderBloom.add(bloomPass, 'strength').min(0).max(3).step(0.01).name('Strength')
folderBloom.add(bloomPass, 'radius').min(0).max(1).step(0.01).name('Radius')
folderBloom.add(bloomPass, 'threshold').min(0).max(1).step(0.01).name('Threshold')

// Resize handling
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    // Update composer
    composer.setSize(sizes.width, sizes.height)
    bloomPass.resolution.set(sizes.width, sizes.height)
    lensingPass.uniforms.uResolution.value.set(sizes.width, sizes.height)
})

// World
const world = new World(scene)

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Update world
    world.update(elapsedTime)

    // Update Lensing Uniforms
    // Project black hole position to screen space
    if(world.blackHole && world.blackHole.mesh) {
        const blackHolePos = world.blackHole.mesh.position.clone()
        blackHolePos.project(camera)
        
        // Convert from [-1, 1] to [0, 1]
        const x = blackHolePos.x * 0.5 + 0.5
        const y = blackHolePos.y * 0.5 + 0.5
        
        lensingPass.uniforms.uBlackHolePositionScreen.value.set(x, y, blackHolePos.z)
        lensingPass.uniforms.uMass.value = 1.0 // Set mass
    }
    
    lensingPass.uniforms.uResolution.value.set(sizes.width, sizes.height)

    // Render
    // renderer.render(scene, camera)
    composer.render()

    stats.end()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
