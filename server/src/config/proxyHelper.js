const modelProxy = (mongooseModel, mockName) => {
  return new Proxy(mongooseModel, {
    get(target, prop) {
      if (global.useMockDb) {
        const mockModel = require('./mockDb')[mockName];
        return mockModel[prop] !== undefined ? mockModel[prop] : target[prop];
      }
      return target[prop];
    },
    construct(target, argumentsList) {
      if (global.useMockDb) {
        const data = argumentsList[0] || {};
        return {
          ...data,
          save: async function() {
            const { db } = require('./mockDb');
            const collectionName = mockName === 'CalculationHistory' ? 'histories' : mockName.toLowerCase() + 's';
            const collection = db[collectionName];
            
            // Generate id if not exists
            if (!this._id) {
              this._id = Math.random().toString(36).substring(2, 9);
            }

            const idx = collection.findIndex(item => item._id === this._id || (this.userId && item.userId === this.userId));
            if (idx !== -1) {
              collection[idx] = { ...collection[idx], ...this };
            } else {
              collection.push(this);
            }
            return this;
          }
        };
      }
      return new target(...argumentsList);
    }
  });
};

module.exports = modelProxy;
