import cx from 'classnames';
import React, { Component } from 'react';
import InputSlider from 'react-input-slider';

export default class extends Component {
  changeHours = pos => {
    let m = this.props.moment;
    m = m.set({ hours: pos.x});
    this.props.onChange(m);
  };

  changeMinutes = pos => {
    let m = this.props.moment;
    m = m.set({ minutes: pos.x});
    this.props.onChange(m);
  };

  render() {
    const m = this.props.moment;

    return (
      <div className={cx('m-time', this.props.className)}>
        <div className="showtime">
          <span className="time">{m.toFormat('hh')}</span>
          <span className="separater">:</span>
          <span className="time">{m.toFormat('mm')}</span>
          <span className="separater">:</span>
          <span className="time">{m.toFormat('a')}</span>
        </div>

        <div className="sliders">
          <div className="time-text">Hours:</div>
          <InputSlider
            className="u-slider-time"
            xmin={0}
            xmax={23}
            xstep={this.props.hourStep}
            x={m.hour}
            onChange={this.changeHours}
          />
          <div className="time-text">Minutes:</div>
          <InputSlider
            className="u-slider-time"
            xmin={0}
            xmax={59}
            xstep={this.props.minStep}
            x={m.minute}
            onChange={this.changeMinutes}
          />
        </div>
      </div>
    );
  }
}
