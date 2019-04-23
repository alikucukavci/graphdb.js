const ContentTypeParser = require('parser/content-type-parser');
const RdfContentType = require('http/rdf-content-type');
const Parser = require('n3').Parser;

/**
 * Parse N-Triples data to triple/quads
 * @class
 */
class NTriplesParser extends ContentTypeParser {
  /**
   * @inheritDoc
   */
  constructor(isDefault) {
    super(isDefault);

    this.parser = new Parser({
      // Not using the supported type as it is text/plain which is the default
      // content type supported by the repository but is not recognizable from
      // N3 library.
      format: 'N-Triples'
    });
  }

  /**
   * @inheritDoc
   */
  parse(content) {
    return this.parser.parse(content);
  }

  /**
   * @inheritDoc
   */
  getSupportedType() {
    return RdfContentType.N_TRIPLES;
  }
}

module.exports = NTriplesParser;
