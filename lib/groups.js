var GroupFactory = require('./groups/GroupFactory'),
    defaultFactory = GroupFactory();

for (var defaultProp in defaultFactory) {
    GroupFactory[defaultProp] = defaultFactory[defaultProp];
}

module.exports = GroupFactory;