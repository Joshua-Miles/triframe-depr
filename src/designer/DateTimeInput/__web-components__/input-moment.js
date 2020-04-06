import cx from 'classnames';
import React, { Component } from 'react';
import Calendar from './calendar';
import Time from './time';
import { TextInput } from 'react-native-paper'
import './less/input-moment.less'
import { TouchableOpacity, Modal } from '../..';
import { Area } from '../../Layout';
import { Button } from '../../Button';
import { DateTime } from 'triframe/core'

export default class InputMoment extends Component {
  static defaultProps = {
    prevMonthIcon: 'chevron-left',
    nextMonthIcon: 'chevron-right',
    minStep: 1,
    hourStep: 1
  };

  state = {
    moment:  DateTime.fromJSDate(this.props.value) ,
    tab: 0,
    isActive: false
  };

  handleClickTab = (e, tab) => {
    e.preventDefault();
    this.setState({ tab: tab });
  };

  handleSave = e => {
    e.preventDefault();
    if (this.props.onSave) this.props.onSave();
  };

  render() {
    const { tab, isActive,  moment: m, } = this.state;
    const {
      className,
      prevMonthIcon,
      nextMonthIcon,
      minStep,
      hourStep,
      onChange,
      ...props
    } = this.props;
    const cls = cx('m-input-moment', className);

    return (
      <>
        <TouchableOpacity style={{ cursor: 'pointer' }} onPress={() => this.setState({ isActive: true })} >
          <TextInput value={m.toFormat('MM/dd/yy hh:mm a')} />
        </TouchableOpacity>
        <Modal visible={isActive} onDismiss={() => this.setState({ isActive: false })}>
          <Area alignX="center">
            <div className={cls} {...props}>
              <div className="options">
                <button
                  type="button"
                  className={cx('ion-calendar im-btn', { 'is-active': tab === 0 })}
                  onClick={e => this.handleClickTab(e, 0)}
                >
                  Date
              </button>
                <button
                  type="button"
                  className={cx('ion-clock im-btn', { 'is-active': tab === 1 })}
                  onClick={e => this.handleClickTab(e, 1)}
                >
                  Time
          </button>
              </div>

              <div className="tabs">
                <Calendar
                  className={cx('tab', { 'is-active': tab === 0 })}
                  moment={m}
                  onChange={moment => this.setState({ moment })}
                  prevMonthIcon={this.props.prevMonthIcon}
                  nextMonthIcon={this.props.nextMonthIcon}
                />
                <Time
                  className={cx('tab', { 'is-active': tab === 1 })}
                  moment={m}
                  minStep={this.props.minStep}
                  hourStep={this.props.hourStep}
                  onChange={moment => this.setState({ moment })}
                />
              </div>
              <Button icon="check" onPress={() => {
                onChange(m.toJSDate())
                this.setState({ isActive: false })
              }}/>
            </div>
          </Area>
        </Modal>
      </>
    );
  }
}
