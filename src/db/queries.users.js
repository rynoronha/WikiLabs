const User = require("./models").User;
const bcrypt = require("bcryptjs");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

  createUser(newUser, callback){
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    return User.create({
      name: newUser.name,
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      const msg = {
        to: newUser.email,
        from: 'welcome@blocipedia.com',
        subject: 'Account confirmation',
        text: 'Welcome to Blocipedia!',
        html: '<strong>Please login to your account to start creating wikis!</strong>',
      };
      sgMail.send(msg);
      console.log("hello");
      callback(null, user);
    })
    .catch((err) => {
      console.log('error', error);
      console.log("hello");
      callback(err);
    })
  },

  upgrade(id, callback){
    return User.findById(id)
    .then((user) => {
      if(!user){
        return callback("User not found");
      }
      return user.update({ role: 1 })
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    });
  },

  downgrade(id, callback){
    return User.findById(id)
    .then((user) => {
      if(!user){
        return callback("User not found");
      }
      return user.update({ role: 0 })
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    });
  }


}
