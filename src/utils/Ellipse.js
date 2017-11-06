import * as THREE from 'three';
import Constants from '../constants';
import Physics from '../services/Physics';
import Math2 from '../services/Math2';
import Scale from '../utils/Scale';

export default class Ellipse {

  /**
   * Ininitializes a new instance of Ellipse.
   *
   * @note Triggers render.
   * @param {Object} props - orbital data
   * @param {Number} props.semimajor - semimajor axis, in km
   * @param {Number} props.semiminor - semiminor axis, in km
   * @param {Number} props.eccentricity - orbital path eccentricity
   * @param {Number} props.scale - scaling factor
   */
  constructor({semimajor, semiminor, eccentricity, scale}) {
    this.semimajor = Scale(semimajor);
    this.semiminor = Scale(semiminor);
    this.eccentricity = eccentricity;
    this.render();
  }

  /**
   * Renders the ellipse prop.
   *
   * @returns {Object3D} ellipse
   */
  render = () => {
    this.ellipse = this.getEllipseCurve();
    this.path = this.getPath();
    this.geometry = this.getGeometry();
    this.path.add(this.ellipse);
  }

  /**
   * Returns instance of geometry from instance of ellipse points.
   *
   * @returns {THREE.Geometry} geometry
   */
  getGeometry = () => {
    return this.path.createPointsGeometry(
      Constants.WebGL.Ellipse.POINTS
    );
  }

  /**
   * Returns instance of path from instance of ellipse points.
   *
   * @returns {THREE.Path} path
   */
  getPath = () => {
    return new THREE.CurvePath();
  }

  /**
   * Instance of Ellipse curve.
   *
   * @returns {EllipseCurve}
   */
  getEllipseCurve = () => {
    const focus = Math2.getFocus(this.semimajor, this.semiminor);

    return new THREE.EllipseCurve(0,
      focus, 
      this.semiminor,
      this.semimajor,
      Constants.WebGL.Ellipse.START,
      Constants.WebGL.Ellipse.END
    );
  }

  /**
   * Calculates vertices needed to form the elliptical curve in 2D space.
   *
   * @note temporary workaround for CurvePath being unable to render vertices
   * @return {THREE.Vector2[]} array of two-dimensional vertices
   */
  getVertices = () => {
    const points = Constants.WebGL.Ellipse.POINTS;
    const path = new THREE.Path(this.ellipse.getPoints(points));
    const geometry = path.createPointsGeometry(points);

    path.add(this.ellipse);

    return geometry.vertices;
  }

  /**
   * Returns the current vector position of the mesh.
   * All parameter times must be in UNIX time.
   *
   * @param {Number} time - current timestamp 
   * @param {Object} periapses - {lastPeriapsis: Number, nextPeriapsis: Number}
   * @returns {Vector3} current position
   */
  getPosition = (time, periapses, name) => {
    const percent = Physics.ellipticPercent(
      this.eccentricity, time, periapses
    );
    const vector2d = this.path.getPoint(percent);

    return new THREE.Vector3(vector2d.x, vector2d.y);
  }
}
