"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const summaryData = {
  tableStyles: 'w-50',
  summaryTitle: 'Summary',
  summaryStyles: 'big',
  sections: [{
    id: 0,
    sectionTitle: 'Active Lines',
    sectionTitleStyles: 'medium',
    payload: [{
      data: ['(404) 333-3234', '1'],
      styles: 'borderBottom'
    }, {
      data: ['(404) 555-1111', '1'],
      styles: 'borderBottom'
    }, {
      data: ['(404) 888-1234', '1'],
      styles: 'borderBottom'
    }, {
      data: ['Total Active Lines', '3']
    }, {
      data: ['Grand Total', '3'],
      styles: 'bold'
    }]
  }, {
    id: 1,
    sectionTitle: 'Restored Lines',
    sectionTitleStyles: 'medium',
    payload: [{
      data: ['(404) 234-1234', '+1'],
      styles: 'blue borderBottom'
    }, {
      data: ['Total Restored Lines', '+1'],
      styles: 'blue borderBottom'
    }]
  }]
};
const mapData = datum => {
  return datum.map(item => {
    if (typeof item === 'object' && item.setDangerously) {
      return /*#__PURE__*/_react.default.createElement("div", {
        dangerouslySetInnerHTML: {
          __html: item.data
        }
      });
    }
    return /*#__PURE__*/_react.default.createElement("div", null, item);
  });
};
const mapPayload = payload => {
  return payload.map(packet => {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: `payload-flex-row ${packet.styles}`
    }, mapData(packet.data)));
  });
};
const mapSections = sections => {
  return sections.map(section => {
    return /*#__PURE__*/_react.default.createElement("div", {
      key: section.id
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: section.sectionTitleStyles
    }, section.sectionTitle), /*#__PURE__*/_react.default.createElement("div", {
      className: "payload-flex-wrapper"
    }, mapPayload(section.payload)));
  });
};
const formatTelephone = n => {
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
};
const formatStatus = function () {
  let dropdownID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  let appliedType = arguments.length > 1 ? arguments[1] : undefined;
  const type = appliedType || window[window.sessionStorage?.tabId][`${dropdownID}getDropdownStatusValues`] && window[window.sessionStorage?.tabId][`${dropdownID}getDropdownStatusValues`].status || undefined;
  switch (type) {
    case 'Cancel':
      return {
        title: 'Canceled',
        styles: 'red',
        sign: '-',
        type: 'Cancel'
      };
    case 'Suspend':
      return {
        title: 'Suspended',
        styles: 'yellow',
        sign: '',
        type: 'Suspend'
      };
    case 'Restore':
      return {
        title: 'Restored',
        styles: 'blue',
        sign: '+',
        type: 'Restore'
      };
    default:
      return {
        title: 'Active',
        styles: '',
        sign: '',
        type: 'Active'
      };
  }
};
const appendTotalRow = (incomingData, appendToType) => (categoryData, dropdownID) => {
  const rowToAppendInfo = formatStatus(dropdownID);
  if (rowToAppendInfo && rowToAppendInfo.type === appendToType) {
    const nItems = categoryData.length + incomingData.length;
    return [...categoryData, ...incomingData, {
      data: [`Total ${rowToAppendInfo.title} Lines `, `${rowToAppendInfo.sign}${nItems}`],
      styles: `${rowToAppendInfo.styles}`
    }];
  }
  return [...categoryData, {
    data: [`Total ${formatStatus(dropdownID, appendToType).title} Lines`, `${formatStatus(dropdownID, appendToType).sign}${categoryData.length}`],
    styles: `${formatStatus(dropdownID, appendToType).styles}`
  }];
};
const deformatTelephone = n => {
  return `${n.slice(1, 4)}${n.slice(6, 9)}${n.slice(10)}`;
};
const processDataForTable = (queryData, dropdownID) => function () {
  let incomingData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  const filterIncomingFromQueryData = queryData.filter(d => {
    return incomingData.every(item => deformatTelephone(item.telephoneNumberForIcon) !== d.telephoneNumber);
  });
  const formattedIncoming = incomingData.map(item => ({
    data: [item.telephoneNumberForIcon, `${formatStatus(dropdownID).sign}1`],
    styles: `borderBottom ${formatStatus(dropdownID).styles}`
  }));
  const processedData = window[window.sessionStorage?.tabId].dp.load({
    query: filterIncomingFromQueryData
  }).extractData({
    extract: [{
      property: 'query',
      name: 'activeLines',
      transformations: [d => {
        return d.filter(i => i.ptnStatus === 'A').map(item => ({
          data: [formatTelephone(item.telephoneNumber), '1'],
          styles: 'borderBottom'
        }));
      }, d => appendTotalRow(formattedIncoming, 'Active')(d, dropdownID)]
    }, {
      property: 'query',
      name: 'cancelledLines',
      transformations: [d => {
        return d.filter(i => i.ptnStatus === 'C').map(item => ({
          data: [formatTelephone(item.telephoneNumber), '-1'],
          styles: 'borderBottom red'
        }));
      }, d => appendTotalRow(formattedIncoming, 'Cancel')(d, dropdownID)]
    }, {
      property: 'query',
      name: 'suspendedLines',
      transformations: [d => {
        return d.filter(i => i.ptnStatus === 'S').map(item => ({
          data: [formatTelephone(item.telephoneNumber), '1'],
          styles: 'borderBottom yellow'
        }));
      }, d => appendTotalRow(formattedIncoming, 'Suspend')(d, dropdownID)]
    }, {
      property: 'query',
      name: 'restoredLines',
      transformations: [() => {
        return [];
      }, d => appendTotalRow(formattedIncoming, 'Restore')(d, dropdownID)]
    }]
  });
  return {
    tableStyles: '',
    summaryTitle: 'Summary',
    summaryStyles: 'big',
    sections: [{
      id: 'active-lines',
      sectionTitle: 'Active Lines',
      sectionTitleStyles: 'medium',
      payload: processedData.activeLines
    }, {
      id: 'cancelled-lines',
      sectionTitle: 'Canceled Lines',
      sectionTitleStyles: 'medium',
      payload: processedData.cancelledLines
    }, {
      id: 'suspended-lines',
      sectionTitle: 'Suspended Lines',
      sectionTitleStyles: 'medium',
      payload: processedData.suspendedLines
    }, {
      id: 'restored-lines',
      sectionTitle: 'Restored Lines',
      sectionTitleStyles: 'medium',
      payload: processedData.restoredLines
    }].filter(s => s.payload.length > 1)
  };
};
const SummarizeStates = _ref => {
  let {
    getID = '',
    dropdownID = ''
  } = _ref;
  const [table1Data, setTable1Data] = _react.default.useState(undefined);
  const [table2Data, setTable2Data] = _react.default.useState(undefined);
  const getData = async () => {
    const data1 = await window[window.sessionStorage?.tabId].dp.get(`${getID}subscriberLinesInitialState`);
    const data2 = await window[window.sessionStorage?.tabId].dp.get(`${getID}subscriberLinesModifiedState`);
    const dropdownData = await window[window.sessionStorage?.tabId].dp.get(`${dropdownID}dropdownPayload`);
    if (data1 && data2 && data1.sections && data2.sections) {
      setTable1Data({
        ...data1,
        summaryTitle: 'Current Total',
        summaryStyles: 'big-alt'
      });
      setTable2Data({
        ...data2,
        summaryTitle: 'Proposed Changes',
        summaryStyles: 'big-alt',
        sections: data2.sections.map(s => {
          const proposedStatus = dropdownData && dropdownData.status || '';
          if (proposedStatus.startsWith(s.sectionTitle[0])) {
            let color = '';
            try {
              color = s.payload[0].styles.split(' ')[1];
            } catch (e) {
              color = '';
            }
            return {
              ...s,
              payload: [...s.payload, {
                data: [{
                  setDangerously: true,
                  data: `<span style="font-weight: 700;">Status</span>/${proposedStatus}`
                }, {
                  setDangerously: true,
                  data: `<span style="font-weight: 700;">Reason</span>/${dropdownData.reason}`
                }],
                styles: `line--status-reason ${color}`
              }]
            };
          }
          return s;
        })
      });
    }
  };
  _react.default.useEffect(() => {
    getData();
  }, []);
  return table1Data && table2Data ? /*#__PURE__*/_react.default.createElement("div", {
    className: "comparison-tables--wrapper"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "comparison-tables--child"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: `summary-table ${table1Data.tableStyles}`
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: table1Data.summaryStyles
  }, table1Data.summaryTitle), mapSections(table1Data.sections))), /*#__PURE__*/_react.default.createElement("div", {
    className: "comparison-tables--child"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: `summary-table ${table2Data.tableStyles}`
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: table2Data.summaryStyles
  }, table2Data.summaryTitle), mapSections(table2Data.sections)))) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
};
const SummaryTable = props => {
  const queryData = props.data.data;
  const componentID = props.component.id;
  const {
    dropdownID = '',
    previousSummaryID = ''
  } = props.component.params;
  if (props.component.params.case === 'summarize-states') {
    return /*#__PURE__*/_react.default.createElement(SummarizeStates, {
      getID: previousSummaryID,
      dropdownID: dropdownID
    });
  }
  if (!queryData) {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
  }
  const [summaryTableData, setSummaryTableData] = _react.default.useState(processDataForTable(queryData, dropdownID)([]));
  _react.default.useEffect(() => {
    window[window.sessionStorage?.tabId].dp.set(`${componentID}subscriberLinesInitialState`, summaryTableData);
  }, []);
  _react.default.useEffect(() => {
    window[window.sessionStorage?.tabId][`${componentID}sendDataToSummaryTable`] = incomingData => {
      const nextData = processDataForTable(queryData, dropdownID)(incomingData);
      setSummaryTableData(nextData);
      window[window.sessionStorage?.tabId].dp.set(`${componentID}subscriberLinesModifiedState`, nextData);
    };
    return () => {
      delete window[window.sessionStorage?.tabId][`${componentID}sendDataToSummaryTable`];
    };
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: `summary-table ${summaryTableData.tableStyles}`
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: summaryTableData.summaryStyles
  }, summaryTableData.summaryTitle), mapSections(summaryTableData.sections));
};
var _default = SummaryTable;
exports.default = _default;
module.exports = exports.default;