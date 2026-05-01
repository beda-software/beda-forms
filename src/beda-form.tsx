import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  fromQuestionnaireResponseFormData,
  type QuestionnaireResponseFormData,
} from "@beda.software/fhir-questionnaire/components";
import {
  toFirstClassExtension,
  type ItemControlGroupItemComponentMapping,
  type ItemControlQuestionItemComponentMapping,
  type QuestionItemComponentMapping,
} from "sdc-qrf";
import type { QuestionnaireContext } from "sdc-smart-web-messaging-client";
import { QuestionnaireResponseForm } from "@beda.software/fhir-questionnaire";
import { questionnaireServiceLoader } from "@beda.software/fhir-questionnaire/components";
import { success } from "@beda.software/remote-data";
import {
  AudioRecorderUploader,
  Barcode,
  BloodPressure,
  Col,
  Display,
  EditableGroup,
  Grid,
  GroupTable,
  GroupTabs,
  GroupWizard,
  GroupWizardVertical,
  GroupWizardWithTooltips,
  Gtable,
  InlineChoice,
  InlineReference,
  MainCard,
  MDEditorControl,
  PasswordInput,
  QuestionBoolean,
  QuestionChoice,
  QuestionDateTime,
  QuestionDecimal,
  QuestionEmail,
  QuestionInputInsideText,
  QuestionInteger,
  QuestionPhone,
  QuestionQuantity,
  QuestionReference,
  QuestionSlider,
  QuestionSolidRadio,
  QuestionString,
  QuestionText,
  Row,
  Section,
  SectionWithDivider,
  SubCard,
  TextWithMacroFill,
  TimeRangePickerControl,
  UploadFileControl,
} from "@beda.software/web-item-controls/controls";
import {
  AnxietyScore,
  DepressionScore,
  MarkdownCard,
  MarkdownDisplay,
} from "@beda.software/web-item-controls/readonly-controls";

import { ThemeProvider } from "../theme/ThemeProvider";

import { FormWrapper, GroupItemComponent } from "./FormWrapper";
import { Card } from "antd";
import { sdcServiceProvider, serviceProvider } from "./services/service";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { dynamicActivate } from "./services/i18n";


type BedaFormProps = {
  questionnaire: fhir4.Questionnaire;
  questionnaireResponse: fhir4.QuestionnaireResponse | null;
  context: QuestionnaireContext | null;
  onResponseChange: (response: fhir4.QuestionnaireResponse) => void;
};

function toR4bQuestionnaire(value: fhir4.Questionnaire): fhir4b.Questionnaire {
  return value as unknown as fhir4b.Questionnaire;
}

function toR4bQuestionnaireResponse(
  value: fhir4.QuestionnaireResponse
): fhir4b.QuestionnaireResponse {
  return value as unknown as fhir4b.QuestionnaireResponse;
}

function toR4QuestionnaireResponse(
  value: fhir4b.QuestionnaireResponse
): fhir4.QuestionnaireResponse {
  return value as unknown as fhir4.QuestionnaireResponse;
}

function buildLaunchContextParameters(
  context: QuestionnaireContext | null
): fhir4b.ParametersParameter[] {
  if (!context?.launchContext?.length) return [];
  return context.launchContext.map((item) => {
    if (item.contentResource) {
      return {
        name: item.name,
        resource: item.contentResource as fhir4b.FhirResource,
      };
    }
    if (item.contentReference) {
      return {
        name: item.name,
        valueReference: item.contentReference as fhir4b.Reference,
      };
    }
    return { name: item.name };
  });
}

