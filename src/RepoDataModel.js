import { useSelector, useDispatch } from 'react-redux';
import ReduxUtils from './ReduxUtils';

export default class RepoDataModel {
    constructor(stateKey, updateAction, initialState){
        this.stateKey = stateKey;
        this.updateAction = updateAction;
        this.initialState = initialState;
    }
    createAction(newData){
        return ReduxUtils.createAction(
            this.updateAction,
            this.stateKey,
          )(newData);
    }
    useRepoDataModel() {
        const model = useSelector(state => state[this.stateKey]);
        const dispatch = useDispatch();
        const updateModel = (newModel) => {
            return dispatch(this.createAction(newModel));
        }
        return [model, updateModel, dispatch];

        return [{}, {}, {}]
    }
}