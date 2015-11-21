# tangojs-connector-local

![dependencies](https://img.shields.io/david/mliszcz/tangojs-connector-local.svg)
![dev dependencies](https://img.shields.io/david/dev/mliszcz/tangojs-connector-local.svg)
[ ![npm version](https://img.shields.io/npm/v/tangojs-connector-local.svg)
](https://www.npmjs.com/package/tangojs-connector-local)

In-memory data model for [TangoJS](https://github.com/mliszcz/tangojs).

## Quick-start
Install via npm:
```
npm install tangojs-connector-local
```
or Bower:
```
bower install tangojs-connector-local
```

Feed the connector with your data model:
```javascript
import { LocalConnector } from 'tangojs-connector-local'

let model = {
  // ...
}

let connector = new LocalConnector(model)
```

Configure TangoJS to use this connector:
```javascript
tangojs.setConnector(conector)
```

## Data model
Data model is a structure that resembles TANGO devices hierarchy.

See the [`tangojs-connector-local-testmodel.coffee`](src/tangojs-connector-local-testmodel.coffee) for a self-explanatory example.
