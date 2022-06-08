const { createServer } = require("http");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const typeDefs = require("./src/types");
const resolvers = require("./src/resolver");
const pubsub = new PubSub();

(async () => {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    // This is the `httpServer` returned by createServer(app);
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: "/graphql",
  });

  // Passing in an instance of a GraphQLSchema and
  // telling the WebSocketServer to start listening
  const serverCleanup = useServer(
    {
      schema,
      context: ({ req, res }) => ({
        user: "req.user",
        pubsub,
      }),
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      user: "req.user",
      pubsub,
    }),
    plugins: [
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen(3000, () => {
    console.log(
      `🚀 Query endpoint ready at http://localhost:3000${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:3000${server.graphqlPath}`
    );
  });
})();
