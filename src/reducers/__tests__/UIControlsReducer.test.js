import reducer from '../UIControlsReducer';
import ReduxService from '../../services/ReduxService';
import Actions from '../../constants/Actions';

describe('UIControls Reducer', () => {
  it('should return the state', () => {
    const state = {zoom: 10};
    const result = reducer(state, {});

    expect(result).toEqual(state);
  });

  it('should handle ZOOM_CHANGE', () => {
    const zoom = 10;
    const result = reducer(undefined, {
      type: Actions.ZOOM_CHANGE,
      zoom
    });

    expect(result).toEqual({zoom});
  });

  it('should handle CAMERA_PANNED', () => {
    const newVector = {x: 1, y: 2, z: 3};
    const result = reducer(undefined, {
      type: Actions.CAMERA_PANNED,
      newVector
    });

    expect(result).toEqual({newVector});
  });

  it('should handle SPEED_CHANGE', () => {
    const speed = 10;
    const result = reducer(undefined, {
      type: Actions.SPEED_CHANGE,
      speed
    });

    expect(result).toEqual({speed});
  });

  it('should handle SCALE_CHANGE', () => {
    const scale = 5;
    const result = reducer(undefined, {
      type: Actions.SCALE_CHANGE,
      scale
    });

    expect(result).toEqual({scale});
  });

  it('should handle TIME_OFFSET_CHANGE', () => {
    const timeOffset = 12345;
    const result = reducer(undefined, {
      type: Actions.TIME_OFFSET_CHANGE,
      timeOffset
    });

    expect(result).toEqual({timeOffset});
  });

  it('should handle SET_UI_CONTROLS', () => {
    const controlsEnabled = true;
    const result = reducer(undefined, {
      type: Actions.SET_UI_CONTROLS,
      controlsEnabled
    });

    expect(result).toEqual({controlsEnabled});
  });

  it('should handle MODAL_ACTIVE', () => {
    const modalActive = true;
    const result = reducer(undefined, {
      type: Actions.MODAL_ACTIVE,
      modalActive
    });

    expect(result).toEqual({modalActive});
  });
});
