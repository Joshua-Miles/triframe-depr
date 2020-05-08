import cx from 'classnames';
import React, { Component } from 'react';
import Calendar from './calendar';
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
    cachedValue: this.props.value,
    tab: 0,
    isActive: false
  };


  componentDidUpdate(){
    if(this.state.cachedValue != this.props.value){
      this.setState({
        cachedValue: this.props.value,
        moment: DateTime.fromJSDate(this.props.value)
      })
    }
  }

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
      value,
      ...props
    } = this.props;
    const cls = cx('m-input-moment', className);
    return (
      <>
        <TouchableOpacity style={{ cursor: 'pointer' }} onPress={() => this.setState({ isActive: true })} >
          <TextInput value={m.toFormat('MM/dd/yy')}  {...props} />
        </TouchableOpacity>
        <Modal visible={isActive} onDismiss={() => this.setState({ isActive: false })}>
          <Area alignX="center">
            <div className={cls}>
              <div className="tabs">
                <Calendar
                  moment={m}
                  onChange={moment => this.setState({ moment })}
                  prevMonthIcon={this.props.prevMonthIcon}
                  nextMonthIcon={this.props.nextMonthIcon}
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
