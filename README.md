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
To use Groups `require('groups')([options])`. This returns a factory for creating groups.
- `options` Object with the following properties
    - `timeout` (optional, default: `false` - no timeout) timeout in millis for any group created by this factory 
    - `logger` (optional, default: `console`) custom logger to output warnings

#### Groups.newGroup()
Creates a new `Group`

###Group
Object that can wrap asynchronous callbacks and other groups together.

Each group is an EventEmitter with the following event:
####Event: `done` 
`function(errors)` 

The group completed.  If there were errors, an array of errors will be passed as the argument - If this group is not monitoring anything (because everything has completed or nothing has been bound to this group), when a listener is added for the `done` event, it will be emitted immediately.

####Methods
The `group` object exposes a `bind` method that can be called with a variety of parameters to support a number of asynchronous error handling styles. `options` is an object that supports a single property `thisArg` to use when invoking the bound function

#####group.bind(`function(error, result){}`, [options])
Error Argument (AKA Node callback)

Similar to `Object.bind` this method returns a new function that will call the original function<sup>*</sup>.  The group will monitor this new function for invocations.  If the first argument is truthy, it will be treated as an error.  An exception is treated like an error.

Example
```
var group = require('groups').newGroup();

asyncFn = group.bind(function() {
	console.log('I was called')
});

group.once('done', function() {
	console.log('Group is done');
});
setTimeout(asyncFn)
```

#####group.bind(`function(...){}`, `null|undefined`, [options])
Exception only

Similar to `Object.bind` this method returns a new function that calls the original function<sup>*</sup>.  The group will monitor this new function for invocations.  Because there is no error handler, exceptions are the only thing that will be treated as an error.

Example
```
var group = require('groups').newGroup();

asyncFn = group.bind(function() { console.log('I was called')}, null);
asyncFn2 = group.bind(function() { console.log('Name is %s', this.name);}, null, {thisArg: {name: 'my name'}});

group.once('done', function() {
	console.log('Group is done');
});
setTimeout(asyncFn)
setTimeout(asyncFn2)
```

#####group.bind(group)
Returns the same group. The bound group will be monitored for completion, and if it completes with an error, the monitoring group will complete with an error.

Example
```
var group = require('groups').newGroup(),
    group2 = require('groups').newGroup();

group.bind(group2);

group.once('done', function() {
	console.log('Group is done');
});
group2.once('done', function() {
	console.log('Group 2 is done');
});
```

#####group.bind(`function success(...){}`, `function failure(...){}`, [options])
Returns an object `{ success: function(){}, failure: function(){} }` each function will notify the group when it is invoked.  The group will complete with an error if the failure function is called, or if an exception is thrown in the success function.

Example
```
var group = require('groups').newGroup(),
    handlers = group.bind(function success(){}, function failure(){});

group.once('done', function() {
	console.log('Group is done');
});

somefunction(handlers.success, handlers.failure)
```
<sup>*</sup>A bound function can only be called once.  All other invocations are considered a noop (in reality, they actually log a warning).
