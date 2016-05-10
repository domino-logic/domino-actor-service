const DAS = require('./index');

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

const app = new DAS.ActionHandler()

app.start( (err, app) => {
  app
  .domain('message')
  .actor('createMessage', messageHandler)
  .watcher('messageCreated', messageCreatedHandler)
})
