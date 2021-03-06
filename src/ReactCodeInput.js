import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const BACKSPACE_KEY = 8
const LEFT_ARROW_KEY = 37
const UP_ARROW_KEY = 38
const RIGHT_ARROW_KEY = 39
const DOWN_ARROW_KEY = 40

class ReactCodeInput extends Component {
  constructor(props) {
    super(props)

    const { value, fields, isValid, disabled } = props

    this.state = {
      value,
      fields,
      type: 'number',
      input: [],
      isValid,
      disabled,
      defaultInputStyle: {
        fontFamily: 'monospace',
        MozAppearance: 'textfield',
        borderRadius: '6px',
        border: '1px solid',
        boxShadow: '0px 0px 10px 0px rgba(0,0,0,.10)',
        margin: '4px',
        paddingLeft: '8px',
        width: '36px',
        height: '42px',
        fontSize: '32px',
        boxSizing: 'border-box'
      }
    }
    for (let i = 0; i < Number(this.state.fields); i += 1) {
      if (i < 32) {
        const value = [...this.state.value][i] || ''
        this.state.input.push(value)
      }
    }
    this.textInput = [];
    document.addEventListener('focusout', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, true);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isValid: nextProps.isValid,
      value: nextProps.value,
      disabled: nextProps.disabled
    })
  }

  handleBlur(e) {
    this.handleTouch(e.target.value)
  }

  handleTouch(value) {
    const { touch, untouch, name } = this.props

    if (typeof touch === 'function' && typeof untouch === 'function') {
      if (value === '') {
        touch(name)
      } else {
        untouch(name)
      }
    }
  }

  handleChange(e) {
    const { type } = this.state;
    const target = Number(e.target.id)
    let inputValue = String(e.target.value)
    let value;

    if (type === 'number' || type === 'tel') {
      inputValue = inputValue.replace(/\D/gi, '');
    }
    e.target.value = inputValue;

    if (inputValue !== '') {
      const prevValue = this.state.input[target];
      inputValue = prevValue ? inputValue.replace(prevValue, '') : inputValue;

      this.textInput[target].value = inputValue

      const input = this.state.input.slice()
      input[target] = inputValue
      value = input.join('');

      const newTarget = this.textInput[target + 1];

      if (newTarget) {
        newTarget.focus()
        newTarget.select()
      }

      this.setState({ value, input })
    }

    if ('onChange' in this.props) {
      if (value) {
        this.props.onChange(value)
      }
    }

    this.handleTouch(value)
  }

  onKeyDown(e) {
    const target = Number(e.target.id),
          nextTarget = this.textInput[target + 1],
          prevTarget = this.textInput[target - 1]
    let input, value

    switch (e.keyCode) {
      case BACKSPACE_KEY:
        e.preventDefault()
        this.textInput[target].value = ''
        input = this.state.input.slice()
        input[target] = ''
        value = input.join('')

        this.setState({ value, input })
        if (this.textInput[target].value === '') {
          if (prevTarget) {
            prevTarget.focus()
            prevTarget.select()
          }
        }
        break

      case LEFT_ARROW_KEY:
        e.preventDefault()
        if (prevTarget) {
          prevTarget.focus()
          prevTarget.select()
        }
        break

      case RIGHT_ARROW_KEY:
        e.preventDefault()
        if (nextTarget) {
          nextTarget.focus()
          nextTarget.select()
        }
        break

      case UP_ARROW_KEY:
        e.preventDefault()
        break

      case DOWN_ARROW_KEY:
        e.preventDefault()
        break

      default:
        break
    }
    if ('onChange' in this.props) {
      if (value) {
        this.props.onChange(value)
      }
    }
    this.handleTouch(value)
  }

  render() {
    const {
      className,
      style = {},
      inputStyle = {},
      inputStyleInvalid = {},
      type,
      placeholder,
      autoFocus,
      onFocus,
    } = this.props,
    { disabled, input, isValid, defaultInputStyle } = this.state,
    styles = {
      container: style,
      input: isValid ? inputStyle : inputStyleInvalid
    }

    Object.assign(styles.container, {
        display: 'inline-block'
    })

    if (!className && Object.keys(inputStyle).length === 0) {
      Object.assign(inputStyle, {
        ...defaultInputStyle,
        color: 'black',
        backgroundColor: 'white',
        borderColor: 'lightgrey'
      })
    }

    if (!className && Object.keys(inputStyleInvalid).length === 0) {
      Object.assign(inputStyleInvalid, {
        ...defaultInputStyle,
        color: '#b94a48',
        backgroundColor: '#f2dede',
        borderColor: '#eed3d7'
      })
    }

    if (disabled) {
      Object.assign(styles.input, {
        cursor: 'not-allowed',
        color: 'lightgrey',
        borderColor: 'lightgrey',
        backgroundColor: '#efeff1'
      })
    }

    return (
      <div className={classNames(className, 'react-code-input')} style={styles.container}>
       {input.map((value, i) => {
         return (
           <input
             ref={(ref) => {
               this.textInput[i] = ref
             }}
             id={i}
             defaultValue={value}
             key={`input_${i}`}
             type={type}
             min={0}
             max={9}
             placeholder={placeholder[i]}
             maxLength={input.length}
             style={styles.input}
             autoComplete="off"
             autoFocus={autoFocus && i === 0}
             onFocus={(e) => {
                onFocus(e);
                e.target.select(e);
              }}
             onBlur={(e) => this.handleBlur(e)}
             onChange={(e) => this.handleChange(e)}
             onKeyDown={(e) => this.onKeyDown(e)}
             disabled={disabled}
             data-valid={isValid}
            />
         )
       })}
      </div>
    )
  }
}

ReactCodeInput.defaultProps = {
  isValid: true,
  disabled: false,
  fields: 4,
  value: '',
  type: 'text',
  placeholder: '1234',
  autoFocus: false,
}
ReactCodeInput.propTypes = {
  options: PropTypes.object,
  type: PropTypes.oneOf(['text', 'number', 'password', 'tel']),
  fields: PropTypes.number,
  autoFocus: PropTypes.bool,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  name: PropTypes.string,
  touch: PropTypes.func,
  untouch: PropTypes.func,
  className: PropTypes.string,
  isValid: PropTypes.bool,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  inputStyle: PropTypes.object,
  inputStyleInvalid: PropTypes.object
}

export default ReactCodeInput
