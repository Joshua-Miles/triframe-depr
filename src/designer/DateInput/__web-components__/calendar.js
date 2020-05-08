import React, { Component } from 'react';
import cx from 'classnames';
import { DateTime, Duration } from 'triframe/core'
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

function range(start,end){
  let array = []
  for(let i = start; i < end; i++) array.push(i)
  return array
}


function chunk(array, size){
  let chunk = []
  let result = [ chunk ]
  array.forEach( (element) => {
    chunk.push(element)
    if(chunk.length === size){
      chunk = []
      result.push(chunk)
    }
  })
  return result
}

const oneMonth = Duration.fromObject({ months: 1 })


const Day = ({ i, w, d, className, ...props }) => {
  const prevMonth = w === 0 && i > 7;
  const nextMonth = w >= 4 && i <= 14;
  const cls = cx({
    'prev-month': prevMonth,
    'next-month': nextMonth,
    'current-day': !prevMonth && !nextMonth && i === d
  });

  return <td className={cls} {...props}>{i}</td>;
};

export default class Calendar extends Component {
  selectDate = (i, w) => {
    const prevMonth = w === 0 && i > 7;
    const nextMonth = w >= 4 && i <= 14;
    let m = this.props.moment;

    if (prevMonth) m = m.minus(oneMonth);
    if (nextMonth) m = m.plus(oneMonth);

    m = m.set({ day: i });

    this.props.onChange(m);
  };

  prevMonth = e => {
    e.preventDefault();
    this.props.onChange(this.props.moment.minus(oneMonth));
  };

  nextMonth = e => {
    e.preventDefault();
    this.props.onChange(this.props.moment.plus(oneMonth));
  };

  render() {
    const m = this.props.moment;
    const d = m.day;
    const d1 = m.minus(oneMonth).endOf('month').day;  //31
    const d2 = m.startOf('month').weekday // TODO: Check this 03
    const d3 = m.endOf('month').day // 30
    const days = [].concat(
      range(d1 - d2 + 1, d1 + 1), // 29-31
      range(1, d3 + 1), // 1-30
      range(1, 42 - d3 - d2 + 1) // 1-09
    );
    const weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className={cx('m-calendar', this.props.className)}>
        <div className="toolbar">
          <button type="button" className="prev-month" onClick={this.prevMonth}>
            <Icon style={{ color: 'white', fontSize: 20 }} name={this.props.prevMonthIcon} />
          </button>
          <span className="current-date">{m.toFormat('MMMM yyyy')}</span>
          <button type="button" className="next-month" onClick={this.nextMonth}>
            <Icon style={{ color: 'white', fontSize: 20 }} name={this.props.nextMonthIcon} />
          </button>
        </div>

        <table>
          <thead>
            <tr>
              {weeks.map((w, i) => <td key={i}>{w}</td>)}
            </tr>
          </thead>

          <tbody>
            {chunk(days, 7).map((row, w) =>
              <tr key={w}>
                {row.map(i =>
                  <Day
                    key={i}
                    i={i}
                    d={d}
                    w={w}
                    onClick={() => this.selectDate(i, w)}
                  />
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}
