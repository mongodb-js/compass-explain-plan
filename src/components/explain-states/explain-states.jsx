import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ZeroState, StatusRow, ViewSwitcher } from 'hadron-react-components';
import { TextButton } from 'hadron-react-buttons';
import { ZeroGraphic } from 'components/zero-graphic';
import { ExplainBody } from 'components/explain-body';
import InsertDocumentDialog from 'components/explain-states/insert-document-dialog';

import INDEX_TYPES from 'constants/index-types';
import EXPLAIN_STATES from 'constants/explain-states';

import styles from './explain-states.less';
import './document-list.less';

/**
 * Readonly warning for the status row.
 */
const READ_ONLY_WARNING = 'Explain plans on readonly views are not supported.';

/**
 * Outdated warning for the status row.
 */
const OUTDATED_WARNING = `The explain content is outdated and no longer in sync
with the documents view. Press "Explain" again to see the explain plan for
the current query.`;

/**
 * Header for zero state.
 */
const HEADER = 'Evaluate the performance of your query';

/**
 * Additional text for zero state.
 */
const SUBTEXT = 'Explain provides key execution metrics that help diagnose slow queries and optimize index usage.';

/**
 * Link to the explain plan documentation.
 */
const DOCUMENTATION_LINK = 'https://docs.mongodb.com/compass/master/query-plan/';

const BASE_CLASS = 'document-list';
const ACTION_BAR_CLASS = `${BASE_CLASS}-action-bar`;
const CONTAINER_CLASS = `${ACTION_BAR_CLASS}-container`;
const INSERT_DATA = `btn-primary ${ACTION_BAR_CLASS}-insert-data`;
const INSERT_DATA_TITLE = `${ACTION_BAR_CLASS}-insert-data-title`;

/**
 * The ExplainStates component.
 */
class ExplainStates extends Component {
  static displayName = 'ExplainStatesComponent';

  static propTypes = {
    isEditable: PropTypes.bool.isRequired,
    openLink: PropTypes.func.isRequired,
    explain: PropTypes.shape({
      nReturned: PropTypes.number.isRequired,
      totalKeysExamined: PropTypes.number.isRequired,
      totalDocsExamined: PropTypes.number.isRequired,
      executionTimeMillis: PropTypes.number.isRequired,
      inMemorySort: PropTypes.bool.isRequired,
      indexType: PropTypes.oneOf(INDEX_TYPES).isRequired,
      index: PropTypes.object,
      viewType: PropTypes.string.isRequired,
      rawExplainObject: PropTypes.object.isRequired,
      explainState: PropTypes.string.isRequired,
      error: PropTypes.object
    }),
    fetchExplainPlan: PropTypes.func.isRequired,
    changeExplainPlanState: PropTypes.func.isRequired,
    switchToTreeView: PropTypes.func.isRequired,
    switchToJSONView: PropTypes.func.isRequired,
    query: PropTypes.any,
    treeStages: PropTypes.object.isRequired,
    appRegistry: PropTypes.object.isRequired,
    queryExecuted: PropTypes.func.isRequired,

    openInsertExplainDialog: PropTypes.func.isRequired,
    openExplainFileDialog: PropTypes.func.isRequired,
    closeInsertDocumentDialog: PropTypes.func,
    insertDocument: PropTypes.func,
    updateJsonDoc: PropTypes.func,

    explainDialog: PropTypes.shape({
      version: PropTypes.string.isRequired,
      tz: PropTypes.string,
      ns: PropTypes.string,
      insert: PropTypes.object
    })
  }

  constructor(props) {
    super(props);
    const appRegistry = props.appRegistry.localAppRegistry;
    this.queryBarRole = appRegistry.getRole('Query.QueryBar')[0];
    this.queryBar = this.queryBarRole.component;
    this.queryBarStore = appRegistry.getStore(this.queryBarRole.storeName);
    this.queryBarActions = appRegistry.getAction(this.queryBarRole.actionName);
  }

  componentDidUpdate() {
    this.props.queryExecuted();
  }

  /**
   * On view switch handler.
   *
   * @param {String} label - The label.
   */
  onViewSwitch(label) {
    if (label === 'Visual Tree') {
      this.props.switchToTreeView();
    } else if (label === 'Raw JSON') {
      this.props.switchToJSONView();
    }
  }

  /**
   * Executes the explain plan.
   */
  onExecuteExplainClicked() {
    this.props.changeExplainPlanState(EXPLAIN_STATES.EXECUTED);
    this.props.fetchExplainPlan(this.queryBarStore.state);
  }

  /**
   * Handle selection of explain plan Load Plan
   *
   * @param {String} key - Selected option from the Load Plan drop down menu.
   */
  onInsertExplainOfflineSelected(key) {
    if (key === 'insert-document') {
      this.props.openInsertExplainDialog();
    } else if (key === 'import-file') {
      this.props.openExplainFileDialog();
    }
  }

  /**
   * Checks if the zero state window should be displayed.
   *
   * @returns {Boolean}
   */
  checkIfZeroState() {
    return (
      this.props.explain.explainState === EXPLAIN_STATES.INITIAL ||
      !this.props.isEditable
    );
  }

