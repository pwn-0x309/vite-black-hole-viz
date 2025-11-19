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
        const scales = new Float32Array(count)

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
            
            // Scale
            scales[i] = Math.random()
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    }

    setMaterial() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uPixelRatio;
                attribute float aScale;
                attribute vec3 color;
                varying vec3 vColor;
                
                void main() {
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectionPosition = projectionMatrix * viewPosition;
                    
                    gl_Position = projectionPosition;
                    
                    // Twinkle effect
                    float twinkle = sin(uTime * 3.0 + position.x * 100.0 + position.y * 50.0) * 0.5 + 0.5;
                    
                    gl_PointSize = 150.0 * aScale * uPixelRatio; // Increased base size
                    gl_PointSize *= (0.5 + twinkle * 0.5); // Twinkle modulation
                    gl_PointSize *= (1.0 / - viewPosition.z); // Size attenuation
                    
                    vColor = color;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    // Circular point
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    if(distanceToCenter > 0.5) discard;
                    
                    // Glow
                    // float strength = 0.05 / distanceToCenter - 0.1;
                    float strength = 1.0 - (distanceToCenter * 2.0); // Linear falloff
                    strength = pow(strength, 3.0); // Sharper falloff
                    
                    gl_FragColor = vec4(vColor, strength);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    }

    setPoints() {
        this.points = new THREE.Points(this.geometry, this.material)
        this.scene.add(this.points)
    }

    update(time) {
        if(this.material) {
            this.material.uniforms.uTime.value = time
        }
    }
}
