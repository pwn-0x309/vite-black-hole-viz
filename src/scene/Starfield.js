import * as THREE from 'three'

export default class Starfield {
    constructor(scene) {
        this.scene = scene
        this.setGeometry()
        this.setMaterial()
        this.setPoints()
    }

    setGeometry() {
        this.geometry = new THREE.BufferGeometry()
        const count = 5000

        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)

        for(let i = 0; i < count; i++) {
            const i3 = i * 3
            
            // Random position in a sphere
            const radius = 20 + Math.random() * 30
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
            positions[i3 + 2] = radius * Math.cos(phi)

            // Color
            const color = new THREE.Color()
            color.setHSL(Math.random() * 0.2 + 0.5, 0.8, Math.random() * 0.5 + 0.5)
            
            colors[i3] = color.r
            colors[i3 + 1] = color.g
            colors[i3 + 2] = color.b
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }

    setMaterial() {
        this.material = new THREE.PointsMaterial({
            size: 0.1,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            alphaTest: 0.001,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })
    }

    setPoints() {
        this.points = new THREE.Points(this.geometry, this.material)
        this.scene.add(this.points)
    }
}
