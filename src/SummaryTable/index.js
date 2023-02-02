import React from 'react';
import './styles.css';

const summaryData = {
    tableStyles: 'w-50',
    summaryTitle: 'Summary',
    summaryStyles: 'big',
    sections: [
        {
            id: 0,
            sectionTitle: 'Active Lines',
            sectionTitleStyles: 'medium',
            payload: [
                {
                    data: ['(404) 333-3234', '1'],
                    styles: 'borderBottom',
                },
                {
                    data: ['(404) 555-1111', '1'],
                    styles: 'borderBottom',
                },
                {
                    data: ['(404) 888-1234', '1'],
                    styles: 'borderBottom',
                },
                {
                    data: ['Total Active Lines', '3'],
                },
                {
                    data: ['Grand Total', '3'],
                    styles: 'bold',
                },
            ],
        },
        {
            id: 1,
            sectionTitle: 'Restored Lines',
            sectionTitleStyles: 'medium',
            payload: [
                {
                    data: ['(404) 234-1234', '+1'],
                    styles: 'blue borderBottom',
                },
                {
                    data: ['Total Restored Lines', '+1'],
                    styles: 'blue borderBottom',
                },
            ],
        },
    ],
};

const mapData = (datum) => {
    return datum.map((item) => {
        if (typeof item === 'object' && item.setDangerously) {
            return <div dangerouslySetInnerHTML={{ __html: item.data }} />;
        }

        return <div>{item}</div>;
    });
};

const mapPayload = (payload) => {
    return payload.map((packet) => {
        return (
            <>
                <div className={`payload-flex-row ${packet.styles}`}>
                    {mapData(packet.data)}
                </div>
            </>
        );
    });
};

const mapSections = (sections) => {
    return sections.map((section) => {
        return (
            <div key={section.id}>
                <div className={section.sectionTitleStyles}>
                    {section.sectionTitle}
                </div>
                <div className="payload-flex-wrapper">
                    {mapPayload(section.payload)}
                </div>
            </div>
        );
    });
};

const formatTelephone = (n) => {
    return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
};

const formatStatus = (dropdownID = '', appliedType) => {
    const type =
        appliedType ||
        (window[window.sessionStorage?.tabId][`${dropdownID}getDropdownStatusValues`] &&
            window[window.sessionStorage?.tabId][`${dropdownID}getDropdownStatusValues`].status) ||
        undefined;

    switch (type) {
        case 'Cancel':
            return {
                title: 'Canceled',
                styles: 'red',
                sign: '-',
                type: 'Cancel',
            };
        case 'Suspend':
            return {
                title: 'Suspended',
                styles: 'yellow',
                sign: '',
                type: 'Suspend',
            };
        case 'Restore':
            return {
                title: 'Restored',
                styles: 'blue',
                sign: '+',
                type: 'Restore',
            };
        default:
            return {
                title: 'Active',
                styles: '',
                sign: '',
                type: 'Active',
            };
    }
};

const appendTotalRow = (incomingData, appendToType) => (
    categoryData,
    dropdownID
) => {
    const rowToAppendInfo = formatStatus(dropdownID);

    if (rowToAppendInfo && rowToAppendInfo.type === appendToType) {
        const nItems = categoryData.length + incomingData.length;
        return [
            ...categoryData,
            ...incomingData,
            {
                data: [
                    `Total ${rowToAppendInfo.title} Lines `,
                    `${rowToAppendInfo.sign}${nItems}`,
                ],
                styles: `${rowToAppendInfo.styles}`,
            },
        ];
    }

    return [
        ...categoryData,
        {
            data: [
                `Total ${formatStatus(dropdownID, appendToType).title} Lines`,
                `${formatStatus(dropdownID, appendToType).sign}${
                    categoryData.length
                }`,
            ],
            styles: `${formatStatus(dropdownID, appendToType).styles}`,
        },
    ];
};

