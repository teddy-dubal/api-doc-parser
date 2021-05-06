import { OpenAPIV2 } from "openapi-types";
import { Api } from "../Api";
import handleJson, { removeTrailingSlash } from "./handleJson";

export interface ParsedSwaggerDocumentation {
  api: Api;
  response: OpenAPIV2.Document;
  status: number;
}

export default function parseSwaggerDocumentation(
  entrypointUrl: string
): Promise<ParsedSwaggerDocumentation> {
  entrypointUrl = removeTrailingSlash(entrypointUrl);
  return fetch(entrypointUrl, {
    headers: { Accept: "application/vnd.swagger+json" },
  })
    .then((res) => Promise.all([res, res.json()]))
    .then(
      ([res, response]: [res: Response, response: OpenAPIV2.Document]) => {
        const title = response.info.title;
        const resources = handleJson(response, entrypointUrl);

        return Promise.resolve({
          api: new Api(entrypointUrl, { title, resources }),
          response,
          status: res.status,
        });
      },
      ([res, response]: [res: Response, response: OpenAPIV2.Document]) =>
        Promise.reject({
          api: new Api(entrypointUrl, { resources: [] }),
          response,
          status: res.status,
        })
    );
}
