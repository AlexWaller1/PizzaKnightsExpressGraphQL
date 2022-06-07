const express = require("express");
// must always require express for express server

const { graphqlHTTP } = require("express-graphql");
// function that express app must use to utilize GraphQL

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require("graphql");
// GraphQL data types  must required here to use in applications

const app = express();
// must be express app

const pizzaOwners = [
  { id: 1, name: "Francesco Matterazzo" },
  { id: 2, name: "Jim Gallagher" },
  { id: 3, name: "Dominick Salerno" }
];

const pizzaPlaces = [
  { id: 1, name: "Francesco's", ownerId: 1 },
  { id: 2, name: "Gallagher's", ownerId: 2 },
  { id: 3, name: "Dominick's", ownerId: 3 }
];

const PizzaPlaceType = new GraphQLObjectType({
  name: "PizzaPlaces",
  description: "This is a Pizza Place",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    ownerId: { type: GraphQLNonNull(GraphQLInt) },
    owner: {
      type: PizzaOwnerType,
      resolve: pizzaPlace => {
        return pizzaOwners.find(owner => owner.id === pizzaPlace.ownerId);
      }
    }
  })
});

const PizzaOwnerType = new GraphQLObjectType({
  name: "PizzaOwners",
  description: "This is an Owner of a  Pizza Place",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    pizzaPlace: {
      type: new GraphQLList(PizzaPlaceType),
      resolve: owner => {
        return pizzaPlaces.filter(place => place.ownerId === owner.id);
      }
    }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    pizzaPlace: {
      type: PizzaPlaceType,
      description: "A Single Pizza Place",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => pizzaPlaces.find(place => place.id === args.id)
    },
    pizzaPlaces: {
      type: new GraphQLList(PizzaPlaceType),
      description: "List of Pizza Places",
      resolve: () => pizzaPlaces
    },
    pizzaOwners: {
      type: new GraphQLList(PizzaOwnerType),
      description: "List of Pizza Owners",
      resolve: () => pizzaOwners
    },
    pizzaOwner: {
      type: PizzaOwnerType,
      description: "A Single Pizza Place Owner",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => pizzaOwners.find(owner => owner.id === args.id)
    }
  })
});

const RobotMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addPizzaPlace: {
      type: PizzaPlaceType,
      description: "Add a Pizza Place",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        ownerId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const newPlace = {
          id: pizzaPlaces.length + 1,
          name: args.name,
          ownerId: args.ownerId
        };
        pizzaPlaces.push(newPlace);
        return newPlace;
      }
    },
    addPizzaOwner: {
      type: PizzaOwnerType,
      description: "Add a Pizza Owner",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const newOwner = {
          id: pizzaOwners.length + 1,
          name: args.name
        };
        pizzaOwners.push(newOwner);
        return newOwner;
      }
    }
  })
});

const schema2 = new GraphQLSchema({
  query: RootQueryType,
  mutation: RobotMutationType
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "HelloWorld",
    fields: () => ({
      message: {
        type: GraphQLString,
        resolve: () => "Hello World"
      }
    })
  })
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema2,
    graphiql: true
  })
);
app.listen(3007, () => console.log("Server Running on 3007"));
