const { google } = require("googleapis");

const colors = {
  //              red   green  blue
  open: [0.41, 0.93, 0.3],
  rejected: [0.03, 0.99, 0.99],
  consider: [1.0, 0.52, 0.52],
  accpeted: [1.0, 0.52, 0.52],
  deleted: [1.0, 0.52, 0.52],
  inprocess: [0.41, 0.93, 0.3],
  "-": [0.1, 0.1, 0.1],
};

module.exports = async (
  sId,
  range,
  sheetID,
  suggestionID,
  status,
  editor = null,
  statusMessage = null,
  user,
  suggestion
) => {
  // auth
  const auth = new google.auth.GoogleAuth({
    keyFile: "secret.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });

  let spreadsheetData = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId: sId,
    range: range,
  });

  let values = spreadsheetData.data.values;

  // get old line
  let editRow = null; // die reihe in der das steht
  if (status != "open") {
    let i = 1;
    values.forEach((row) => {
      if (row[0] === `#${suggestionID}`) editRow = i;
      i++;
    });
  }

  // edit old
  if (editRow) {
    let rawValues = [
      `#${suggestionID}`,
      user,
      status,
      null,
      "-",
      null,
      null,
      null,
      "-",
      null,
      "-",
      editor,
      statusMessage,
      "-",
    ];
    if (suggestion) {
      rawValues.push(suggestion);
      rawValues.push("-");
    }

    await googleSheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId: sId,
      resource: {
        requests: [
          {
            appendCells: {
              sheetId: sheetID,
              rows: [
                {
                  values: rawValues.map((v, i) => ({
                    userEnteredValue: {
                      stringValue: v,
                    },
                    userEnteredFormat: {
                      backgroundColor: {
                        red: colors[v]?.[0],
                        green: colors[v]?.[1],
                        blue: colors[v]?.[2],
                        alpha: 1,
                      },
                    },
                  })),
                },
              ],
              fields: "*",
            },
          },
        ],
      },
    });
  } else {
    let rawValues = [
      `#${suggestionID}`,
      user,
      status,
      null,
      "-",
      null,
      null,
      null,
      "-",
      null,
      "-",
      editor,
      statusMessage,
      "-",
    ];
    if (suggestion) {
      rawValues.push(suggestion);
      rawValues.push("-");
    }

    await googleSheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId: sId,
      resource: {
        requests: [
          {
            appendCells: {
              sheetId: sheetID,
              rows: [
                {
                  values: rawValues.map((v, i) => ({
                    userEnteredValue: {
                      stringValue: v,
                    },
                    userEnteredFormat: {
                      backgroundColor: {
                        red: colors[v]?.[0] || 1,
                        green: colors[v]?.[1] || 1,
                        blue: colors[v]?.[2] || 1,
                        alpha: 1,
                      },
                    },
                  })),
                },
              ],
              fields: "*",
            },
          },
        ],
      },
    });
  }
};