export const BedaForm = (props: BedaFormProps) => {
  const { questionnaire, questionnaireResponse, context, onResponseChange } =
    props;

  const questionnaireRef = React.useRef(questionnaire);
  const questionnaireKeyRef = React.useRef(0);
  if (questionnaire !== questionnaireRef.current) {
    questionnaireRef.current = questionnaire;
    questionnaireKeyRef.current += 1;
  }

  const baseResponse = React.useMemo<fhir4b.QuestionnaireResponse>(
    () =>
      questionnaireResponse != null
        ? toR4bQuestionnaireResponse(questionnaireResponse)
        : {
            resourceType: "QuestionnaireResponse",
            status: "in-progress",
            item: [],
          },
    [questionnaireResponse]
  );

  const launchContextParameters = buildLaunchContextParameters(context);

  const handleEdit = React.useCallback(
    async (updatedFormData: QuestionnaireResponseFormData) => {
      const { questionnaireResponse: updatedResponse } =
        fromQuestionnaireResponseFormData(updatedFormData);
      onResponseChange(toR4QuestionnaireResponse(updatedResponse));
    },
    [onResponseChange]
  );

  const itemComponents: QuestionItemComponentMapping = useMemo(
    () => ({
      text: QuestionText,
      string: QuestionString,
      decimal: QuestionDecimal,
      integer: QuestionInteger,
      date: QuestionDateTime,
      dateTime: QuestionDateTime,
      time: QuestionDateTime,
      choice: QuestionChoice,
      "open-choice": QuestionChoice,
      boolean: QuestionBoolean,
      display: Display,
      reference: QuestionReference,
      quantity: QuestionQuantity,
      attachment: UploadFileControl,
    }),
    []
  );

  const itemControlComponents: ItemControlQuestionItemComponentMapping =
    useMemo(
      () => ({
        phoneWidget: QuestionPhone,
        email: QuestionEmail,
        passwordWidget: PasswordInput,
        slider: QuestionSlider,
        "solid-radio-button": QuestionSolidRadio,
        "inline-choice": InlineChoice,
        "inline-reference": InlineReference,
        "text-with-macro": TextWithMacroFill,
        "radio-button": InlineChoice,
        "check-box": InlineChoice,
        "input-inside-text": QuestionInputInsideText,
        "markdown-editor": MDEditorControl,
        "audio-recorder-uploader": AudioRecorderUploader,
        barcode: Barcode,
        markdown: MarkdownDisplay,
        "markdown-card": MarkdownCard,
        "reference-radio-button": InlineReference,
        "anxiety-score": AnxietyScore,
        "depression-score": DepressionScore,
      }),
      []
    );

  const groupControlComponents: ItemControlGroupItemComponentMapping = useMemo(
    () => ({
      col: Col,
      row: Row,
      gtable: Gtable,
      table: Gtable,
      grid: Grid,
      section: Section,
      "section-with-divider": SectionWithDivider,
      "main-card": MainCard,
      "sub-card": SubCard,
      "blood-pressure": BloodPressure,
      "time-range-picker": TimeRangePickerControl,
      wizard: GroupWizard,
      "wizard-with-tooltips": GroupWizardWithTooltips,
      "wizard-navigation-group": GroupWizard,
      "wizard-vertical": GroupWizardVertical,
      "group-tabs": GroupTabs,
      "group-table": GroupTable,
      "editable-group": EditableGroup,
    }),
    []
  );

  useEffect(() => {
    dynamicActivate("en");
  }, []);

  return (
    <I18nProvider i18n={i18n}>
      <ThemeProvider>
        <Card>
          <QuestionnaireResponseForm
            key={questionnaireKeyRef.current}
            questionnaireLoader={questionnaireServiceLoader(() =>
              Promise.resolve(
                success(
                  toFirstClassExtension(toR4bQuestionnaire(questionnaire))
                )
              )
            )}
            serviceProvider={serviceProvider}
            sdcServiceProvider={sdcServiceProvider}
            launchContextParameters={launchContextParameters}
            initialQuestionnaireResponse={baseResponse}
            onEdit={handleEdit}
            widgetsByQuestionType={itemComponents}
            widgetsByQuestionItemControl={itemControlComponents}
            widgetsByGroupQuestionItemControl={groupControlComponents}
            groupItemComponent={GroupItemComponent}
            FormWrapper={FormWrapper}
          />
        </Card>
      </ThemeProvider>
    </I18nProvider>
  );
};