const deformatTelephone = (n) => {
    return `${n.slice(1, 4)}${n.slice(6, 9)}${n.slice(10)}`;
};

const processDataForTable = (queryData, dropdownID) => (incomingData = []) => {
    const filterIncomingFromQueryData = queryData.filter((d) => {
        return incomingData.every(
            (item) =>
                deformatTelephone(item.telephoneNumberForIcon) !==
                d.telephoneNumber
        );
    });

    const formattedIncoming = incomingData.map((item) => ({
        data: [
            item.telephoneNumberForIcon,
            `${formatStatus(dropdownID).sign}1`,
        ],
        styles: `borderBottom ${formatStatus(dropdownID).styles}`,
    }));

    const processedData = window[window.sessionStorage?.tabId].dp
        .load({
            query: filterIncomingFromQueryData,
        })
        .extractData({
            extract: [
                {
                    property: 'query',
                    name: 'activeLines',
                    transformations: [
                        (d) => {
                            return d
                                .filter((i) => i.ptnStatus === 'A')
                                .map((item) => ({
                                    data: [
                                        formatTelephone(item.telephoneNumber),
                                        '1',
                                    ],
                                    styles: 'borderBottom',
                                }));
                        },
                        (d) =>
                            appendTotalRow(formattedIncoming, 'Active')(
                                d,
                                dropdownID
                            ),
                    ],
                },
                {
                    property: 'query',
                    name: 'cancelledLines',
                    transformations: [
                        (d) => {
                            return d
                                .filter((i) => i.ptnStatus === 'C')
                                .map((item) => ({
                                    data: [
                                        formatTelephone(item.telephoneNumber),
                                        '-1',
                                    ],
                                    styles: 'borderBottom red',
                                }));
                        },
                        (d) =>
                            appendTotalRow(formattedIncoming, 'Cancel')(
                                d,
                                dropdownID
                            ),
                    ],
                },
                {
                    property: 'query',
                    name: 'suspendedLines',
                    transformations: [
                        (d) => {
                            return d
                                .filter((i) => i.ptnStatus === 'S')
                                .map((item) => ({
                                    data: [
                                        formatTelephone(item.telephoneNumber),
                                        '1',
                                    ],
                                    styles: 'borderBottom yellow',
                                }));
                        },
                        (d) =>
                            appendTotalRow(formattedIncoming, 'Suspend')(
                                d,
                                dropdownID
                            ),
                    ],
                },
                {
                    property: 'query',
                    name: 'restoredLines',
                    transformations: [
                        () => {
                            return [];
                        },
                        (d) =>
                            appendTotalRow(formattedIncoming, 'Restore')(
                                d,
                                dropdownID
                            ),
                    ],
                },
            ],
        });

    return {
        tableStyles: '',
        summaryTitle: 'Summary',
        summaryStyles: 'big',
        sections: [
            {
                id: 'active-lines',
                sectionTitle: 'Active Lines',
                sectionTitleStyles: 'medium',
                payload: processedData.activeLines,
            },
            {
                id: 'cancelled-lines',
                sectionTitle: 'Canceled Lines',
                sectionTitleStyles: 'medium',
                payload: processedData.cancelledLines,
            },
            {
                id: 'suspended-lines',
                sectionTitle: 'Suspended Lines',
                sectionTitleStyles: 'medium',
                payload: processedData.suspendedLines,
            },
            {
                id: 'restored-lines',
                sectionTitle: 'Restored Lines',
                sectionTitleStyles: 'medium',
                payload: processedData.restoredLines,
            },
        ].filter((s) => s.payload.length > 1),
    };
};

