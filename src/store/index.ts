/**
 * Redux store configuration
 * Manages application state with offline support
 */

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

// Placeholder reducers
const jobsReducer = (state = [], _action: Record<string, unknown>) => state;
const engineerReducer = (state = undefined, _action: Record<string, unknown>) => state;
const syncStatusReducer = (
  state = { isSyncing: false, hasUnsyncedData: false, syncErrors: [] },
  _action: Record<string, unknown>
) => state;
const uiReducer = (state = { loading: false }, _action: Record<string, unknown>) => state;

const rootReducer = combineReducers({
  jobs: jobsReducer,
  currentEngineer: engineerReducer,
  syncStatus: syncStatusReducer,
  ui: uiReducer,
});

export const store = createStore(rootReducer, applyMiddleware(thunk));

export type RootState = ReturnType<typeof rootReducer>;

export default store;
