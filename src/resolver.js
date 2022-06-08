// const { PubSub } = require("graphql-subscriptions");
// const pubsub = new PubSub();
const { message } = require("./db");
module.exports = {
  Query: {
    message: (_, { id }, ctx) => {
      return message.find((value) => {
        return value.id === id ? value : "";
      });
    },
  },
  Mutation: {
    createMessage: (_, { id, text }, context) => {
      message.push({ id, text });
      context.pubsub.publish("CREATE_MESSAGE", {
        messageCreated: {
          id: id,
          text: text,
        },
      });
      return { id, text };
    },
  },
  Subscription: {
    messageCreated: {
      subscribe: (_, {}, context) => {
        return context.pubsub.asyncIterator("CREATE_MESSAGE");
      },
    },
  },
};
