const DAS = require('./index');
const DRM = require('domino-rabbitmq-messenger')

function messageHandler(body, dispatch) {
  console.log('messageHandler', body);

  dispatch('messageCreated', `He said ${body.payload}`);
}

function messageCreatedHandler(data, broadcast) {
  const actionName = data['actionName'];
  const payload = data['payload'];

  broadcast('actionName', 'Something Changed')

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

})
