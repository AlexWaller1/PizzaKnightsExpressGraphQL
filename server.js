const express = require("express");

const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require("graphql");
const app = express();

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
    }
  })
});

const schema2 = new GraphQLSchema({
  query: RootQueryType
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
