import Ajv, { type ValidateFunction, type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import openApiSpec from './openapi.json';

export interface ValidationResult {
  isValid: boolean;
  errors: ErrorObject[] | null;
  errorSummary: string;
}

class ContractValidator {
  private ajv: Ajv;
  private openApi: typeof openApiSpec;

  constructor() {
    this.openApi = openApiSpec;
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateFormats: true,
    });
    addFormats(this.ajv);

    // Register all component schemas as definitions
    if (this.openApi.components?.schemas) {
      for (const [name, schema] of Object.entries(this.openApi.components.schemas)) {
        this.ajv.addSchema(schema, `#/components/schemas/${name}`);
      }
    }
  }

  /**
   * Validate a payload against a component schema by name (e.g. 'CommunityGameStatusResponse')
   */
  public validateComponentSchema(schemaName: string, data: unknown): ValidationResult {
    const schemaRef = `#/components/schemas/${schemaName}`;
    const validator: ValidateFunction | undefined = this.ajv.getSchema(schemaRef);

    if (!validator) {
      throw new Error(`Schema '#/components/schemas/${schemaName}' not found in OpenAPI spec.`);
    }

    const isValid = Boolean(validator(data));
    const errors = validator.errors || null;
    const errorSummary = errors
      ? errors
          .map((e) => `${e.instancePath || '/'} ${e.message} (${JSON.stringify(e.params)})`)
          .join('; ')
      : '';

    return {
      isValid,
      errors,
      errorSummary,
    };
  }

  /**
   * Validate an API response payload against the OpenAPI path, HTTP method, and HTTP status code
   */
  public validateResponse(options: {
    path: string;
    method: 'get' | 'post' | 'put' | 'delete' | 'patch';
    statusCode?: number | string;
    body: unknown;
  }): ValidationResult {
    const { path, method, statusCode = 200, body } = options;

    const pathItem = (this.openApi.paths as Record<string, any>)[path];
    if (!pathItem) {
      throw new Error(`Path '${path}' not found in OpenAPI spec.`);
    }

    const operation = pathItem[method.toLowerCase()];
    if (!operation) {
      throw new Error(
        `Method '${method.toUpperCase()}' not found for path '${path}' in OpenAPI spec.`
      );
    }

    const response = operation.responses?.[String(statusCode)];
    if (!response) {
      throw new Error(
        `Response status '${statusCode}' not defined for ${method.toUpperCase()} ${path}.`
      );
    }

    const jsonContent = response.content?.['application/json'];
    if (!jsonContent || !jsonContent.schema) {
      throw new Error(
        `No JSON schema defined for ${method.toUpperCase()} ${path} status ${statusCode}.`
      );
    }

    const schema = jsonContent.schema;
    const validate = this.ajv.compile(schema);
    const isValid = Boolean(validate(body));
    const errors = validate.errors || null;
    const errorSummary = errors
      ? errors
          .map((e) => `${e.instancePath || '/'} ${e.message} (${JSON.stringify(e.params)})`)
          .join('; ')
      : '';

    return {
      isValid,
      errors,
      errorSummary,
    };
  }
}

export const contractValidator = new ContractValidator();
