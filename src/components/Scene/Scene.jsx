import React from 'react';
import PropTypes from 'prop-types';
import OrbitalContainer from '../../containers/OrbitalContainer';
import Skybox from '../Skybox';

export default class Scene extends React.Component {

  static propTypes = {
    orbitalData: PropTypes.array.isRequired,
    updatePosition: PropTypes.func.isRequired,
    time: PropTypes.number,
    camera: PropTypes.object,
    scale: PropTypes.number
  }

  isActive = (id) => {
    return id === this.props.highlightedOrbital;
  }

  getOrbitalElements = (orbitals, isSatellite) => {
    return orbitals.map((orbital) => {
      return (
      <OrbitalContainer
        {...orbital}
        scale={this.props.scale}
        time={this.props.time}
        camera={this.props.camera}
        updatePosition={this.props.updatePosition}
        isSatellite={isSatellite}
        active={this.isActive(orbital.id)}
        key={orbital.id}>
        {orbital.satellites && this.getOrbitalElements(orbital.satellites, !isSatellite)}
      </OrbitalContainer>
      )
    });
  }

  componentDidMount = () => {
    this.refs.sun.up.set(0,0,1);
  }

  render() {
    return (
      <group>
        {this.getOrbitalElements(this.props.orbitalData)}
        <axisHelper size={500} />
        <pointLight
          color={0xffffff}
          intensity={0.95}
          distance={500}
        />
        <Skybox />
        <mesh lookAt={this.props.cameraMatrix} ref="sun">
          <planeGeometry width={100} height={100} />
          <meshBasicMaterial color={0x00ff00} />
        </mesh>
      </group>
    );
  }
}
