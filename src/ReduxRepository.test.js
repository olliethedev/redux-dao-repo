import configureMockStore from "redux-mock-store";
import ReduxRepository from "./ReduxRepository";

const mockStore = configureMockStore();

describe("ReduxRepository", () => {
  it("Should initialize repo", () => {
    const repo = new ReduxRepository();
    const mockModel = {
      updateAction: "action",
      stateKey: "key",
      initialState: {},
    };
    repo.init([mockModel]);
    expect(repo.initialized).toBe(true);
    expect(repo.getReducers()).toHaveProperty(mockModel.stateKey);
  });
  it("Should not initialize repo", () => {
    const repo = new ReduxRepository();
    expect(() => {
      repo.init();
    }).toThrow();
    expect(() => {
      repo.init([]);
    }).toThrow();
    expect(() => {
      repo.init([{ someField: "somevalue" }]);
    }).toThrow();
    expect(() => {
      repo.init([{ someField: "somevalue" }]);
    }).toThrow();
  });
  it("Should not initialize repo twice", async () => {
    const repo = new ReduxRepository();
    const mockModel = {
      updateAction: "action",
      stateKey: "key",
      initialState: {},
    };
    repo.init([mockModel]);
    expect(repo.initialized).toBe(true);
    expect(() => {
      repo.init([mockModel]);
    }).toThrow();
  });
  it("Should create action", () => {
    const repo = new ReduxRepository();
    const mockModel = {
      updateAction: "action",
      stateKey: "key",
      initialState: {},
    };
    const newState = { someNewState: "hello" };
    repo.init([mockModel]);
    const action = repo.updateModelAction(mockModel.stateKey, newState);
    expect(action).toHaveProperty("type", mockModel.updateAction);
    expect(action).toHaveProperty(mockModel.stateKey, newState);
  });
  it("Should dispatch action", () => {
    const repo = new ReduxRepository();
    const mockModel = {
      updateAction: "action",
      stateKey: "key",
      initialState: {},
    };
    const newState = { someNewState: "hello" };
    repo.init([mockModel]);
    const action = repo.updateModelAction(mockModel.stateKey, newState);
    const store = mockStore({});

    store.dispatch(action);
    store.getActions().forEach((action) => {
      expect(action).toHaveProperty("type", mockModel.updateAction);
      expect(action).toHaveProperty(mockModel.stateKey, newState);
    });
  });
});
