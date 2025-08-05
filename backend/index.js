const express = require('express');
const cors = require('cors');

const config = require('./config/index.js');
const { generateReportData } = require('./utils/generateReportData.js');

const app = express();

const validateJwt = async (request, response, next) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response
        .status(401)
        .send('Missing or invalid Authorization header');
    }

    const token = authHeader.replace(/^Bearer /, '');

    const { jwtVerify, createRemoteJWKSet } = await import('jose');

    const jwksUrl = `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/certs`;

    const jwks = createRemoteJWKSet(new URL(jwksUrl));

    const { payload } = await jwtVerify(token, jwks, {
      issuer: [
        `${config.keycloak.url}/realms/${config.keycloak.realm}`,
        `http://localhost:8080/realms/${config.keycloak.realm}`,
        `http://keycloak:8080/realms/${config.keycloak.realm}`
      ],
      audience: config.keycloak.clientId,
    });

    request.user = payload;

    next();
  } catch (error) {
    console.error('JWT validation error:', error);
    response.status(403).send('Invalid token');
  }
};

const requireRole = (role) => {
  return (request, response, next) => {
    const user = request.user;

    if (
      Array.isArray(user?.realm_access?.roles) &&
      user.realm_access.roles.includes(role)
    ) {
      next();
    } else {
      console.log(`User does not have required role: ${role}`);
      console.log('User roles:', user?.realm_access?.roles);
      response.status(403).send('Insufficient permissions');
    }
  };
};

app.use(
  cors({
    origin: '*',
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(
  '/reports',
  validateJwt,
  requireRole('prothetic_user'),
  (request, response) => {
    try {
      response.json({
        report: generateReportData(),
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error generating reports:', error);
      response.status(500).json({ error: 'Failed to generate reports' });
    }
  },
);

app.get('/ping', (req, res) => {
  res.send('pong');
});

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
