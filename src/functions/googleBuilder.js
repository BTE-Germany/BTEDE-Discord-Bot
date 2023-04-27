const { google } = require("googleapis");

const colors = {
  //              red   green blue
  builder: [0.41, 0.93, 0.3],
  trial: [0.03, 0.99, 0.99],
  rejected: [1.0, 0.52, 0.52],
};

module.exports = async (
  sId,
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
  // role
  let role =
    federalState === "RE"
      ? "rejected"
      : federalState === "TR"
      ? "trial"
      : "builder";

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
  if (role === "builder" || role === "rejected") {
    let i = 1;
    values.forEach((row) => {
      if (row[7] === "TR" && (row[2] === mcname || row[3] === dctag))
        editRow = i;
      i++;
    });
  }

  // edit old
  if (editRow) {
    let rowData = values[editRow - 1];
    rowData[4] = creationImages;
    rowData[5] = referenceImages;
    rowData[6] = city;
    rowData[7] = federalState;
    rowData[8] = coordinates;

    await googleSheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId: sId,
      resource: {
        requests: [
          {
            updateCells: {
              rows: [
                {
                  values: rowData.map((v, i) => ({
                    userEnteredValue: {
                      stringValue: v,
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
    let d = new Date();
    let date = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;

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
                  values: [
                    date,
                    platform,
                    mcname,
                    dctag,
                    creationImages,
                    referenceImages,
                    city,
                    federalState,
                    coordinates,
                    mod,
                  ].map((v, i) => ({
                    userEnteredValue: {
                      stringValue: v,
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
