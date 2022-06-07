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
// test data

const pizzaPlaces = [
  { id: 1, name: "Francesco's", ownerId: 1 },
  { id: 2, name: "Gallagher's", ownerId: 2 },
  { id: 3, name: "Dominick's", ownerId: 3 }
];
// test data

const pizzaMakers = [
  { id: 1, name: "Carmine Johnson" },
  { id: 2, name: "Dex Garrity" },
  { id: 3, name: "Rising Dough" }
];

const pizzaRecipes = [
  {
    id: 1,
    name: "The Bolognese",
    recipe: "Sausage, Romano Cheese, Bolognese Sauce",
    makerId: 1
  },
  {
    id: 2,
    name: "The Pineapple Special",
    recipe: "Pineapple, Mortadella, Ricotta Cheese",
    makerId: 2
  },
  {
    id: 3,
    name: "The Meatball Simmer",
    recipe: "Meatballs, White Wine, Tomato Puree, Sicilian Cheese",
    makerId: 3
  }
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
        // a pizza place only has one owner so we can use find
      }
    }
  })
});

const PizzaOwnerType = new GraphQLObjectType({
  name: "PizzaOwners",
  description: "This is an Owner of a Pizza Place",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    pizzaPlace: {
      type: new GraphQLList(PizzaPlaceType),
      resolve: owner => {
        return pizzaPlaces.filter(place => place.ownerId === owner.id);
        // an owner can have multiple pizza places so we need to use filter
      }
    }
  })
});

const HomemadePizzaType = new GraphQLObjectType({
  name: "HomemadePizzas",
  description: "These are the Legendary Homemade Pizzas!",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    recipe: { type: GraphQLNonNull(GraphQLString) },
    makerId: { type: GraphQLNonNull(GraphQLInt) },
    maker: {
      type: new GraphQLList(PizzaMakerType),
      resolve: pizza => {
        return pizzaMakers.find(maker => maker.id === pizza.makerId);
      }
    }
  })
});

const PizzaMakerType = new GraphQLObjectType({
  name: "PizzaMakers",
  description: "These are the Awesome Pizza Makers!",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    recipes: {
      type: new GraphQLList(HomemadePizzaType),
      resolve: maker => {
        return pizzaRecipes.filter(recipe => recipe.makerId === maker.id);
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
    pizzaMakers: {
      type: new GraphQLList(PizzaMakerType),
      description: "List of Pizza Makers",
      resolve: () => pizzaMakers
    },
    pizzaMaker: {
      type: PizzaMakerType,
      description: "Individual Pizza Maker",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => pizzaMakers.find(maker => maker.id === args.id)
    },
    pizzaRecipes: {
      type: new GraphQLList(HomemadePizzaType),
      description: "List of Pizza Recipes",
      resolve: () => pizzaRecipes
    },
    pizzaRecipe: {
      type: HomemadePizzaType,
      description: "Individual Pizza Recipe",
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) =>
        pizzaRecipes.find(recipe => recipe.id === args.id)
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
    },
    addPizzaMaker: {
      type: PizzaMakerType,
      description: "Add a Pizza Maker",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const newPizzaMaker = {
          id: pizzaMakers.length + 1,
          name: args.name
        };
        pizzaMakers.push(newPizzaMaker);
        return newPizzaMaker;
      }
    },
    addPizzaRecipe: {
      type: HomemadePizzaType,
      description: "Add a Pizza Recipe",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        recipe: { type: GraphQLNonNull(GraphQLString) },
        makerId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const newRecipe = {
          id: pizzaRecipes.length + 1,
          name: args.name,
          recipe: args.recipe,
          makerId: args.makerId
        };
        pizzaRecipes.push(newRecipe);
        return newRecipe;
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