const SummarizeStates = ({ getID = '', dropdownID = '' }) => {
    const [table1Data, setTable1Data] = React.useState(undefined);
    const [table2Data, setTable2Data] = React.useState(undefined);
    const getData = async () => {
        const data1 = await window[window.sessionStorage?.tabId].dp.get(
            `${getID}subscriberLinesInitialState`
        );
        const data2 = await window[window.sessionStorage?.tabId].dp.get(
            `${getID}subscriberLinesModifiedState`
        );
        const dropdownData = await window[window.sessionStorage?.tabId].dp.get(
            `${dropdownID}dropdownPayload`
        );

        if (data1 && data2 && data1.sections && data2.sections) {
            setTable1Data({
                ...data1,
                summaryTitle: 'Current Total',
                summaryStyles: 'big-alt',
            });
            setTable2Data({
                ...data2,
                summaryTitle: 'Proposed Changes',
                summaryStyles: 'big-alt',
                sections: data2.sections.map((s) => {
                    const proposedStatus =
                        (dropdownData && dropdownData.status) || '';

                    if (proposedStatus.startsWith(s.sectionTitle[0])) {
                        let color = '';
                        try {
                            color = s.payload[0].styles.split(' ')[1];
                        } catch (e) {
                            color = '';
                        }

                        return {
                            ...s,
                            payload: [
                                ...s.payload,
                                {
                                    data: [
                                        {
                                            setDangerously: true,
                                            data: `<span style="font-weight: 700;">Status</span>/${proposedStatus}`,
                                        },
                                        {
                                            setDangerously: true,
                                            data: `<span style="font-weight: 700;">Reason</span>/${dropdownData.reason}`,
                                        },
                                    ],
                                    styles: `line--status-reason ${color}`,
                                },
                            ],
                        };
                    }

                    return s;
                }),
            });
        }
    };

    React.useEffect(() => {
        getData();
    }, []);

    return table1Data && table2Data ? (
        <div className="comparison-tables--wrapper">
            <div className="comparison-tables--child">
                <div className={`summary-table ${table1Data.tableStyles}`}>
                    <div className={table1Data.summaryStyles}>
                        {table1Data.summaryTitle}
                    </div>
                    {mapSections(table1Data.sections)}
                </div>
            </div>
            <div className="comparison-tables--child">
                <div className={`summary-table ${table2Data.tableStyles}`}>
                    <div className={table2Data.summaryStyles}>
                        {table2Data.summaryTitle}
                    </div>
                    {mapSections(table2Data.sections)}
                </div>
            </div>
        </div>
    ) : (
        <></>
    );
};

const SummaryTable = (props) => {
    const queryData = props.data.data;
    const componentID = props.component.id;
    const { dropdownID = '', previousSummaryID = '' } = props.component.params;
    if (props.component.params.case === 'summarize-states') {
        return (
            <SummarizeStates
                getID={previousSummaryID}
                dropdownID={dropdownID}
            />
        );
    }

    if (!queryData) {
        return <></>;
    }

    const [summaryTableData, setSummaryTableData] = React.useState(
        processDataForTable(queryData, dropdownID)([])
    );

    React.useEffect(() => {
        window[window.sessionStorage?.tabId].dp.set(
            `${componentID}subscriberLinesInitialState`,
            summaryTableData
        );
    }, []);

    React.useEffect(() => {
        window[window.sessionStorage?.tabId][`${componentID}sendDataToSummaryTable`] = (incomingData) => {
            const nextData = processDataForTable(
                queryData,
                dropdownID
            )(incomingData);
            setSummaryTableData(nextData);
            window[window.sessionStorage?.tabId].dp.set(
                `${componentID}subscriberLinesModifiedState`,
                nextData
            );
        };

        return () => {
            delete window[window.sessionStorage?.tabId][`${componentID}sendDataToSummaryTable`];
        };
    });

    return (
        <div className={`summary-table ${summaryTableData.tableStyles}`}>
            <div className={summaryTableData.summaryStyles}>
                {summaryTableData.summaryTitle}
            </div>
            {mapSections(summaryTableData.sections)}
        </div>
    );
};

export default SummaryTable;
