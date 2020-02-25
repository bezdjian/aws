function User(id, name, lastname) {
  this.id = id;
  this.name = name;
  this.lastname = lastname;

  this.toJson = function () {
    return {
      id: this.id,
      name: this.name,
      lastname: this.lastname
    }
  };

  return this;
}

module.exports = User;