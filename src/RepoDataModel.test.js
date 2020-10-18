import ReduxRepository from "./ReduxRepository";
import RepoDataModel from './RepoDataModel';

describe("RepoDataModel", () => {
  it("Should initialize repo with model", () => {
    const repo = new ReduxRepository();
    const mockModel = new RepoDataModel("key", 'action', {});
    repo.init([mockModel]);
    expect(repo.initialized).toBe(true);
    expect(repo.getReducers()).toHaveProperty(mockModel.stateKey);
  });
  it("Should create action with model", () => {
    const mockModel = new RepoDataModel("key", 'action', {});
    const newState = { someNewState: "hello" };
    const action = mockModel.createAction(newState);
    expect(action).toHaveProperty("type", mockModel.updateAction);
    expect(action).toHaveProperty(mockModel.stateKey, newState);
  });
});
