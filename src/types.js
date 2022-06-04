const { gql } = require("apollo-server-express");

module.exports = gql`
  type message {
    id: String
    text: String
  }

  type Query {
    message(id: String!): message
  }

  type Mutation {
    createMessage(id: String!, text: String!): message
  }

  type Subscription {
    messageCreated: message
  }
`;
