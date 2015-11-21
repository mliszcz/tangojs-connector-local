
`import * as tangojs from 'tangojs'`

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
                   alarm
                   ) ->
  _value = initial
  get_info: -> new tangojs.struct.AttributeInfo
    att_alarm: alarm
    data_format: data_format
    data_type: undefined
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
  get_value: -> new tangojs.struct.DeviceAttribute
    data_format: data_format
    data_type: undefined
    err_list: []
    name: name
    quality: tangojs.tango.AttrQuality.ATTR_VALID
    r_dim: null
    time: new tangojs.tango.TimeVal
      tv_sec: parseInt(new Date().getTime()/1000)
      tv_usec: 0
      tv_nsec: 0
    value: _value
    w_dim: null
  set_value: (v) ->
    _value = v

###*
 * @private
 ###
createCommand = (handler,
                 name,
                 level) ->
  get_info: -> new tangojs.struct.CommandInfo
    cmd_name: name
    cmd_tag: 0
    in_type: undefined
    in_type_desc: 'command input'
    level: level
    out_type: undefined
    out_type_desc: 'command output'
  inout: (devData) -> new tangojs.struct.DeviceData(handler(devData.value))

###*
 * @private
 ###
createDevice = (name) ->

  get_status: -> 'ON'
  get_state: -> tangojs.tango.DevState.ON

  get_info: -> new tangojs.struct.DeviceInfo
    exported: true
    ior: 'IOR:123456789'
    name: name

  properties:
    scalar: new tangojs.struct.DbDatum('scalar', 1)
    string: new tangojs.struct.DbDatum('string', 'test')
    boolean: new tangojs.struct.DbDatum('boolean', true)

  attributes:
    scalar: createAttribute(0
                            'scalar',
                            'u',
                            tangojs.tango.AttrDataFormat.SCALAR,
                            'scientific,setprecision(3)',
                            tangojs.tango.DispLevel.OPERATOR,
                            tangojs.tango.AttrWriteType.READ_WRITE,
                            '0',
                            '100',
                            new tangojs.tango.AttributeAlarm({
                              max_warning: '50'
                              max_alarm: '70'
                            }))
    string: createAttribute(undefined
                            'string'
                            undefined,
                            tangojs.tango.AttrDataFormat.SCALAR,
                            undefined,
                            tangojs.tango.DispLevel.OPERATOR,
                            tangojs.tango.AttrWriteType.READ_WRITE,
                            undefined,
                            undefined,
                            null)

  commands:
    double: createCommand(((x) -> 2*x),
                          'double',
                          tangojs.tango.DispLevel.OPERATOR)
    to_upper: createCommand(((x) -> x.toUpperCase()),
                          'to_upper',
                          tangojs.tango.DispLevel.OPERATOR)

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
