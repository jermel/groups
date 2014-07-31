# groups
Organize asynchronous code with groups


##Installation
Available in [npm](https://www.npmjs.org/package/groups)
```
$ npm install groups
```

##Description
Groups is a lightweight library to help organize asynchronous code.  It allows you to group related asynchronous callbacks together and be notified when the entire group is done.


##API

###Groups
To use Groups one must `require('groups')([options])`. This returns a factory for creating groups.
- `options` Object with the following properties
    - `timeout` timeout in millis for any group created by this factory (default: `false` [no timeout])
    - `logger` (default: `console`) custom logger to output warnings

#### Groups.newGroup()
Creates a new `Group`

###Group
Object that can wrap asynchronous callbacks other groups together.

Each group is an EventEmitter with the following events:
- `done` group completed without errors
- `error` group completed with errors

####group.bind(async)
Similar to `Object.bind` this method returns a new function.
`group.bind` returns a callback that will notify its group when its done.  If called with a group, returns the same group.

See example
```
asyncFn = group.bind(function() {
	console.log('I was called')
});

group.bind(asyncFn)
```
