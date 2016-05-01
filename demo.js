const DAS = require('./index');
const DRM = require('domino-rabbitmq-messenger')

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

const messenger = new DRM.Messenger()

messenger.start( (messenger) => {
  const options = {messenger}
  const app = new DAS.ActionHandler(options)

  app.domain('message')
  .actor('createMessage', messageHandler)
  .watcher('messageCreated', messageCreatedHandler)
  // .watcher('messageCreated', messageCreateddHandler)
})
