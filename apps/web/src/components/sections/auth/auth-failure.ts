import { ApiRequestError } from "@/services/http";

export type Failure = { fields: Record<string, string>; form?: string };

export function toFailure(error: unknown): Failure {
  if (!(error instanceof ApiRequestError))
    return { fields: {}, form: "apiErrors.INTERNAL" };
  switch (error.code) {
    case "VALIDATION_FAILED":
      return {
        fields: Object.fromEntries(
          Object.entries(error.fields ?? {}).map(([field, key]) => [
            field,
            `errors.${key}`,
          ]),
        ),
        form:
          error.fields && Object.keys(error.fields).length
            ? undefined
            : "apiErrors.VALIDATION_FAILED",
      };
    case "PHONE_TAKEN":
      return { fields: { phone: "apiErrors.PHONE_TAKEN" } };
    case "NID_TAKEN":
      return { fields: { nid: "apiErrors.NID_TAKEN" } };
    default:
      return { fields: {}, form: `apiErrors.${error.code}` };
  }
}
