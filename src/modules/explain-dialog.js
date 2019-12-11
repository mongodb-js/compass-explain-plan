import {
  processExplainPlan,
  explainStateChanged
} from 'modules/explain';

import EXPLAIN_STATES from 'constants/explain-states';

/**
 * The module action prefix.
 */
const PREFIX = 'explain_offline';

/**
 * Open explain offline document dialog
 */
export const OPEN_DOCUMENT_DIALOG = `${PREFIX}/OPEN_DOCUMENT_DIALOG`;

/**
 * Close explain offline document dialog
 */
export const CLOSE_DOCUMENT_DIALOG = `${PREFIX}/CLOSE_DOCUMENT_DIALOG`;

/**
 * Update JSON Document
 */
export const UPDATE_JSON_DOCUMENT = `${PREFIX}/UPDATE_JSON_DOCUMENT`;


/**
 * The list view constant.
 */
const LIST = 'List';

/**
 * Modifying constant.
 */
const MODIFYING = 'modifying';

/**
 * Get the initial state of the store.
 *
 * @returns {Object} The state.
 */
export const getInitialState = () => {
  return INITIAL_STATE;
};

/**
 * Get the initial insert state.
 *
 * @returns {Object} The initial insert state.
 */
const getInitialInsertState = () => ({
  doc: null,
  jsonDoc: null,
  message: '',
  mode: MODIFYING,
  jsonView: false,
  isOpen: false
});

/**
 * Get the initial table state.
 *
 * @returns {Object} The initial table state.
 */
const getInitialTableState = () => {
  return {
    doc: null,
    path: [],
    types: [],
    editParams: null
  };
};

const getInitialQueryState = () => {
  return {
    filter: {},
    sort: [['_id', 1]],
    limit: 0,
    skip: 0,
    maxTimeMS: 5000,
    project: null,
    collation: null
  };
};

/**
 * Insert explain document
 *
 * @returns {Function} The dispatch function.
 */
export const openInsertExplainDialog = () => {
  const insertState = {
    insert: {
      doc: {},
      jsonDoc: null,
      jsonView: true,
      message: '',
      mode: MODIFYING,
      isOpen: true
    }
  };

  return (dispatch) => {
    dispatch(openInsertExplainDialogAction(insertState));
    return;
  };
};

const openInsertExplainDialogAction = (insertState) => ({
  type: OPEN_DOCUMENT_DIALOG,
  insertState
});

const doToggleInsertExplainDialog = (state, action) => ({...state, ...action.insertState});

export const openExplainFileDialog = () => {

};

/**
 * Closes Insert Document Dialog
 *
 * @returns {Function} The dispatch function.
 */
export const closeInsertDocumentDialog = () => {
  return (dispatch) => {
    dispatch(closeInsertDocumentDialogAction(getInitialInsertState()));
  };
};

const closeInsertDocumentDialogAction = (insertInitialState) => ({
  type: CLOSE_DOCUMENT_DIALOG,
  insertState: {insert: insertInitialState}
});

/**
 * Process inserted Explain Offline plan
 * @returns {Function} The dispatch function.
 */
export const insertDocument = () => {
  return (dispatch, getState) => {
    const explainPlan = JSON.parse(getState().explainDialog.insert.jsonDoc);
    dispatch(explainStateChanged(EXPLAIN_STATES.EXECUTED));

    const state = getState();
    processExplainPlan(dispatch, state.explain, state.indexes, explainPlan);

    dispatch(closeInsertDocumentDialogAction(getInitialInsertState()));
  };
};

/**
 * As we are editing a JSON document in Insert Document Dialog, update the
 * state with the inputed json data.
 *
 * @param {String} value - JSON string we are updating.
 * @returns {Function} The dispatch function.
 */
export const updateJsonDoc = (value) => {
  const updateState = {
    insert: {
      doc: {},
      jsonDoc: value,
      jsonView: true,
      message: '',
      mode: MODIFYING,
      isOpen: true
    }
  };

  return (dispatch) => {
    dispatch(updateJsonDocAction(updateState));
    return;
  };
};

const updateJsonDocAction = (updateState) => ({
  type: UPDATE_JSON_DOCUMENT,
  updateState
});

const doUpdateJsonDoc = (state, action) => {
  return {...state, ...action.updateState};
};

export const INITIAL_STATE = {
  ns: '',
  tz: 'UTC',
  collection: '',
  error: null,
  docs: [],
  counter: 0,
  start: 0,
  version: '3.4.0',
  end: 0,
  page: 0,
  isEditable: true,
  view: LIST,
  count: 0,
  updateSuccess: null,
  updateError: null,
  insert: getInitialInsertState(),
  table: getInitialTableState(),
  query: getInitialQueryState(),
  isDataLake: false,
  isReadonly: false
};

const MAPPINGS = {
  [OPEN_DOCUMENT_DIALOG]: doToggleInsertExplainDialog,
  [CLOSE_DOCUMENT_DIALOG]: doToggleInsertExplainDialog,
  [UPDATE_JSON_DOCUMENT]: doUpdateJsonDoc
};

/**
 * Reducer function for handle state changes to status.
 *
 * @param {String} state - The status state.
 * @param {Object} action - The action.
 *
 * @returns {String} The new state.
 */
export default function reducer(state = INITIAL_STATE, action) {
  const fn = MAPPINGS[action.type];
  return fn ? fn(state, action) : state;
}
