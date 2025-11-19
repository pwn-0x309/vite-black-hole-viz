uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform vec3 uBlackHolePositionScreen; // x, y, z (z is visibility/depth)
uniform float uMass; // Strength of lensing

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
    
    // Black out the center (Event Horizon) if not covered by the 3D sphere
    // Actually, the 3D sphere is already black.
    // But the lensing might pull background *over* the black sphere.
    // So we rely on the 3D scene for the black hole itself, and this pass just distorts the background.
    
    gl_FragColor = color;
}
