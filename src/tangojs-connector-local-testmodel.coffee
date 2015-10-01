
###*
 * Example model factory.
 * @return {Object} simple model with 'tangojs/test/1' device
 ###
__TestModelFactory = ->

  data =
    state: 'ON'
    status: 'Status OK'
    number_scalar: 50

  tangojs:
    test:
      '1':
        status: ->
          [data.state, data.status]
        info: ->
          classname: 'TangoJsTest'
          exported: true
          hostname: 'localhost'
          ior: 'IOR:123456789'
          is_taco: false
          last_exported: '2015-01-01'
          last_unexported: '2015-01-01'
          name: 'tangojs/test/1'
          pid: 1234
          server: ''
          taco_info: ''
          version: '0.1.0'
        attributes:
          number_scalar:
            read: ->
              data.number_scalar
            write: (v) ->
              data.number_scalar = v
            reset: ->
              data.number_scalar = 50
            info: ->
              data_format: 'SCALAR'
              data_type: 'ATT_LONG'
              description: 'scalar attribute'
              display_unit: 'u'
              extensions: []
              format: ''
              label: 'number_scalar'
              level: 'OPERATOR'
              max_alarm: 90
              max_dim_x: 0
              max_dim_y: 0
              max_value: 100
              min_alarm: 10
              min_value: 0
              name: 'number_scalar'
              standard_unit: 'u'
              unit: 'u'
              writable: 'READ_WRITE'
              writable_attr_name: ''
        commands:
          double:
            execute: (argin) ->
              2 * argin
            info: ->
              cmd_name: 'double'
              cmd_tag: 0
              in_type: 0 # TODO this should be enum / constant (??)
              in_type_desc: 'number to double'
              level: 'OPERATOR'
              out_type: 0
              out_type_desc: 'doubled number'

`export const createModel = __TestModelFactory`
