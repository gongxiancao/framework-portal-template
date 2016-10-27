module.exports.policies = {
  '*': ['infra'],
  UserController: {
    get: ['infra']
  }
};
