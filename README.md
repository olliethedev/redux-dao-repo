# Redux DAO Repo

This library implements Repository and Data-Assess-Object patterns to provide strict access to the Redux store.

## Installation and Setup

```bash
npm install redux-dao-repo
```

Then import the `ReduxRepository` and `Thunk` middleware. Thunk middleware is required if your DAO updates are asyncronous.

```js
import ReduxRepository from "redux-dao-repo";
import thunkMiddleware from "redux-thunk";
```

And finally initialize the `ReduxRepository` singleton and combine with other reducers to create your store

```js
const repo = ReduxRepository.getInstance();
repo.init(models);

const enhancer = compose(
  applyMiddleware(thunkMiddleware.withExtraArgument(initServices()))
);

const store = createStore(
  combineReducers({ ...repo.getReducers() }),
  {},
  enhancer
);
```

## Simple DAO

### Declare

Create an instance of `RepoDataModel` by providing a name and initial data to populate the state. Because this will not change we can add it to `constants.js` file for convinience.

```js
export const MODELS = Object.freeze({
  Modals: new RepoDataModel("modals", {
    exampleModalOpen: false,
  }),
});
```

Add this model to `ReduxRepository` during the initialization step

```js
const repo = ReduxRepository.getInstance();
repo.init([MODELS.Modals]);
```

### Observe and Mutate

Now in your react component you can observe the changes and mutate the state data. The hook returns two variables, first is the model itself, second is an object with an `update()` and `reset()` functions.

```js
const Modals = () => {
  const [modals, updateModals] = MODELS.Modals.useRepoDataModel();
  return (
    <div>
      {modals.exampleModalOpen && (
        <div className="modal">Example Modal Title</div>
      )}
      <button
        onClick={() =>
          updateModals.update({
            exampleModalOpen: !modals.exampleModalOpen,
          })
        }
      >
        Toggle Modals
      </button>
    </div>
  );
};
```

`update()` function will trigger redux state update of `modals` state.

`reset()` function will trigger redux state update of `modals` state to its initial state.

### Alternative Component API

Alternatively you can use `Consumer` and `Producer` components provided by the DAO.

```js
<MODELS.Modals.Consumer>
  {(modals) => (
    <div>
      <ExampleModal show={modals.exampleModalOpen} />
      <MODELS.Modals.Producer>
        {(updateModals) => (
          <button
            onClick={() => {
              updateModals.update({
                exampleModalOpen: !modals.exampleModalOpen,
              });
            }}
          >
            Toggle Modals
          </button>
        )}
      </MODELS.Modals.Producer>
    </div>
  )}
</MODELS.Modals.Consumer>
```

`Consumer` component will take a child in a form of a function, which will be invoked as the state of model changes.

`Producer` component will take a child in a form of a function, which will be invoked with an object containing model update functions.

## Complex DAO

### Inherit

First inherit `RepoDataModel` class and add a redux-thunk function. In our example we add `fetchUserInfo()`. You need to register the thunk function with the base class in order to expose it in the hooks and custom components, by calling `addUpdateFunction` in the constructor and providing function name and function reference.

```js
import { RepoDataModel } from "redux-dao-repo";
import { DataModel } from "redux-dao-repo";

export default class UserRepoModel extends RepoDataModel {
  constructor(stateKey, initialState) {
    super(stateKey, initialState);
    this.addUpdateFunction("fetch", this.fetchUserInfo.bind(this));
  }
  fetchUserInfo = () => async (dispatch, getState, { apiService }) => {
    const { user } = getState();
    dispatch(
      this.getAction(
        user?.data ? new DataModel(user.data, true) : DataModel.initLoading()
      )
    );
    try {
      const resp = await apiService.fetchUserInfo();
      dispatch(this.getAction(new DataModel(resp)));
    } catch (ex) {
      console.trace(ex);
      dispatch(this.getAction(DataModel.error(0, ex.message)));
    }
  };
}
```

### Declare

Create an instance of our custom DAO `UserRepoModel`. Because this will not change we can add it to `constants.js` file for convinience.

```js
export const MODELS = Object.freeze({
  User: new UserRepoModel("user", new DataModel()),
});
```

Add this model to `ReduxRepository` during the initialization step

```js
const repo = ReduxRepository.getInstance();
repo.init([MODELS.User]);
```

### Observe and Mutate

Now in your react component you can observe the changes and mutate the state data.

```js
const UserInfo = () => {
  const [user, fetchUserInfo] = MODELS.User.useRepoDataModel();
  return (
    <div>
      {user.loading && "User data loading..."}
      {user.error && "Failed loading user info!"}
      {user.data && `User's first name is ${user.data.firstName}`}
      <br />
      <button onClick={() => updateUser.fetch()}>Fetch UserData</button>
    </div>
  );
};
```

### Alternative Component API

Alternatively you can use `Consumer` and `Producer` components provided by the DAO.

```js
<MODELS.User.Consumer>
  {(user) => (
    <div>
      <UserInfo 
        loading={user.loading} 
        error={user.error} 
        user={user.data} />
      <MODELS.User.Producer>
        {(updateUser) => (
          <button
            onClick={() => {
              updateUser.fetch();
            }}
          >
            Fetch UserData
          </button>
        )}
      </MODELS.User.Producer>
    </div>
  )}
</MODELS.User.Consumer>
```

`Consumer` component will take a child in a form of a function, which will be invoked as the state of model changes.

`Producer` component will take a child in a form of a function, which will be invoked with an object containing model update functions.
