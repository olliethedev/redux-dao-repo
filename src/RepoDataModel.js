import { useSelector, useDispatch } from "react-redux";
import ReduxUtils from "./ReduxUtils";

/**
 * Base Data Access Object.
 * Allows for an update action on the Redux state.
 * Provides hooks for React components that return state and the
 * update action.
 * Provides React components that inject the state into children
 * and the update action.
 */

export default class RepoDataModel {
  /**
   * Create a data access object.
   * @param {string} stateKey Name of the key that will be used to retrieve this state model from the Redux store
   * @param {object} initialState Object that will be used for the initial state.
   */
  constructor(stateKey, initialState) {
    this.stateKey = stateKey;
    this.updateAction = `UPDATE_${stateKey.toUpperCase()}`;
    this.initialState = initialState;
    this.updateFunctions = [];
    this.Consumer = this.ConsumerComponent.bind(this);
    this.Producer = this.ProducerComponent.bind(this);
    this.addUpdateFunction("update", this.getAction.bind(this));
    this.addUpdateFunction("reset", this.getResetAction.bind(this));
  }
  /**
   * Creates a Redux action to update this state model.
   * @param {object} newData Object that will be used for the new state.
   * @return {object} Redux action that will update the state model.
   */
  getAction(newData) {
    return ReduxUtils.createAction(this.updateAction, this.stateKey)(newData);
  }
  /**
   * Creates a redux action to reset this state model to initial state.
   * @return {object} Redux action that will update the state model.
   */
  getResetAction() {
    return this.getAction(this.initialState);
  }
  /**
   * Creates a hook to be used in a React component.
   * @return {object} Array containing state model, and the update functions.
   */
  useRepoDataModel() {
    const model = useSelector((state) => state[this.stateKey]);
    const dispatch = useDispatch();
    const updateFunctions = this.getUpdateFunctions();
    const updateDispatchFunctions = {};
    Object.keys(updateFunctions).forEach((name) => {
      updateDispatchFunctions[name] = (...params) => {
        return dispatch(updateFunctions[name](...params));
      };
    });
    return [model, updateDispatchFunctions, dispatch];
  }
  /**
   * Creates a react component that provides the state model.
   * @param {object} Props for this React component. Props object must contain child function to render the children components.
   */
  ConsumerComponent({ children }) {
    const model = useSelector((state) => state[this.stateKey]);
    return children(model);
  }
  /**
   * Creates a react component that provides the update functions.
   * @param {object} Props for this React component. Props object must contain child function to render the children components.
   */
  ProducerComponent({ children }) {
    const dispatch = useDispatch();
    const updateFunctions = this.getUpdateFunctions();
    const updateDispatchFunctions = {};
    Object.keys(updateFunctions).forEach((name) => {
      updateDispatchFunctions[name] = (...params) => {
        return dispatch(updateFunctions[name](...params));
      };
    });
    return children(updateDispatchFunctions);
  }
  /*INTERNAL*/
  /**
   * Registers update functions to be provided in the hook or Producer component.
   * @param {string} name Name of the update function.
   * @param {*} func Dispatchable update action function. Can be a redux-thunk.
   */
  addUpdateFunction(name, func) {
    this.updateFunctions.forEach((item) => {
      if (item.name === name) {
        throw new Error(`Function named '${name}' already exists`);
      }
    });
    this.updateFunctions.push({ name, func });
  }
  /**
   * Creates a json containing dispatchable update functions.
   * @return {object} Object with functions where keys are function names.
   */
  getUpdateFunctions() {
    const updateFunctionsObject = {};
    this.updateFunctions.forEach((item) => {
      updateFunctionsObject[item.name] = item.func;
    });
    return updateFunctionsObject;
  }
}
