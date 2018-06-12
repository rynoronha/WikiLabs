const passport = require("passport");

'use strict';

const faker = require("faker");

let users = [
   {
    name: "Sean Connery",
    email: "sean@mi6.com",
    password: "sean007",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 0
   },
   {
    name: "Roger Moore",
    email: "roger@mi6.com",
    password: "roger007",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 1
   },
   {
    name: "Pierce Brosnan",
    email: "pierce@mi6.com",
    password: "pierce007",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 2
   }
 ]

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    
    return queryInterface.bulkInsert("Users", users, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete("Users", null, {});
  }
};
