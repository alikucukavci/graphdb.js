const HttpClient = require('http/http-client');
const RDFRepositoryClient = require('repository/rdf-repository-client');
const RepositoryClientConfig = require('repository/repository-client-config');
const GetStatementsPayload = require('repository/get-statements-payload');
const RDFContentType = require('http/rdf-content-type');
const httpClientStub = require('../http/http-client.stub');

jest.mock('http/http-client');

import data from './statements.data';

describe('RDFRepositoryClient - statements', () => {
  let config;
  let repository;
  const endpoints = ['http://host/repositories/repo1'];
  const headers = {};
  const contentType = '';
  const readTimeout = 1000;
  const writeTimeout = 1000;
  const retryInterval = 1000;
  const retryCount = 1;

  beforeEach(() => {
    HttpClient.mockImplementation(() => httpClientStub());

    config = new RepositoryClientConfig(endpoints, headers, contentType,
      readTimeout, writeTimeout, retryInterval, retryCount);
    repository = new RDFRepositoryClient(config);
  });

  describe('statements#get', () => {
    test('should reject with error if response fails', () => {
      repository.httpClients[0].get.mockImplementation(() => Promise.reject({response: 'Server error'}));

      const payload = new GetStatementsPayload().get();
      return expect(repository.get(payload)).rejects.toEqual({response: 'Server error'});
    });

    test('should populate http header and parameters according to provided data', () => {
      repository.httpClients[0].get.mockImplementation(() => {
        return Promise.resolve({data: ''});
      });

      const payload = new GetStatementsPayload()
        .setResponseType(RDFContentType.RDF_JSON)
        .setSubject('<http://eunis.eea.europa.eu/countries/AZ>')
        .setPredicate('<http://eunis.eea.europa.eu/rdf/schema.rdf#population>')
        .setObject('"7931000"^^http://www.w3.org/2001/XMLSchema#integer')
        .setContext('<http://example.org/graph3>')
        .setInference(true)
        .get();

      return repository.get(payload).then(() => {
        const httpGet = repository.httpClients[0].get;
        expect(httpGet).toHaveBeenCalledWith('/statements', {
          headers: {'Accept': RDFContentType.RDF_JSON},
          params: {
            context: '<http://example.org/graph3>',
            infer: true,
            obj: '"7931000"^^http://www.w3.org/2001/XMLSchema#integer',
            pred: '<http://eunis.eea.europa.eu/rdf/schema.rdf#population>',
            subj: '<http://eunis.eea.europa.eu/countries/AZ>',
            timeout: 1000
          }
        });
      });
    });

    test('should fetch and return single statement as plain string', () => {
      repository.httpClients[0].get.mockImplementation(() => Promise.resolve({
        data: data.repositories.repo1.statements.GET.single
      }));

      const payload = new GetStatementsPayload()
        .setSubject('<http://eunis.eea.europa.eu/countries/AZ>')
        .setPredicate('<http://eunis.eea.europa.eu/rdf/schema.rdf#population>')
        .setResponseType(RDFContentType.RDF_XML)
        .get();

      const expectedPayload = {
        subject: '<http://eunis.eea.europa.eu/countries/AZ>',
        predicate: '<http://eunis.eea.europa.eu/rdf/schema.rdf#population>',
        responseType: 'application/rdf+xml'
      };
      expect(payload).toEqual(expectedPayload);

      const expectedResponse = '<?xml version="1.0" encoding="UTF-8"?><rdf:RDF xmlns="http://eunis.eea.europa.eu/rdf/schema.rdf#"><rdf:Description rdf:about="http://eunis.eea.europa.eu/countries/AZ"><population rdf:datatype="http://www.w3.org/2001/XMLSchema#integer">7931000</population></rdf:Description></rdf:RDF>';
      return expect(repository.get(payload)).resolves.toEqual(expectedResponse);
    });

    test('should fetch and return all statement as plain string', () => {
      repository.httpClients[0].get.mockImplementation(() => Promise.resolve({
        data: data.repositories.repo1.statements.GET.all
      }));
      const expected = '<?xml version="1.0" encoding="UTF-8"?><rdf:RDF xmlns="http://eunis.eea.europa.eu/rdf/schema.rdf#"><rdf:Description rdf:about="http://www.w3.org/1999/02/22-rdf-syntax-ns#type"><rdf:type rdf:resource="http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"/></rdf:Description><rdf:Description rdf:about="http://www.w3.org/2000/01/rdf-schema#subPropertyOf"><rdf:type rdf:resource="http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"/><rdf:type rdf:resource="http://www.w3.org/2002/07/owl#TransitiveProperty"/></rdf:Description><rdf:Description rdf:about="http://www.w3.org/2000/01/rdf-schema#subClassOf"><rdf:type rdf:resource="http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"/><rdf:type rdf:resource="http://www.w3.org/2002/07/owl#TransitiveProperty"/></rdf:Description><rdf:Description rdf:about="http://www.w3.org/2000/01/rdf-schema#domain"><rdf:type rdf:resource="http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"/></rdf:Description></rdf:RDF>';

      const payload = new GetStatementsPayload().get();
      return expect(repository.get(payload)).resolves.toEqual(expected);
    });
  });
});