import * as THREE from 'three'
import Starfield from './Starfield.js'
import BlackHole from './BlackHole.js'

export default class World {
    constructor(scene) {
        this.scene = scene
        
        this.setup()
    }

    setup() {
        // Starfield
        this.starfield = new Starfield(this.scene)

        // Black Hole
        this.blackHole = new BlackHole(this.scene)
    }

    update(time) {
        if(this.blackHole)
            this.blackHole.update(time)
            
        if(this.starfield)
            this.starfield.update(time)
    }
}
