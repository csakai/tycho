import React from 'react';
import PropTypes from 'prop-types';

export default class DatePicker extends React.Component {

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    uxTime: PropTypes.string
  }

  render() {
    return (
      <div className="clock">
        <span
          className="clock__display"
          onClick={this.props.onClick}>
          {this.props.uxTime}
        </span>
        {this.props.children}
      </div>
    );
  }
}
