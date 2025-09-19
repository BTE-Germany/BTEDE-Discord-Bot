const { google } = require("googleapis");
const config = require("../config");

const colors = {
  builder: [0.41, 0.93, 0.3],
  trial: [0.03, 0.99, 0.99],
  rejected: [1.0, 0.52, 0.52],
};

module.exports = async (
  spreadsheetId,
  range,
  sheetID,
  platform,
  mcname,
  dctag,
  creationImages,
  referenceImages,
  city,
  federalState,
  coordinates,
  mod
) => {
  const role =
    federalState === "RE"
      ? "rejected"
      : federalState === "TR"
      ? "trial"
      : "builder";

  const auth = new google.auth.GoogleAuth({
    keyFile: "secret.json",
    scopes: config?.services?.google?.sheetsScope || "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetData = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });

  const values = spreadsheetData.data.values || [];

  let editRow = null;
  if (role === "builder" || role === "rejected") {
    let index = 1;
    for (const row of values) {
      if (row[7] === "TR" && (row[2] === mcname || row[3] === dctag)) {
        editRow = index;
      }
      index += 1;
    }
  }

  if (editRow) {
    const rowData = values[editRow - 1];
    rowData[4] = creationImages;
    rowData[5] = referenceImages;
    rowData[6] = city;
    rowData[7] = federalState;
    rowData[8] = coordinates;

    await googleSheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId,
      resource: {
        requests: [
          {
            updateCells: {
              rows: [
                {
                  values: rowData.map((value) => ({
                    userEnteredValue: {
                      stringValue: value,
                    },
                    userEnteredFormat: {
                      backgroundColor: {
                        red: colors[role][0],
                        green: colors[role][1],
                        blue: colors[role][2],
                      },
                    },
                  })),
                },
              ],
              fields: "*",
              range: {
                sheetId: sheetID,
                startRowIndex: editRow - 1,
                endRowIndex: editRow,
              },
            },
          },
        ],
      },
    });
  } else {
    const date = new Date();
    const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

    await googleSheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId,
      resource: {
        requests: [
          {
            appendCells: {
              sheetId: sheetID,
              rows: [
                {
                  values: [
                    formattedDate,
                    platform,
                    mcname,
                    dctag,
                    creationImages,
                    referenceImages,
                    city,
                    federalState,
                    coordinates,
                    mod,
                  ].map((value) => ({
                    userEnteredValue: {
                      stringValue: value,
                    },
                    userEnteredFormat: {
                      backgroundColor: {
                        red: colors[role][0],
                        green: colors[role][1],
                        blue: colors[role][2],
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
