const express = require('express');
const Keycloak = require('keycloak-connect');
const cors = require('cors');

const config = require('./config/index.js');
const { generateReportData } = require('./utils/generateReportData.js');

const app = express();

const keycloak = new Keycloak(
  {},
  {
    bearerOnly: true,
    clientId: config.keycloak.clientId,
    serverUrl: config.keycloak.url,
    realm: config.keycloak.realm,
  },
);

app.use(
  cors({
    origin: '*',
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(keycloak.middleware());

app.get(
  '/reports',
  keycloak.protect((token) => {
    return token.hasRealmRole('prothetic_user');
  }),
  (_request, response) => {
    try {
      response.json({
        report: generateReportData(),
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error generating reports:', error);
      res.status(500).json({ error: 'Failed to generate reports' });
    }
  },
);

app.use((_, response, __) => {
  response.status(404).send('Not found');
});

app.use((error, _, response, __) => {
  console.error(error);

  response.status(500).send('Server error');
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
