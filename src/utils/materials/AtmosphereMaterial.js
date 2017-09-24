import * as THREE from 'three';

/**
 * @module Atmospheric Scattering Shader
 * @note This module is currently not used anywhere due to a re-rendering bug in react-three-renderer.
 *
 * @copyright Sean O'Neil
 * @copyright James Baicoianu
 */

/**
 * Returns the shader material config object for creating an atmosphere material.
 *
 * @param {THREE.Camera} camera - scene camera instance
 * @param {Number} radius - radius of sphere to render atmosphere for
 * @param {String} mapDay - url of day map
 * @param {String} mapNight = mapDay - url of night map, if any
 * @returns {Object} config object for shader material
 */
export default function AtmosphereMaterial(camera, radius, mapDay, mapNight) {

  if (!mapNight) {
    mapNight = mapDay;
  }

  const atmosphere = {
    Kr: 0.0025,
    Km: 0.0010,
    ESun: 20.0,
    g: -0.950,
    innerRadius: radius,
    innerSegments: 512,
    outerRadius: radius * 1.025,
    outerSegments: 1024,
    wavelength: [0.550, 0.50, 0.475],
    scaleDepth: 0.25
  };

  const textureLoader = new THREE.TextureLoader();
  const diffuse = textureLoader.load( "https://upload.wikimedia.org/wikipedia/commons/a/ac/Earthmap1000x500.jpg" );
  const diffuseSpecular = textureLoader.load( "https://upload.wikimedia.org/wikipedia/commons/a/ac/Earthmap1000x500.jpg" );
  const diffuseNight = textureLoader.load( "https://eoimages.gsfc.nasa.gov/images/imagerecords/55000/55167/earth_lights_lrg.jpg" );

  const cameraHeight = camera.position.length();
  const uniforms = configureUniforms(diffuse, diffuseSpecular, diffuseNight, atmosphere, cameraHeight);

  return {
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    transparent: true
  };
}


/**
 * Configures shader uniforms.
 *
 * @param {String} diffuse - diffuse day map
 * @param {String} diffuseNight - diffuse night map
 * @param {String} diffuseSpecular - diffuse normal map (usually day map)
 * @param {Object} atmosphere - atmosphere config values
 * @param {Number} cameraHeight - magnitude of camera vector
 * @returns {Object} shader uniforms
 */
const configureUniforms = (diffuse, diffuseNight, diffuseSpecular, atmosphere, cameraHeight) => {
  return {
    m3RotY: {
      type: "m3",
      value: new THREE.Matrix3()
    },
    v3LightPosition: {
      type: "v3",
      value: new THREE.Vector3(1e8, 0, 1e8).normalize()
    },
    v3InvWavelength: {
      type: "v3",
      value: new THREE.Vector3(calcvWaveChannel(atmosphere.wavelength[0]),
          calcvWaveChannel(atmosphere.wavelength[1]),
          calcvWaveChannel(atmosphere.wavelength[2]))
    },
    fCameraHeight: {
      type: "f",
      value: cameraHeight
    },
    fCameraHeight2: {
      type: "f",
      value: Math.pow(cameraHeight, 2)
    },
    fInnerRadius: {
      type: "f",
      value: atmosphere.innerRadius
    },
    fInnerRadius2: {
      type: "f",
      value: atmosphere.innerRadius * atmosphere.innerRadius
    },
    fOuterRadius: {
      type: "f",
      value: atmosphere.outerRadius
    },
    fOuterRadius2: {
      type: "f",
      value: atmosphere.outerRadius * atmosphere.outerRadius
    },
    fKrESun: {
      type: "f",
      value: calcfKrESun(atmosphere.Kr, atmosphere.ESun)
    },
    fKmESun: {
      type: "f",
      value: calcfKmESun(atmosphere.Km, atmosphere.ESun)
    },
    fKr4PI: {
      type: "f",
      value: calcfKr4PI(atmosphere.Kr)
    },
    fKm4PI: {
      type: "f",
      value: calcfKm4PI(atmosphere.Km)
    },
    fScale: {
      type: "f",
      value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius)
    },
    fScaleDepth: {
      type: "f",
      value: atmosphere.scaleDepth
    },
    fScaleOverScaleDepth: {
      type: "f",
      value: calcfScaleOverScaleDepth(atmosphere.innerRadius, atmosphere.outerRadius, atmosphere.scaleDepth)
    },
    g: {
      type: "f",
      value: atmosphere.g
    },
    g2: {
      type: "f",
      value: atmosphere.g * atmosphere.g
    },
    tDiffuse: {
      type: "t",
      value: diffuse
    },
    tDiffuseNight: {
      type: "t",
      value: diffuseNight
    },
    tDiffuseSpecular: {
      type: "t",
      value: diffuseSpecular
    },
    fNightScale: {
      type: "f",
      value: 1
    },
    fSpecularScale: {
      type: "f",
      value: 1
    },
    fSpecularSize: {
      type: "f",
      value: 25
    }
  };
}

/**
 * Helper methods
 *
 * @copyright James Baicoianu
 */
const calcfKrESun = (Kr, ESun) => {
  return Kr * ESun
}

