import React from 'react';
import classNames from 'classnames';

function getMetrics(target) {
  return target.getClientRects()[0];
}

function inside(event) {
  let {left, right, top, bottom} = getMetrics(event.target);
  let {clientX, clientY} = event.touches[0];
  if (left <= clientX && clientX <= right && top <= clientY && clientY <= bottom) {
    return true;
  } else {
    return false;
  }
}

export default class TextButton extends React.Component {

  static propTypes = {
    component: React.PropTypes.any.isRequired,
    className: React.PropTypes.string.isRequired,
    style: React.PropTypes.object.isRequired,
    touchUpInside: React.PropTypes.func
  };

  static defaultProps = {
    component: 'span',
    className: 'text-button',
    style: {}
  };

  constructor(props, context) {
    super(props, context);
    this.state = {on: false};
  }

  componentDidMount() {
    if (!window.ontouchstart) {
      this.windowMouseUp = () => {
        this.mouseDown = false;
      };
      window.addEventListener('mouseup', this.windowMouseUp);
    }
  }

  componentWillUnmount() {
    if (!window.ontouchstart) {
      window.removeEventListener('mouseup', this.windowMouseUp);
    }
  }

  handlers() {
    if (window.ontouchstart === undefined) {
      return {
        onMouseDown: event => {
          this.mouseDown = true;
          this.setState({on: true});
        },
        onMouseUp: event => {
          this.mouseDown = false;
          this.setState({on: false});
          this.props.touchUpInside && this.props.touchUpInside();
        },
        onMouseEnter: event => {
          if (!this.mouseDown) return;
          this.setState({on: true});

        },
        onMouseOut: event => {
          if (!this.mouseDown) return;
          this.setState({on: false});
        }
      }
    } else {
      return {
        onTouchStart: event => {
          this.touchInside = true;
          this.setState({on: true});
          event.preventDefault();
        },
        onTouchMove: event => {
          if (inside(event)) {
            if (!this.touchInside) {
              this.touchInside = true;
              this.setState({on: true});
            }
          } else {
            if (this.touchInside) {
              this.touchInside = false;
              this.setState({on: false});
            }
          }
          event.preventDefault();
        },
        onTouchEnd: event => {
          if (this.touchInside) {
            this.props.touchUpInside && this.props.touchUpInside();
          }
          this.touchInside = false;
          this.setState({on: false});
          event.preventDefault();
        },
        onTouchCancel: event => {
          this.touchInside = false;
          this.setState({on: false});
          event.preventDefault();
        }
      }
    }
  }

  render() {
    let {component, style} = this.props;
    let className = classNames(this.props.className, this.state);
    let props = {style, className, ...::this.handlers()};
    return React.createElement(component, props, this.props.children);
  }
}