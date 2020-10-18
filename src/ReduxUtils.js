class ReduxUtils {
    static createAction(type, ...argNames) {
      return (...args) => {
        const action = { type };
        argNames.forEach((arg, index) => {
          action[argNames[index]] = args[index];
        });
        return action;
      };
    }
  
    static createReducer(initialState, handlers) {
      return function reducer(state = initialState, action) {
        if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
          return handlers[action.type](state, action);
        }
        return state;
      };
    }
  
    static createArrayHandler(type, name) {
      return {
        [type](state, action) {
          return [...state, ...action[name]];
        },
      };
    }
  
    static createObjectHandler(type, name) {
      return {
        [type](state, action) {
          return { ...state, ...action[name] };
        },
      };
    }
  }
  export default ReduxUtils;
  