const calcfKmESun = (Km, ESun) => {
  return Km * ESun
}

const calcfKr4PI = (Kr) => {
  return Kr * 4 * Math.PI
}

const calcfKm4PI = (Km) => {
  return Km * 4 * Math.PI
}

const calcfScaleOverScaleDepth = (innerRadius, outerRadius, scaleDepth) => {
  return 1 / (outerRadius - innerRadius) / scaleDepth
}

const calcvWaveChannel = (val) => {
  return 1 / Math.pow(val, 4)
}

/**
 * Atmospheric scattering vertex shader
 *
 * @author Sean O'Neil
 * @copyright 2004 Sean O'Neil
 */
const vertexShader = `
  uniform mat3 m3RotY;
  uniform vec3 v3LightPosition;	// The direction vector to the light source
  uniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels
  uniform float fCameraHeight;	// The camera's current height
  uniform float fCameraHeight2;	// fCameraHeight^2
  uniform float fOuterRadius;		// The outer (atmosphere) radius
  uniform float fOuterRadius2;	// fOuterRadius^2
  uniform float fInnerRadius;		// The inner (planetary) radius
  uniform float fInnerRadius2;	// fInnerRadius^2
  uniform float fKrESun;			// Kr * ESun
  uniform float fKmESun;			// Km * ESun
  uniform float fKr4PI;			// Kr * 4 * PI
  uniform float fKm4PI;			// Km * 4 * P
  uniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)
  uniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)
  uniform float fScaleOverScaleDepth;	// fScale / fScaleDepth

  const int nSamples = 3;
  const float fSamples = 3.0;

  varying vec3 v3Direction;
  varying vec3 c0;
  varying vec3 c1;

  float scale(float fCos)
  {
    float x = 1.0 - fCos;
    return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));
  }

  void main(void)
  {
    vec3 corrCameraPosition = m3RotY * cameraPosition;
    // Get the ray from the camera to the vertex and its length
    // (which is the far point of the ray passing through the atmosphere)
    vec3 v3Ray = position - corrCameraPosition;
    float fFar = length(v3Ray);
    v3Ray /= fFar;

    // Calculate the closest intersection of the ray with the outer atmosphere
    // (which is the near point of the ray passing through the atmosphere)
    float B = 2.0 * dot(corrCameraPosition, v3Ray);
    float C = fCameraHeight2 - fOuterRadius2;
    float fDet = max(0.0, B*B - 4.0 * C);
    float fNear = 0.5 * (-B - sqrt(fDet));

    // Calculate the ray's starting position, then calculate its scattering offset
    vec3 v3Start = corrCameraPosition + v3Ray * fNear;
    fFar -= fNear;
    float fStartAngle = dot(v3Ray, v3Start) / fOuterRadius;
    float fStartDepth = exp(-1.0 / fScaleDepth);
    float fStartOffset = fStartDepth * scale(fStartAngle);

    // Initialize the scattering loop variables
    float fSampleLength = fFar / fSamples;
    float fScaledLength = fSampleLength * fScale;
    vec3 v3SampleRay = v3Ray * fSampleLength;
    vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;

    // Now loop through the sample rays
    vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);

    for(int i=0; i<nSamples; i++)
    {
      float fHeight = length(v3SamplePoint);
      float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));
      float fLightAngle = dot(m3RotY*v3LightPosition, v3SamplePoint) / fHeight;
      float fCameraAngle = dot(v3Ray, v3SamplePoint) / fHeight;
      float fScatter = (fStartOffset + fDepth * (scale(fLightAngle) - scale(fCameraAngle)));
      vec3 v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));

      v3FrontColor += v3Attenuate * (fDepth * fScaledLength);
      v3SamplePoint += v3SampleRay;
    }

    // Finally, scale the Mie and Rayleigh colors and set up the varying variables for the pixel shader
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    c0 = v3FrontColor * (v3InvWavelength * fKrESun);
    c1 = v3FrontColor * fKmESun;
    v3Direction = corrCameraPosition - position;
  }
`;

/**
 * Atmospheric scattering fragment shader
 *
 * @author Sean O'Neil
 * @copyright 2004 Sean O'Neil
 */
const fragmentShader = `
  uniform vec3 v3LightPos;
  uniform float g;
  uniform float g2;
  varying vec3 v3Direction;
  varying vec3 c0;
  varying vec3 c1;

  // Calculates the Mie phase function
  float getMiePhase(float fCos, float fCos2, float g, float g2)
  {
    return 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + fCos2) / pow(1.0 + g2 - 2.0 * g * fCos, 1.5);
  }

  // Calculates the Rayleigh phase function
  float getRayleighPhase(float fCos2)
  {
    return 0.75 + 0.75 * fCos2;
  }

  void main (void)
  {
    float fCos = dot(v3LightPos, v3Direction) / length(v3Direction);
    float fCos2 = fCos * fCos;
    
    vec3 color = getRayleighPhase(fCos2) * c0 + getMiePhase(fCos, fCos2, g, g2) * c1;
    
    gl_FragColor = vec4(color, 1.0);
    gl_FragColor.a = gl_FragColor.b;
  }
`;
