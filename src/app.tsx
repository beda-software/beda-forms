import React from "react";
import {
  SmartMessagingPhase,
  useSmartMessaging,
  type SdcRequestExtractResponsePayload,
} from "sdc-smart-web-messaging-client/react";
import { ErrorView } from "./error-view";
import { BedaForm } from "./beda-form";

declare global {
  interface Window {
    __rendererMetrics?: {
      renders: number;
    };
  }
}

export const App = () => {
  const renderCountRef = React.useRef(0);
  if (import.meta.env.DEV) {
    renderCountRef.current += 1;
    window.__rendererMetrics = { renders: renderCountRef.current };
  }
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const {
    questionnaire,
    questionnaireResponse,
    context,
    phase,
    onQuestionnaireResponseChange,
  } = useSmartMessaging({
    application: {
      name: "Beda Forms",
      publisher: "Beda Software",
      version: "0.1.0",
    },
    capabilities: {
      extraction: true,
      focusChangeNotifications: false,
    },
    onRequestExtract: async () => {
      const extractResponse: SdcRequestExtractResponsePayload = {
        outcome: {
          resourceType: "OperationOutcome",
          issue: [
            {
              severity: "error",
              code: "invalid",
            },
          ],
        },
        extractedResources: [],
      };
      return Promise.resolve(extractResponse);
    },
    onError: (error) => {
      const suffix = error.messageType ? ` (${error.messageType})` : "";
      setErrorMessage(`${error.message}${suffix}`);
    },
  });

  if (phase === SmartMessagingPhase.Disabled) {
    return <ErrorView message="Missing SDC SWM parameters." />;
  }

  if (errorMessage) {
    return <ErrorView message={errorMessage} />;
  }

  if (!questionnaire) {
    return <div>Awaiting questionnaire…</div>;
  }

  return (
    <BedaForm
      questionnaire={questionnaire}
      questionnaireResponse={questionnaireResponse}
      context={context}
      onResponseChange={onQuestionnaireResponseChange}
    />
  );
};
