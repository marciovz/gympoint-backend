import User from '../models/User';

// index, show , store, update, delete

class UserController {
  async show(req, res) {
    const user = await User.findAll();
    return res.json(user);
  }
}

export default new UserController();
