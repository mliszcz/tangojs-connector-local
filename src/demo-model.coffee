
`import * as tangojs from 'tangojs-core'`

###*
 * @private
 ###
createDeviceAttributeStruct = (name, data_format, value) ->
  new tangojs.core.api.DeviceAttribute
    data_format: data_format
    data_type: undefined
    err_list: []
    name: name
    quality: tangojs.core.tango.AttrQuality.ATTR_VALID
    r_dim: null
    time: new tangojs.core.tango.TimeVal
      tv_sec: parseInt(new Date().getTime()/1000)
      tv_usec: 0
      tv_nsec: 0
    value: value
    w_dim: null

###*
 * @private
 ###
createAttribute = (initial
                   name,
                   unit,
                   data_format,
                   format,
                   level,
                   writable,
                   min_value,
                   max_value,
                   alarm,
                   data_type
                   ) ->
  _value = initial
  get_info: -> new tangojs.core.api.AttributeInfo
    att_alarm: alarm
    data_format: data_format
    data_type: data_type
    description: name
    display_unit: unit
    enum_labels: []
    event_prop: null
    extensions: []
    format: format
    label: name
    level: level
    max_dim_x: undefined
    max_dim_y: undefined
    max_value: min_value
    mem_init: false
    memorized: false
    min_value: max_value
    name: name
    root_attr_name: undefined
    standard_unit: unit
    writable: writable
    writable_attr_name: undefined
  get_value: -> createDeviceAttributeStruct(name, data_format, _value)
  set_value: (v) ->
    _value = v

###*
 * @private
 ###
createCommand = (handler,
                 name,
                 level,
                 in_type,
                 out_type) ->
  get_info: -> new tangojs.core.api.CommandInfo
    cmd_name: name
    cmd_tag: 0
    in_type: in_type
    in_type_desc: 'command input'
    level: level
    out_type: out_type
    out_type_desc: 'command output'
  inout: (devData) -> new tangojs.core.api.DeviceData(handler(devData.value))

###*
 * @private
 ###
createDevice = (name) ->

  _name = name
  _state = tangojs.core.tango.DevState.OFF

  get_status: -> 'ON'
  get_state: -> _state

  get_info: -> new tangojs.core.api.DeviceInfo
    exported: true
    ior: 'IOR:123456789'
    name: _name

  properties:
    scalar: new tangojs.core.api.DbDatum('scalar', 1)
    string: new tangojs.core.api.DbDatum('string', 'test')
    boolean: new tangojs.core.api.DbDatum('boolean', true)

  attributes:
    scalar: createAttribute(0,
                            'scalar',
                            'u',
                            tangojs.core.tango.AttrDataFormat.SCALAR,
                            'scientific,setprecision(3)',
                            tangojs.core.tango.DispLevel.OPERATOR,
                            tangojs.core.tango.AttrWriteType.READ_WRITE,
                            '0',
                            '100',
                            new tangojs.core.tango.AttributeAlarm({
                              max_warning: '50'
                              max_alarm: '70'
                            }),
                            tangojs.core.tango.AttributeDataType.ATT_DOUBLE)
    string: createAttribute(undefined,
                            'string'
                            undefined,
                            tangojs.core.tango.AttrDataFormat.SCALAR,
                            undefined,
                            tangojs.core.tango.DispLevel.OPERATOR,
                            tangojs.core.tango.AttrWriteType.READ_WRITE,
                            undefined,
                            undefined,
                            null,
                            tangojs.core.tango.AttributeDataType.ATT_STRING)
    sine_trend: (->
      name = 'sine_trend'
      format = 'scientific,setprecision(3)'
      attr = createAttribute(0,
                             name,
                             'u',
                             tangojs.core.tango.AttrDataFormat.SCALAR,
                             format,
                             tangojs.core.tango.DispLevel.OPERATOR,
                             tangojs.core.tango.AttrWriteType.READ,
                             undefined,
                             undefined,
                             null,
                             tangojs.core.tango.AttributeDataType.ATT_DOUBLE)
      attr.get_value = ->
        value = Math.sin((new Date()).getTime()/1000.0)
        createDeviceAttributeStruct(name, format, value)
      attr
    )()
    boolean: createAttribute(false,
                             'boolean'
                             undefined,
                             tangojs.core.tango.AttrDataFormat.SCALAR,
                             undefined,
                             tangojs.core.tango.DispLevel.OPERATOR,
                             tangojs.core.tango.AttrWriteType.READ_WRITE,
                             undefined,
                             undefined,
                             null,
                             tangojs.core.tango.AttributeDataType.ATT_BOOL)
    spectrum: createAttribute(([1..10].map (_i) -> Math.random()),
                              'spectrum'
                              undefined,
                              tangojs.core.tango.AttrDataFormat.SPECTRUM,
                              undefined,
                              tangojs.core.tango.DispLevel.OPERATOR,
                              tangojs.core.tango.AttrWriteType.READ,
                              undefined,
                              undefined,
                              null,
                              tangojs.core.tango.AttributeDataType.ATT_DOUBLE)

  commands:
    double_arg: createCommand(((x) -> 2*x),
                              'double',
                              tangojs.core.tango.DispLevel.OPERATOR,
                              tangojs.core.tango.AttributeDataType.ATT_DOUBLE,
                              tangojs.core.tango.AttributeDataType.ATT_DOUBLE)
    to_upper: createCommand(((x) -> x.toUpperCase()),
                            'to_upper',
                            tangojs.core.tango.DispLevel.OPERATOR,
                            tangojs.core.tango.AttributeDataType.ATT_NO_DATA,
                            tangojs.core.tango.AttributeDataType.ATT_NO_DATA)
    goto_on: createCommand((-> _state = tangojs.core.tango.DevState.ON),
                           'goto_on',
                           tangojs.core.tango.DispLevel.OPERATOR,
                           tangojs.core.tango.AttributeDataType.ATT_NO_DATA,
                           tangojs.core.tango.AttributeDataType.ATT_NO_DATA)
    goto_off: createCommand((-> _state = tangojs.core.tango.DevState.OFF),
                            'goto_off',
                            tangojs.core.tango.DispLevel.OPERATOR,
                            tangojs.core.tango.AttributeDataType.ATT_NO_DATA,
                            tangojs.core.tango.AttributeDataType.ATT_NO_DATA)
    goto_fault: createCommand((-> _state = tangojs.core.tango.DevState.FAULT),
                              'goto_fault',
                              tangojs.core.tango.DispLevel.OPERATOR,
                              tangojs.core.tango.AttributeDataType.ATT_NO_DATA,
                              tangojs.core.tango.AttributeDataType.ATT_NO_DATA)
    goto_alarm: createCommand((-> _state = tangojs.core.tango.DevState.ALARM),
                              'goto_off',
                              tangojs.core.tango.DispLevel.OPERATOR,
                              tangojs.core.tango.AttributeDataType.ATT_NO_DATA,
                              tangojs.core.tango.AttributeDataType.ATT_NO_DATA)

###*
 * @private
 ###
createTangoModel = ->
  tangojs:
    test:
      dev1: createDevice('tangojs/test/dev1')
      dev2: createDevice('tangojs/test/dev2')
  other:
    test:
      mock: createDevice('other/test/mock')

`export const createModel = createTangoModel`
