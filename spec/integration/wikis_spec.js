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
          private: false,
          userId: this.user.id
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

        User.create({
          name: "Clark Kent",
          email: "clark@superman.com",
          password: "superman"
        })
        .then((user) => {
          const options = {
            url: `${base}/create`,
            form: {
              title: "Classical Music",
              body: "The greatest classical composers",
              private: false,
              userId: user.id
            }
          };
          request.post(options,
            (err, res, body) => {
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

  describe("GET /wikis/:id", () => {

   it("should render a view with the selected wiki", (done) => {
     request.get(`${base}/${this.wiki.id}`, (err, res, body) => {
       expect(err).toBeNull();
       expect(body).toContain("007 Movies");
       done();
     });
   });

  });

  describe("POST /wikis/:id/destroy", () => {

    it("should delete the wiki with the associated ID", (done) => {
      Wiki.all()
      .then((wikis) => {
        const wikiCountBeforeDelete = wikis.length;
        expect(wikiCountBeforeDelete).toBe(1);
        request.post(`${base}/${this.wiki.id}/destroy`, (err, res, body) => {
          Wiki.all()
          .then((wikis) => {
            expect(err).toBeNull();
            expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          })
        });
      })
    });

  });

  describe("GET /wikis/:id/edit", () => {

    it("should render a view with an edit wiki form", (done) => {
      request.get(`${base}/${this.wiki.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Edit Wiki");
        expect(body).toContain("Everything about James Bond movies.");
        done();
      });
    });

  });

  describe("POST /wikis/:id/update", () => {

    it("should update the wiki with the given values", (done) => {
      request.post({
        url: `${base}/${this.wiki.id}/update`,
        form: {
          title: "007 Films",
          body: "The greatest film series ever made",
          userId: this.user.id
        }
      }, (err, res, body) => {
        expect(err).toBeNull();
        Wiki.findOne({
          where: {id:1}
        })
        .then((wiki) => {
          expect(wiki.title).toBe("007 Films");
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });

  });

});
