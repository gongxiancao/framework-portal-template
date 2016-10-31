'use strict';

var realModels = [];//_.keys(require('./MockModels'));
var act = Promise.promisify(ofa.seneca.act, {context: ofa.seneca});
function ModelFactory (language) {
  this.language = language;
}

module.exports = ModelFactory;

ModelFactory.prototype = {
  queryModels: function (models, query, options) {
    var self = this;
    return Promise.map(models, function (model) {
      return self.queryModel(model, query, options);
    }, {concurrency: 10});
  },
  queryModel: function (model, query, options) {
    var self = this;
    options = options || {};
    query = query || {};
    query.language = query.language || self.language;
    // console.log('query model: ', model, query);
    if(_.includes(realModels, model)) {
      return act({
        role: 'backend',
        cmd: model + '.query',
        where: query,
        skip: parseInt(options.skip) || 0,
        limit: parseInt(options.limit) || 10
      })
      .then(function (result) {
        // console.log('query model: ', model, query, 'result is: ', result);
        if(result.errcode) {
          return Promise.reject(new Errors[result.errcode]());
        }
        return result;
      })
      .catch(function (err) {
        return Promise.reject(err);
      });
    }
    
    var result = _.map(_.filter(MockModels[model], _.extend({language: self.language}, query)), _.clone);
    return Promise.resolve({total: result.length, items: result});
  },
  getModel: function (model, id, populates) {
    var promise;
    var self = this;
    if(_.includes(realModels, model)) {
      promise = act({
        role: 'backend',
        cmd: model + '.get',
        id: id
      })
      .then(function (result) {
        if(result.errcode) {
          return Promise.reject(new Errors[result.errcode]());
        }
        return result;
      });
    } else {
      promise = Promise.resolve(_.clone(_.find(MockModels[model], {id: id, language: self.language})));
    }
    return promise.then(function (result) {
      return self.populate(result, populates);
    });
  },
  create: function (model, item) {
    var promise;
    if(_.includes(realModels, model)) {
      promise = act({
        role: 'backend',
        cmd: model + '.create',
        model: item
      })
      .then(function (result) {
        if(result.errcode) {
          return Promise.reject(new Errors[result.errcode]());
        }
        return result;
      });
    } else {
      item = _.clone(item);
      item.id = MockModels[model].length + 1;
      MockModels[model].push(item);
      promise = Promise.resolve(item);
    }
    return promise;
  },
  populate: function (modelItem, populates) {
    if(_.isArray(modelItem)) {
      return this.populateModelItems(modelItem, populates);
    } else {
      return this.populateModelItem(modelItem, populates);
    }
  },
  populateModelItem: function (modelItem, populates) {
    var self = this;
    return Promise.map(_.keys(populates), function (field) {
      var ref = populates[field];
      if(!_.isObject(modelItem[field])) { // only if not alreay populated
        return self.getModel(ref, modelItem[field])
          .then(function (fieldVal) {
            modelItem[field] = fieldVal;
          })
          .catch(_.noop);
      }
    })
    .then(function () {
      return modelItem;
    });
  },
  populateModelItems: function (modelItems, populates) {
    var self = this;
    return Promise.map(modelItems, function (modelItem) {
      return self.populateModelItem(modelItem, populates);
    });
  },
  getContext: function () {
    var self = this;
    return self.queryModels(['SolutionCategory']) // News is just an example, should be replaced with your models
      .spread(function (solutionCategories) {
        return {
          _: _,
          homeUrl: self.language === 'ch'? '/' : self.language,
          language: self.language,
          solutionCategories: solutionCategories
        };
      });
  },
  resolveInformationUrl: function (information, category) {
    return (information.language === 'ch' ? '': information.language + '/') + category.type + '/' + information.id;
  },
  resolveCategoryUrl: function (category, categories) {
    var otherSameTypeCategory = _.find(categories, function (c) {
      return c.id !== category.id && c.type === category.type;
    });
    var url = category.type;
    if(otherSameTypeCategory) {
      url = category.type + '?category=' + category.id;
    }
    return (category.language === 'ch' ? '': category.language + '/') + url;
  },
  resolveFileUrl: function (file) {
    return '../files/' + (file || {}).path;
  }
};


