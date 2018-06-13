const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/wikis";
const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

describe("routes : wikis", () => {

  //begin context for admin user
  describe("admin user performing CRUD actions for Wiki", () => {

    beforeEach((done) => {
      this.wiki;
      this.user;

      sequelize.sync({force: true}).then((res) => {

        User.create({
          name: "James Bond",
          email: "007@MI6.com",
          password: "bondjamesbond",
          role: 2
        })
        .then((user) => {
          this.user = user;

          request.get({
            url: "http://localhost:3000/auth/fake",
            form: {
              role: user.role,
              userId: user.id,
              email: user.email,
              name: user.name
            }
          });
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

      it("should not create a new wiki that fails validations", (done) => {
        const options = {
          url: `${base}/create`,
          form: {
            title: "a",
            body: "b",
            private: false,
            userId: this.user.id
          }
        };

        request.post(options,
          (err, res, body) => {
            Wiki.findOne({where: {title: "a"}})
            .then((post) => {
                expect(post).toBeNull();
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

  }); //end context for admin user

  // //begin context for standard user
  // describe("standard user performing CRUD actions for Wiki", () => {
  //
  //   beforeEach((done) => {
  //     this.wiki;
  //     this.user;
  //
  //     sequelize.sync({force: true}).then((res) => {
  //
  //       User.create({
  //         name: "Clark Kent",
  //         email: "clark@superman.com",
  //         password: "superman",
  //         role: 0
  //       })
  //       .then((user) => {
  //         this.user = user;
  //
  //         request.get({
  //           url: "http://localhost:3000/auth/fake",
  //           form: {
  //             role: user.role,
  //             userId: user.id,
  //             email: user.email,
  //             name: user.name
  //           }
  //         });
  //         Wiki.create({
  //           title: "Superman Movies",
  //           body: "Everything about Superman movies.",
  //           private: false,
  //           userId: this.user.id
  //         })
  //         .then((wiki) => {
  //           this.wiki = wiki;
  //           done();
  //         })
  //       });
  //     });
  //   });
  //
  //
  //   describe("GET /wikis", () => {
  //
  //     it("should render the wiki index page", (done) => {
  //       request.get(base, (err, res, body) => {
  //         expect(err).toBeNull();
  //         expect(body).toContain("Wikis");
  //         done();
  //       });
  //     });
  //
  //   });
  //
  //   describe("GET /wikis/new", () => {
  //
  //     it("should render a new wiki form", (done) => {
  //       request.get(`${base}/new`, (err, res, body) => {
  //         expect(err).toBeNull();
  //         expect(body).toContain("New Wiki");
  //         done();
  //       });
  //     });
  //
  //   });
  //
  //   describe("POST /wikis/create", () => {
  //
  //       it("should create a new wiki and redirect", (done) => {
  //
  //         User.create({
  //           name: "Lois Lane",
  //           email: "lois@superman.com",
  //           password: "loislane"
  //         })
  //         .then((user) => {
  //           const options = {
  //             url: `${base}/create`,
  //             form: {
  //               title: "Classical Music",
  //               body: "The greatest classical composers",
  //               private: false,
  //               userId: user.id
  //             }
  //           };
  //           request.post(options,
  //             (err, res, body) => {
  //               Wiki.findOne({where: {title: "Classical Music"}})
  //               .then((wiki) => {
  //                 expect(wiki.title).toBe("Classical Music");
  //                 expect(wiki.body).toBe("The greatest classical composers");
  //                 done();
  //               })
  //               .catch((err) => {
  //                 console.log(err);
  //                 done();
  //               });
  //             }
  //           );
  //       });
  //     });
  //
  //     it("should not create a new wiki that fails validations", (done) => {
  //       const options = {
  //         url: `${base}/create`,
  //         form: {
  //           title: "a",
  //           body: "b",
  //           private: false,
  //           userId: this.user.id
  //         }
  //       };
  //
  //       request.post(options,
  //         (err, res, body) => {
  //           Wiki.findOne({where: {title: "a"}})
  //           .then((post) => {
  //               expect(post).toBeNull();
  //               done();
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             done();
  //           });
  //         }
  //       );
  //     });
  //
  //   });
  //
  //   describe("GET /wikis/:id", () => {
  //
  //    it("should render a view with the selected wiki", (done) => {
  //      request.get(`${base}/${this.wiki.id}`, (err, res, body) => {
  //        expect(err).toBeNull();
  //        expect(body).toContain("007 Movies");
  //        done();
  //      });
  //    });
  //
  //   });
  //
  //   describe("POST /wikis/:id/destroy", () => {
  //
  //     it("should delete the wiki with the associated ID", (done) => {
  //       Wiki.all()
  //       .then((wikis) => {
  //         const wikiCountBeforeDelete = wikis.length;
  //         expect(wikiCountBeforeDelete).toBe(1);
  //         request.post(`${base}/${this.wiki.id}/destroy`, (err, res, body) => {
  //           Wiki.all()
  //           .then((wikis) => {
  //             expect(err).toBeNull();
  //             expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
  //             done();
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             done();
  //           })
  //         });
  //       })
  //     });
  //
  //   });
  //
  //   describe("GET /wikis/:id/edit", () => {
  //
  //     it("should render a view with an edit wiki form", (done) => {
  //       request.get(`${base}/${this.wiki.id}/edit`, (err, res, body) => {
  //         expect(err).toBeNull();
  //         expect(body).toContain("Edit Wiki");
  //         expect(body).toContain("Everything about James Bond movies.");
  //         done();
  //       });
  //     });
  //
  //   });
  //
  //   describe("POST /wikis/:id/update", () => {
  //
  //     it("should update the wiki with the given values", (done) => {
  //       request.post({
  //         url: `${base}/${this.wiki.id}/update`,
  //         form: {
  //           title: "007 Films",
  //           body: "The greatest film series ever made",
  //           userId: this.user.id
  //         }
  //       }, (err, res, body) => {
  //         expect(err).toBeNull();
  //         Wiki.findOne({
  //           where: {id:1}
  //         })
  //         .then((wiki) => {
  //           expect(wiki.title).toBe("007 Films");
  //           done();
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           done();
  //         });
  //       });
  //     });
  //
  //   });
  //
  // }); //end context for standard user

  // //begin context for premium user
  // describe("premium user performing CRUD actions for Wiki", () => {
  //
  //   beforeEach((done) => {
  //     this.wiki;
  //     this.user;
  //
  //     sequelize.sync({force: true}).then((res) => {
  //
  //       User.create({
  //         name: "Bruce Wayne",
  //         email: "bruce@batman.com",
  //         password: "batman",
  //         role: 1
  //       })
  //       .then((user) => {
  //         this.user = user;
  //
  //         request.get({
  //           url: "http://localhost:3000/auth/fake",
  //           form: {
  //             role: user.role,
  //             userId: user.id,
  //             email: user.email,
  //             name: user.name
  //           }
  //         });
  //         Wiki.create({
  //           title: "Batman Movies",
  //           body: "Everything about Batman movies.",
  //           private: true,
  //           userId: this.user.id
  //         })
  //         .then((wiki) => {
  //           this.wiki = wiki;
  //           done();
  //         })
  //       });
  //     });
  //   });
  //
  //
  //   describe("GET /wikis", () => {
  //
  //     it("should render the wiki index page", (done) => {
  //       request.get(base, (err, res, body) => {
  //         expect(err).toBeNull();
  //         expect(body).toContain("Wikis");
  //         done();
  //       });
  //     });
  //
  //   });
  //
  //   describe("GET /wikis/private", () => {
  //
  //     it("should render the private wiki index page", (done) => {
  //       request.get(`${base}/private`, (err, res, body) => {
  //         expect(err).toBeNull();
  //         expect(body).toContain("Private Wikis");
  //         done();
  //       });
  //     });
  //
  //   });
  //
  //   describe("GET /wikis/new", () => {
  //
  //     it("should render a new wiki form", (done) => {
  //       request.get(`${base}/new`, (err, res, body) => {
  //         expect(err).toBeNull();
  //         expect(body).toContain("New Wiki");
  //         done();
  //       });
  //     });
  //
  //   });
  //
  //   describe("POST /wikis/create", () => {
  //
  //       it("should create a new wiki and redirect", (done) => {
  //
  //         User.create({
  //           name: "Clark Kent",
  //           email: "clark@superman.com",
  //           password: "superman"
  //         })
  //         .then((user) => {
  //           const options = {
  //             url: `${base}/create`,
  //             form: {
  //               title: "Classical Music",
  //               body: "The greatest classical composers",
  //               private: false,
  //               userId: user.id
  //             }
  //           };
  //           request.post(options,
  //             (err, res, body) => {
  //               Wiki.findOne({where: {title: "Classical Music"}})
  //               .then((wiki) => {
  //                 expect(wiki.title).toBe("Classical Music");
  //                 expect(wiki.body).toBe("The greatest classical composers");
  //                 done();
  //               })
  //               .catch((err) => {
  //                 console.log(err);
  //                 done();
  //               });
  //             }
  //           );
  //       });
  //     });
  //
  //     it("should not create a new wiki that fails validations", (done) => {
  //       const options = {
  //         url: `${base}/create`,
  //         form: {
  //           title: "a",
  //           body: "b",
  //           private: false,
  //           userId: this.user.id
  //         }
  //       };
  //
  //       request.post(options,
  //         (err, res, body) => {
  //           Wiki.findOne({where: {title: "a"}})
  //           .then((post) => {
  //               expect(post).toBeNull();
  //               done();
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             done();
  //           });
  //         }
  //       );
  //     });
  //
  //   });
  //
  //   describe("GET /wikis/:id", () => {
  //
  //    it("should render a view with the selected wiki", (done) => {
  //      request.get(`${base}/${this.wiki.id}`, (err, res, body) => {
  //        expect(err).toBeNull();
  //        expect(body).toContain("007 Movies");
  //        done();
  //      });
  //    });
  //
  //   });
  //
  //   describe("POST /wikis/:id/destroy", () => {
  //
  //     it("should delete the wiki with the associated ID", (done) => {
  //       Wiki.all()
  //       .then((wikis) => {
  //         const wikiCountBeforeDelete = wikis.length;
  //         expect(wikiCountBeforeDelete).toBe(1);
  //         request.post(`${base}/${this.wiki.id}/destroy`, (err, res, body) => {
  //           Wiki.all()
  //           .then((wikis) => {
  //             expect(err).toBeNull();
  //             expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
  //             done();
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             done();
  //           })
  //         });
  //       })
  //     });
  //
  //   });
  //
  //   describe("GET /wikis/:id/edit", () => {
  //
  //     it("should render a view with an edit wiki form", (done) => {
  //       request.get(`${base}/${this.wiki.id}/edit`, (err, res, body) => {
  //         expect(err).toBeNull();
  //         expect(body).toContain("Edit Wiki");
  //         expect(body).toContain("Everything about James Bond movies.");
  //         done();
  //       });
  //     });
  //
  //   });
  //
  //   describe("POST /wikis/:id/update", () => {
  //
  //     it("should update the wiki with the given values", (done) => {
  //       request.post({
  //         url: `${base}/${this.wiki.id}/update`,
  //         form: {
  //           title: "007 Films",
  //           body: "The greatest film series ever made",
  //           userId: this.user.id
  //         }
  //       }, (err, res, body) => {
  //         expect(err).toBeNull();
  //         Wiki.findOne({
  //           where: {id:1}
  //         })
  //         .then((wiki) => {
  //           expect(wiki.title).toBe("007 Films");
  //           done();
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           done();
  //         });
  //       });
  //     });
  //
  //   });
  //
  // }); //end context for premium user



});
