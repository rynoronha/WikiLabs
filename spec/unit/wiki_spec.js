const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("Wiki", () => {

  beforeEach((done) => {

    this.wiki;
    this.user;

    sequelize.sync({force: true}).then((res) => {
      User.create({
        name: "User",
        email: "user@email.com",
        password: "1234567890"
      })
      .then((user) => {
        this.user = user; //store the user
        done();
      })
    });
  });

  describe("#create()", () => {

    it("should create a public Wiki object with a valid title and body", (done) => {
      Wiki.create({
        title: "First Wiki",
        body: "This is my first wiki.",
        private: false
      })
      .then((wiki) => {
        expect(wiki.title).toBe("First Wiki");
        expect(wiki.body).toBe("This is my first wiki.");
        expect(wiki.private).toBe(false);
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should not create a wiki with a title already taken", (done) => {
      Wiki.create({
        title: "First Wiki",
        body: "This is my first wiki.",
        private: true
      })
      .then((wiki) => {
        Wiki.create({
            title: "First Wiki",
            body: "This is not my first Wiki.",
            private: true
        })
        .then((wiki) => {
          // the code in this block will not be evaluated since the validation error
          // will skip it. Instead, we'll catch the error in the catch block below
          // and set the expectations there
          done();
        })
        .catch((err) => {
          expect(err.message).toContain("Validation error");
          done();
        });
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should not create a wiki with missing title or body", (done) => {
      Wiki.create({
        title: "First Wiki"
      })
      .then((wiki) => {

       // the code in this block will not be evaluated since the validation error
       // will skip it. Instead, we'll catch the error in the catch block below
       // and set the expectations there

        done();
      })
      .catch((err) => {
        expect(err.message).toContain("Wiki.body cannot be null");
        done();
      })
    });

  });

  describe("#setUser", () => {

    it("should associate a wiki and a user together", (done) => {
      User.create({
        name:"Joe",
        email: "joe@email.com",
        password: "password"
      })
      .then((newUser) => {
        Wiki.create({
          title: "Test Wiki",
          body: "This is the body of the wiki",
          private: false,
          userId: this.user.id
        })
        .then((wiki) => {
          expect(wiki.userId).toBe(this.user.id);
          wiki.setUser(newUser);
          expect(wiki.userId).toBe(newUser.id);
          done();
        })
      })
    });

  });

  describe("#getUser()", () => {

    it("should return the associated topic", (done) => {
      Wiki.create({
        title: "First Wiki",
        body: "This is my first wiki",
        private: false,
        userId: this.user.id
      })
      .then((wiki) => {
        wiki.getUser()
        .then((associatedUser) => {
          expect(associatedUser.email).toBe("user@email.com");
          done();
        });
      });

    });

 });


});
