/**
 * Redux store configuration
 * Manages application state with offline support
 */

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { AppState } from '../types';

// Placeholder reducers
const jobsReducer = (state = [], action: any) => state;
const engineerReducer = (state = undefined, action: any) => state;
const syncStatusReducer = (
  state = { isSyncing: false, hasUnsyncedData: false, syncErrors: [] },
  action: any
) => state;
const uiReducer = (state = { loading: false }, action: any) => state;

const rootReducer = combineReducers({
  jobs: jobsReducer,
  currentEngineer: engineerReducer,
  syncStatus: syncStatusReducer,
  ui: uiReducer,
});

export const store = createStore(rootReducer, applyMiddleware(thunk));

export type RootState = ReturnType<typeof rootReducer>;

export default store;
