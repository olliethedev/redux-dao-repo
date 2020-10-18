# Redux DAO Repo
 This library implements Repository and Data-Assess-Object patterns to provide strict access to the Redux store.

## Installation and Setup
```bash
npm install redux-dao-repo
```
Then import the `ReduxRepository` and `Thunk` middleware. Thunk middleware is required if your DAO updates are asyncronous.
```js
import ReduxRepository from 'redux-dao-repo';
import thunkMiddleware from 'redux-thunk';
```
And finally initialize the `ReduxRepository` singleton and combine with other reducers to create your store
```js
const repo = ReduxRepository.getInstance();
repo.init(models);

const enhancer = compose(
  applyMiddleware(thunkMiddleware.withExtraArgument(initServices())),
);

const store = createStore(combineReducers({...repo.getReducers()}), {}, enhancer);
```

## Simple DAO
### Declare
Create an instance of `RepoDataModel` by providing a name and initial data to populate the state. Because this will not change we can add it to `constants.js` file for convinience.
```js
export const MODELS = Object.freeze({
  MODALS: new RepoDataModel("modals", "UPDATE_MODALS", {
    exampleModalOpen: false,
  }),
});
```
Add this model to `ReduxRepository` during the initialization step
```js
const repo = ReduxRepository.getInstance();
repo.init([MODELS.MODALS]);
```
### Observe and Mutate
Now in your react component you can observe the changes and mutate the state data.
```js
const Modals = () => {
  const [modals, updateModals] = MODELS.MODALS.useRepoDataModel();
  return (
    <div>
      {modals.exampleModalOpen && (
        <div className="modal">Example Modal Title</div>
      )}
      <button
        onClick={() =>
          updateModals({
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

## Complex DAO
### Inherit
First inherit `RepoDataModel` class and add a thunk function. In our example we add `fetchUserInfo()`. Once you are happy with the thunk function you can create your own react hook function to make it easy to observe changes from UI component. 
```js
import { RepoDataModel } from "redux-dao-repo";
import { DataModel } from "redux-dao-repo";

export default class UserRepoModel extends RepoDataModel {
  fetchUserInfo = () => async (dispatch, getState, { apiService }) => {
    const { user } = getState();
    dispatch(
      this.createAction(
        user?.data ? new DataModel(user.data, true) : DataModel.initLoading()
      )
    );
    try {
      const resp = await apiService.fetchUserInfo();
      dispatch(this.createAction(new DataModel(resp)));
    } catch (ex) {
      console.trace(ex);
      dispatch(
        this.createAction(DataModel.error(0, ex.message))
      );
    }
  };
  useUserRepoModel() {
    const [user, updateUser, dispatch] = this.useRepoDataModel();
    const fetchUserInfo = () => {
      return dispatch(this.fetchUserInfo());
    };
    return [user, fetchUserInfo];
  }
}
```
### Declare
```js
Create an instance of our custom DAO `UserRepoModel`. Because this will not change we can add it to `constants.js` file for convinience.
export const MODELS = Object.freeze({
  USER: new UserRepoModel("user", "UPDATE_USER", new DataModel()),
});
```
Add this model to `ReduxRepository` during the initialization step
```js
const repo = ReduxRepository.getInstance();
repo.init([MODELS.USER]);
```
### Observe and Mutate
Now in your react component you can observe the changes and mutate the state data.

```js
const UserInfo = () => {
  const [user, fetchUserInfo] = MODELS.USER.useUserRepoModel();
  return (
    <div>
      {user.loading && "User data loading..."}
      {user.error && "Failed loading user info!"}
      {user.data && `User's first name is ${user.data.firstName}`}
      <br />
      <button onClick={() => fetchUserInfo()}>Fetch UserData</button>
    </div>
  );
};
```