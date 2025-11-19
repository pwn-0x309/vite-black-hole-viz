import * as THREE from 'three'
import diskVertexShader from '../shaders/disk/vertex.glsl?raw'
import diskFragmentShader from '../shaders/disk/fragment.glsl?raw'

export default class BlackHole {
    constructor(scene) {
        this.scene = scene
        
        this.setEventHorizon()
        this.setAccretionDisk()
    }

    setEventHorizon() {
        this.eventHorizonGeo = new THREE.SphereGeometry(1, 64, 64)
        this.eventHorizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
        this.eventHorizon = new THREE.Mesh(this.eventHorizonGeo, this.eventHorizonMat)
        this.scene.add(this.eventHorizon)
    }

    setAccretionDisk() {
        this.diskGeo = new THREE.RingGeometry(1.5, 4, 64)
        // Rotate to be flat
        this.diskGeo.rotateX(-Math.PI * 0.5)
        
        this.diskMat = new THREE.ShaderMaterial({
            vertexShader: diskVertexShader,
            fragmentShader: diskFragmentShader,
            uniforms: {
                uTime: { value: 0 }
            },
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })
        
        this.disk = new THREE.Mesh(this.diskGeo, this.diskMat)
        this.scene.add(this.disk)
    }

    update(time) {
        if(this.diskMat) {
            this.diskMat.uniforms.uTime.value = time
        }
    }
}
