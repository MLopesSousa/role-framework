/**
 * The propertie entity must be defined in the service object
 */
module.exports = {
  list: () => {
    return [
      { name: "Joao", age: 60 },
      { name: "Miguel", age: 20 },
      { name: "Pedro", age: 50 },
    ];
  },
  entity: "User",
};
