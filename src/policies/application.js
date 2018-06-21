module.exports = class ApplicationPolicy {

  constructor(user, record, collaborators) {
    this.user = user;
    this.record = record;
    this.collaborators = collaborators;
  }

  _isOwner() {
    return this.record && (this.record.userId == this.user.id);
  }

  _isAdmin() {
    return this.user && this.user.role == 2;
  }

  _isPremium() {
    return this.user && this.user.role == 1;
  }

  _isStandard() {
    return this.user && this.user.role == 0;
  }

  _isCollaborator() {
    for (let i = 0; i < this.collaborators.length; i++) {
      if (this.user.id == this.collaborators[i].userId) {
        return true;
      }
    } return false;
  }

  new() {
    return this.user != null;
  }

  create() {
    return this.new();
  }

  show() {
    return true;
  }

  edit() {
    if (this.record.private == false) {
    return this.new() &&
      this.record && (this._isStandard() || this._isPremium() || this._isAdmin());
    } else if (this.record.private == true) {
      return this.new() &&
        this.record && ((this._isOwner() && this._isPremium()) || this._isCollaborator() || this._isAdmin());
    }
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update() &&
      this.record && (this._isOwner() || this._isAdmin());
  }

  showCollaboration() {
    return this.edit();
  }

}
