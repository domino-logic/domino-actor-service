'use strict';

const DAS = module.exports = {};


DAS.ActionHandler = require('./ActionHandler');

function messageHandler(dispatch, body) {
  console.log('messageHandler', body);

  dispatch('messageCreated', `He said ${body.payload}`);
}

function messageCreatedHandler(data) {
  const actionName = data['actionName'];
  const payload = data['payload'];

  console.log(`messageCreatedHandler ${actionName}`, payload);
}

const app = new DAS.ActionHandler()
const messenger = require('./messenger')

messenger.start(function(){
  app.domain('message')
  .actor('createMessage', messageHandler)
  .watcher('messageCreated', messageCreatedHandler)
})
