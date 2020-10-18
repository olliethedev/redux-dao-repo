import ReduxUtils from "./ReduxUtils";
import * as RepoModel from "./RepoDataModel";
import * as Model from "./DataModel";
import * as AppError from "./ApiError";

let instance;
export default class ReduxRepository {
  static getInstance() {
    if (!instance) {
      instance = new ReduxRepository();
    }
    return instance;
  }
  constructor() {
    this.models = [];
    this.initialized = false;
  }

  static createModel(updateAction, stateKey, initialState) {
    return {
      updateAction,
      stateKey,
      initialState,
    };
  }

  init(models) {
    if (this.initialized) {
      throw new Error("Repository already initialized");
    }
    this.models = models;
    this.initialized = true;
  }

  getReducers() {
    if (!this.initialized) {
      throw new Error("Repository not initialized");
    }
    const out = {};
    for (let model of this.models) {
      const r = ReduxUtils.createReducer(model.initialState, {
        ...ReduxUtils.createObjectHandler(model.updateAction, model.stateKey),
      });
      out[model.stateKey] = r;
    }
    return out;
  }

  updateModelAction(stateKey, newData){
    for (let model of this.models) {
        if(model.stateKey === stateKey)
        return ReduxUtils.createAction(
            model.updateAction,
            stateKey,
          )(newData);
    }
    throw new Error("Unknown state key");
  }
}

export const RepoDataModel = RepoModel.default;
export const DataModel = Model.default;
export const ApiError = AppError.default;