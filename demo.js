const DAS = require('./index');

function messageHandler(dispatch, body) {
  console.log('messageHandler', body);

  dispatch('messageCreated', `He said ${body.payload}`);
}

function messageCreatedHandler(data) {
  const actionName = data['actionName'];
  const payload = data['payload'];

  console.log(`messageCreatedHandler ${actionName}`, payload);
}

function messageCreateddHandler() {}

const app = new DAS.ActionHandler()

DAS.messenger.start(function(){
  app.domain('message')
  .actor('createMessage', messageHandler)
  .watcher('messageCreated', messageCreatedHandler)
  // .watcher('messageCreated', messageCreateddHandler)
})
