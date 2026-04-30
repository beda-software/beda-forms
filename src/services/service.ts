import { type QuestionnaireResponseFormProps } from "@beda.software/fhir-questionnaire/components";
import { success } from "@beda.software/remote-data";

export const serviceProvider: QuestionnaireResponseFormProps["serviceProvider"] = {
  service: () => Promise.resolve(success({} as any)),
};

export const sdcServiceProvider: QuestionnaireResponseFormProps["sdcServiceProvider"] = {
  saveCompletedQuestionnaireResponse: (qr) => Promise.resolve(success(qr)),
  saveInProgressQuestionnaireResponse: (qr) => Promise.resolve(success(qr)),
};
