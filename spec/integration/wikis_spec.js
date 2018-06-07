const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/wikis";
const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

describe("routes : wikis", () => {

  beforeEach((done) => {
    this.wiki;
    this.user;

    sequelize.sync({force: true}).then((res) => {

      User.create({
        name: "James Bond",
        email: "007@MI6.com",
        password: "bondjamesbond"
      })
      .then((user) => {
        this.user = user;

        Wiki.create({
          title: "007 Movies",
          body: "Everything about James Bond movies.",
          userId: user.id
        })
        .then((wiki) => {
          this.wiki = wiki;
          done();
        })
      });
    });
  });

  describe("GET /wikis", () => {

    it("should render the wiki index page", (done) => {
      request.get(base, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Wikis");
        done();
      });
    });

  });

  describe("GET /wikis/new", () => {

    it("should render a new wiki form", (done) => {
      request.get(`${base}/new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Wiki");
        done();
      });
    });

  });

  describe("POST /wikis/create", () => {

    it("should create a new wiki and redirect", (done) => {
      const options = {
        url: `${base}/create`,
        form: {
          title: "Classical Music",
          body: "The greatest classical composers",
          private: false,
          userId: this.user.id
        }
      };
      request.post(options,
        (err, res, body) => {
          console.log("wikis_spec2 "+res);
          console.log("wikis_spec3 "+body);
          Wiki.findOne({where: {title: "Classical Music"}})
          .then((wiki) => {
            expect(wiki.title).toBe("Classical Music");
            expect(wiki.body).toBe("The greatest classical composers");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        }
      );
    });
  });

});
