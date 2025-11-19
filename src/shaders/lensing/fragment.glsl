uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform vec3 uBlackHolePositionScreen; // x, y, z (z is visibility/depth)
uniform float uMass; // Strength of lensing
uniform float uBlackHoleRadius;

varying vec2 vUv;

void main()
{
    vec2 uv = vUv;
    vec2 screenPos = uBlackHolePositionScreen.xy;
    
    // Aspect ratio correction
    float aspect = uResolution.x / uResolution.y;
    
    vec2 distVec = uv - screenPos;
    distVec.x *= aspect;
    
    float dist = length(distVec);
    
    // Lensing formula (simplified Einstein ring)
    // Deflection angle alpha = 4GM / (c^2 * b)
    // Here we just distort UVs based on 1/dist
    
    float strength = uMass * 0.05;
    
    // Avoid division by zero and extreme distortion at center
    if(dist < 0.01) dist = 0.01;
    
    vec2 offset = normalize(distVec) * strength / dist;
    
    // Only distort if outside event horizon (approx)
    // This is a 2D post-process, so it's not perfect 3D
    
    vec2 newUv = uv - offset * 0.05; // Scale down effect
    
    // Fetch color
    vec4 color = texture2D(tDiffuse, newUv);
    
    // Photon Ring
    // Calculate distance from center in UV space
    // We want a ring at uBlackHoleRadius * 1.5 (approx photon sphere radius)
    // But let's just put it tight around the black hole.
    
    float radius = uBlackHoleRadius; // Passed from JS
    float ringDist = abs(dist - radius * 1.1); // Slightly larger than EH
    float ringIntensity = 0.002 / (ringDist + 0.0001);
    ringIntensity = smoothstep(0.0, 100.0, ringIntensity);
    ringIntensity *= 0.5; // Adjust brightness
    
    // Add golden color for the ring
    vec3 ringColor = vec3(1.0, 0.8, 0.5) * ringIntensity;
    
    // Mask out if inside the black hole (simple check)
    if(dist < radius) {
        ringColor = vec3(0.0);
    }
    
    color.rgb += ringColor;
    
    gl_FragColor = color;
}
