const Wiki = require('./models').Wiki;
const User = require('./models').User;
const Collaborator = require('./models').Collaborator;
const Authorizer = require("../policies/application");

module.exports = {

  add(req, callback){
    if (req.user.name == req.body.collaborator){
      return callback("It's not possible to add yourself as a collaborator");
    }
    User.findAll({
      where: {
        name: req.body.collaborator
      }
    })
    .then((users)=>{
      if(!users[0]){
        return callback("That username was not found. Please check the spelling and try again.");
      }
      Collaborator.findAll({
        where: {
          userId: users[0].id,
          wikiId: req.params.wikiId,
        }
      })
      .then((collaborators)=>{
        if(collaborators.length != 0){
          return callback(`${req.body.collaborator} is already collaborating on this Wiki`);
        }
        let newCollaborator = {
          wikiId: req.params.wikiId,
          userId: users[0].id
        };
        return Collaborator.create(newCollaborator)
        .then((collab) => {
          callback(null, collab);
        })
        .catch((err) => {
          console.log(err);
          callback(err, null);
        })
      })
      .catch((err)=>{
        console.log(err);
        callback(err, null);
      })
    })
    .catch((err)=>{
      console.log(err);
      callback(err, null);
    })
  },

  remove(req, callback){
    let collabId = req.body.collaborator;
    let wikiId = req.params.wikiId;
    const authorized = new Authorizer(req.user, wiki).destroy();
    if(authorized){
      Collaborator.destroy({ where: {
        userId : collabId,
        wikiId : wikiId
      }})
      .then((deletedRecordsCount) => {
        callback(null, deletedRecordsCount);
      })
      .catch((err) => {
        callback(err);
      });
    } else {
      req.flash("notice", "You are not authorized to do that.")
      callback(401);
    }
  }

}
