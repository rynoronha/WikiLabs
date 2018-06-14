const express = require('express');
const router = express.Router();
const wikiQueries = require ('../db/queries.wikis.js');
const collaboratorQueries = require("../db/queries.collaborators.js");
const Authorizer = require('../policies/application');

module.exports = {

  add(req, res, next){
    const authorized = new Authorizer(req.user).editCollaborator();
    if(authorized) {
      collaboratorQueries.add(req, (err, collab) => {
        if(err){
          req.flash("error", err);
        }
        res.redirect(req.headers.referer);
      });
    } else {
      req.flash("notice", "You must be signed in to do that.");
      res.redirect(req.headers.referer);
    }
  },

  remove(req, res, next){
    if(req.user){
      collaboratorQueries.remove(req, (err, collaborator) => {
        if(err){
          req.flash("error", err);
        }
        res.redirect(req.headers.referer);
      });
    } else {
      req.flash("notice", "You must be signed in to do that.")
      res.redirect(req.headers.referer);
    }
  }

}
