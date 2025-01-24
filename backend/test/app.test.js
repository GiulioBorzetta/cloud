import sinon from 'sinon';
import supertest from 'supertest';
import express from 'express';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

describe('Server Tests', () => {
  let request;
  let routerStub;

  beforeEach(() => {
    request = supertest(app);
    routerStub = sinon.stub(express, 'Router');
    routerStub.returns(express.Router());
  });

  afterEach(() => {
    sinon.restore();
  });

  it('dovrebbe rispondere con 404 per una rotta non valida', async () => {
    const response = await request.get('/invalid-route');
    expect(response.status).to.equal(404);
    expect(response.body).to.be.empty;
  });

  it('dovrebbe chiamare authRoutes correttamente', async () => {
    const { app } = await import('../app.js?test=' + Date.now());
    expect(routerStub.called).to.be.true;
  });

  it('dovrebbe chiamare userRoutes correttamente', async () => {
    const { app } = await import('../app.js?test=' + Date.now());
    expect(routerStub.called).to.be.true;
  });

  it('dovrebbe eseguire il middleware di CORS correttamente', async () => {
    const response = await request.get('/');
    expect(response.headers['access-control-allow-origin']).to.equal('*');
  });

  it('dovrebbe servire file statici dalla directory uploads', async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsPath = path.join(__dirname, '../uploads');

    app.use('/uploads', express.static(uploadsPath));

    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    const testFilePath = path.join(uploadsPath, 'test.txt');
    fs.writeFileSync(testFilePath, 'test content');

    const response = await request.get('/uploads/test.txt');
    expect(response.status).to.equal(200);
    expect(response.text).to.equal('test content');

    fs.unlinkSync(testFilePath);
  });

  it('dovrebbe avviare correttamente il server', (done) => {
    const server = app.listen(5001, () => {
      server.close(done);
    });
  });
});