  /**
   * Opens the documentation.
   */
  openDocumentation() {
    this.props.openLink(DOCUMENTATION_LINK);
  }

  /**
   * Render banner with information.
   *
   * @returns {React.Component} The component.
   */
  renderBanner() {
    if (!this.props.isEditable) {
      return (<StatusRow style="warning">{READ_ONLY_WARNING}</StatusRow>);
    }

    if (this.props.explain.explainState === EXPLAIN_STATES.OUTDATED) {
      return (<StatusRow style="warning">{OUTDATED_WARNING}</StatusRow>);
    }

    if (this.props.explain.error) {
      return (<StatusRow style="error">{this.props.explain.error.message}</StatusRow>);
    }
  }

  /**
   * Render the schema validation component zero state.
   *
   * @returns {React.Component} The component.
   */
  renderZeroState() {
    if (this.checkIfZeroState()) {
      return (
        <div key="zero-state" className={classnames(styles['zero-state-container'])}>
          <ZeroGraphic />
          <ZeroState header={HEADER} subtext={SUBTEXT}>
            <div className={classnames(styles['zero-state-action'])}>
              <div>
                <TextButton
                  className={`btn btn-primary btn-lg ${
                    !this.props.isEditable ? 'disabled' : ''
                  }`}
                  text="Execute Explain"
                  clickHandler={this.onExecuteExplainClicked.bind(this)} />
              </div>
              <a
                className={classnames(styles['zero-state-link'])}
                onClick={this.openDocumentation.bind(this)}
              >
                Learn more about explain plans
              </a>
            </div>
          </ZeroState>
        </div>
      );
    }
  }

  /**
   * Render ExplainPlan component content.
   *
   * @returns {React.Component} The component.
   */
  renderContent() {
    if (!this.checkIfZeroState()) {
      return (
        <ExplainBody key="explain-body" {...this.props} />
      );
    }
  }

  /**
   * Renders QueryBar component.
   *
   * @returns {React.Component} The component.
   */
  renderQueryBar() {
    return (
      <this.queryBar
        store={this.queryBarStore}
        actions={this.queryBarActions}
        buttonLabel="Explain"
        onApply={this.onExecuteExplainClicked.bind(this)}
        onReset={this.props.changeExplainPlanState.bind(this, EXPLAIN_STATES.INITIAL)}
      />
    );
  }

  /**
   * Renders ViewSwitcher component.
   *
   * @returns {React.Component} The component.
   */
  renderViewSwitcher() {
    const activeViewTypeButton = this.props.explain.viewType === 'tree'
      ? 'Visual Tree'
      : 'Raw JSON';

    return (
      <div className={classnames(styles['action-bar'])}>
        <ViewSwitcher
          label="View Details As"
          buttonLabels={['Visual Tree', 'Raw JSON']}
          activeButton={activeViewTypeButton}
          disabled={this.checkIfZeroState()}
          onClick={this.onViewSwitch.bind(this)}
        />
      </div>
    );
  }

  /**
   * Renders OptionWriteSelector component.
   *
   * @returns {React.Component} The component.
   */
  renderOptionWriteSelector() {
    const dropdownOptions = { 'import-file': 'Import Explain File', 'insert-document': 'Insert Explain From Text' };
    const OptionWriteSelector = global.hadronApp.appRegistry.
      getComponent('DeploymentAwareness.OptionWriteSelector');
    return (
      <OptionWriteSelector
        className={INSERT_DATA}
        id="insert-data-dropdown"
        isCollectionLevel
        title={<div className={`btn-primary ${INSERT_DATA_TITLE}`}><i className="fa fa-download" /><span>LOAD PLAN</span></div>}
        options={dropdownOptions}
        bsSize="xs"
        tooltipId="document-is-not-writable"
        onSelect={this.onInsertExplainOfflineSelected.bind(this)}
      />
    );
  }

  renderInsertModal() {
    return (
      <InsertDocumentDialog
        closeInsertDocumentDialog={this.props.closeInsertDocumentDialog}
        insertDocument={this.props.insertDocument}
        updateJsonDoc={this.props.updateJsonDoc}
        jsonView={this.props.explainDialog.insert.jsonView}
        version={this.props.explainDialog.version}
        tz={this.props.explainDialog.tz}
        ns={this.props.explainDialog.ns}
        {...this.props.explainDialog.insert} />
    );
  }

  /**
   * Renders ExplainPlan component.
   *
   * @returns {React.Component} The rendered component.
   */
  render() {
    return (
      [
        <div key="controls-container" className={classnames(styles['controls-container'])}>
          {this.renderBanner()}
          {this.renderQueryBar()}

          <div className={CONTAINER_CLASS}>
            <div className={ACTION_BAR_CLASS}>
              {this.renderOptionWriteSelector()}
              {this.renderViewSwitcher()}
            </div>
          </div>


        </div>,
        this.renderZeroState(),
        this.renderContent(),
        this.renderInsertModal()
      ]
    );
  }
}

export default ExplainStates;
