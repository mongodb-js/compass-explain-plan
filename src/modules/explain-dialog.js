// import HadronDocument from 'hadron-document';
// import EJSON from 'mongodb-extjson';

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
 * Insert the document given the document in current state.
 * Parse document from Json Insert View Modal or generate object from hadron document
 * view to insert.
 */
export const insertDocument = () => {
  /* let doc;
  if (this.state.insert.jsonView) {
      doc = EJSON.parse(this.state.insert.jsonDoc);
  } else {
      doc = this.state.insert.doc.generateObject();
  }

  this.dataService.insertOne(this.state.ns, doc, {}, (error) => {
      if (error) {
      return this.setState({
          insert: {
          doc: new HadronDocument(doc),
          jsonDoc: JSON.stringify(doc),
          jsonView: this.state.insert.jsonView,
          message: error.message,
          mode: ERROR,
          isOpen: true
          }
      });
      }

      // check if the newly inserted document matches the current filter, by
      // running the same filter but targeted only to the doc's _id.
      const filter = Object.assign({}, this.state.query.filter, { _id: doc._id });
      this.dataService.count(this.state.ns, filter, {}, (err, count) => {
      if (err) {
          return this.setState({
          insert: this.getInitialInsertState()
          });
      }
      // track mode for analytics events
      const mode = this.state.insert.jsonView ? 'json' : 'default';
      this.localAppRegistry.emit('document-inserted', this.state.view, mode, false, doc);
      this.globalAppRegistry.emit('document-inserted', this.state.view, mode, false, doc);

      // count is greater than 0, if 1 then the new doc matches the filter
      if (count > 0) {
          return this.setState({
          docs: this.state.docs.concat([new HadronDocument(doc)]),
          count: this.state.count + 1,
          end: this.state.end + 1,
          insert: this.getInitialInsertState()
          });
      }
      this.setState({
          count: this.state.count + 1,
          insert: this.getInitialInsertState()
      });
      });
  });*/
};

/**
 * Insert a single document.
 */
export const insertMany = () => {
  /* const docs = EJSON.parse(this.state.insert.jsonDoc);

  this.dataService.insertMany(this.state.ns, docs, {}, (error) => {
      if (error) {
      return this.setState({
          insert: {
          doc: {},
          jsonDoc: this.state.insert.jsonDoc,
          jsonView: true,
          message: error.message,
          mode: ERROR,
          isOpen: true
          }
      });
      }
      // track mode for analytics events
      const mode = this.state.insert.jsonView ? 'json' : 'default';
      this.localAppRegistry.emit('document-inserted', this.state.view, mode, true);
      this.globalAppRegistry.emit('document-inserted', this.state.view, mode, true);

      this.state.insert = this.getInitialInsertState();
      // Since we are inserting a bunch of documents and we need to rerun all
      // the queries and counts for them, let's just refresh the whole set of
      // documents.
      this.refreshDocuments();
  });*/
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
