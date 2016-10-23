var testReport = {
  totals: [
    {
      func: 'SUM',
      name: 'SUM1',
      band: 'dataBand1',
      expression: 'row'
    }
  ],
  pages: [
    {
      marginTop: 20,
      marginRight: 20,
      marginBottom: 20,
      marginLeft: 20,
      children: [
        {
          type: 'ReportTitle',
          name: 'reportTitle1',
          height: 35,
          children: [
            {
              type: 'Text',
              left: 0,
              top: 0,
              height: 18,
              width: 100,
              text: 'Report Title'
            }
          ]
        },
        {
          type: 'GroupHeader',
          expression: 'row.toString()[0]',
          children: [
            {
              type: 'Text',
              left: 0,
              top: 0,
              text: 'GROUP BY: row.toString()[0] -> {{row.toString()[0]}}'
            }
          ],
          height: 20
        },
        {
          type: 'DataBand',
          name: 'dataBand1',
          rowCount: 10000,
          height: 30,
          children: [
            {
              type: 'Text',
              left: 0,
              top: 0,
              height: 18,
              width: 350,
              text: '{{row}} {{10*2.21}} - SUM: {{SUM1}}'
            }, {
              type: 'Text',
              left: 100,
              top: 50,
              height: 18,
              width: 300,
              border: {
                left: true,
                bottom: true,
                top: true,
                right: true,
                width: 1,
                color: '#b1b1b1'
              },
              text: 'My 2nd text object'
            }
          ]
        },
        {
          type: 'PageFooter',
          name: 'pageFooter1',
          height: 35,
          children: [
            {
              type: 'Text',
              left: 0,
              top: 0,
              height: 18,
              width: 100,
              text: 'Page Footer'
            }
          ]
        }
      ]
    }
  ]
};
