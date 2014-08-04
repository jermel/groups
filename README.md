# groups
Organize asynchronous code with groups


##Installation
Available in [npm](https://www.npmjs.org/package/groups)
```
$ npm install groups
```

##Description
Groups is a lightweight library to help organize asynchronous code.  It allows you to group related asynchronous callbacks, then notifies you when the entire group is done.


##API

###Groups
To use Groups one must `require('groups')([options])`. This returns a factory for creating groups.
- `options` Object with the following properties
    - `timeout` (optional, default: `false` - no timeout) timeout in millis for any group created by this factory 
    - `logger` (optional, default: `console`) custom logger to output warnings

#### Groups.newGroup()
Creates a new `Group`

###Group
Object that can wrap asynchronous callbacks and other groups together.

Each group is an EventEmitter with the following events:
- `done` group completed without errors - If this group is not monitoring anything, and a listener is added for the `done` event, it will be emitted immediately.
- `error` group completed with errors

####group.bind(async)
Similar to `Object.bind` this method returns a new function<sup>*</sup>.
`group.bind` returns a callback that will notify its group when its done.

<sup>*</sup>If called with a group, returns the same group.

See example
```
var group = require('groups').newGroup();

asyncFn = group.bind(function() {
	console.log('I was called')
});

group.on('done', function() {
	console.log('Group is done');
});
setTimeout(asyncFn)
```
