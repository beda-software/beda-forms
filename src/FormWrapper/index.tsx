import classNames from "classnames";
import type { QuestionnaireResponse } from "fhir/r4b";
import type { ReactElement } from "react";
import type { GroupItemProps, GroupItemComponent } from "sdc-qrf";

import type { FormWrapperProps } from "@beda.software/fhir-questionnaire/components";
import type { RemoteDataResult } from "@beda.software/remote-data";

import s from "./FormWrapper.module.scss";
import { Group } from "@beda.software/web-item-controls/controls";
import { Button } from "antd";

export const groupComponent: GroupItemComponent = Group;

export function GroupItemComponent(itemProps: GroupItemProps) {
  const Control = groupComponent;

  return <Control {...itemProps} />;
}

export function FormWrapper(
  props: FormWrapperProps & {
    onCancel?: () => void;
    onSaveDraft?: (
      questionnaireResponse: QuestionnaireResponse
    ) => Promise<RemoteDataResult<QuestionnaireResponse>>;
    saveButtonTitle?: string | ReactElement;
  }
) {
  const { handleSubmit, items } = props;

  return (
    <form
      onSubmit={async (event) => {
        await handleSubmit(event);
      }}
      className={classNames(s.form, "app-form")}
      noValidate
    >
      <div className={classNames(s.content, "form__content")}>{items}</div>
    </form>
  );
}
