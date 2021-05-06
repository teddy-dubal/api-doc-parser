import get from "lodash.get";
import { OpenAPIV2 } from "openapi-types";
import { Field } from "../Field";
import { Resource } from "../Resource";
import { getResources } from "../utils/getResources";

export const removeTrailingSlash = (url: string): string => {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
};

export default function (
  response: OpenAPIV2.Document,
  entrypointUrl: string
): Resource[] {
  const paths = getResources(response.paths);
  const resources: Resource[] = [];

  paths.forEach((item) => {
    const name = item.replace(`/`, ``);
    const url = removeTrailingSlash(entrypointUrl) + item;
    const firstMethod = Object.keys(
      response.paths[item]
    )[0] as keyof OpenAPIV2.PathItemObject;
    const responsePathItem = (response.paths[item] as OpenAPIV2.PathItemObject)[
      firstMethod
    ] as OpenAPIV2.OperationObject;

    if (!responsePathItem.tags) {
      return;
      // throw new Error("ko"); // @TODO
    }

    const title = responsePathItem.tags[0];

    if (!response.definitions) {
      return;
      // throw new Error("ko"); // @TODO
    }

    const definition = response.definitions[title];

    if (!definition) {
      return;
      // throw new Error("ko"); // @TODO
    }

    const properties = definition.properties;

    if (!properties) {
      return;
      // throw new Error("ko"); // @TODO
    }

    const fieldNames = Object.keys(properties);
    const requiredFields = get(
      response,
      ["definitions", title, "required"],
      []
    ) as string[];

    const fields = fieldNames.map(
      (fieldName) =>
        new Field(fieldName, {
          id: null,
          range: null,
          reference: null,
          required: !!requiredFields.find((value) => value === fieldName),
          description: get(properties[fieldName], `description`, ``),
        })
    );

    resources.push(
      new Resource(name, url, {
        id: null,
        title,
        fields,
        readableFields: fields,
        writableFields: fields,
      })
    );
  });

  return resources;
}
