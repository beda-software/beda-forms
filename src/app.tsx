import React, { useCallback, useEffect } from "react";
import {
  type SdcMessageType,
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
  const params = new URLSearchParams(window.location.search);
  const embeddedMode = params.get("embedded_mode");
  console.log("questionnaire in ap", questionnaire);

  const handleStatusHandshake = useCallback(() => {
    return {
      messageType: "status.handshake",
      payload: {
        embeddedMode,
      },
    };
  }, [embeddedMode]);

  const dispatchMessage = useCallback(
    (messageType: SdcMessageType) => {
      switch (messageType) {
        case "status.handshake":
          return {
            messageType: "embedded.mode",
            payload: {
              embeddedMode,
            },
          };
      }
    },
    [embeddedMode]
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // SECURITY: Always check the origin!
      // Only accept messages from the origin passed in the URL
      const params = new URLSearchParams(window.location.search);
      const expectedOrigin = params.get("messaging_origin");

      if (event.origin !== expectedOrigin) return;

      const { messageType, messageId, data } = event.data;
      console.log("Received message", event.data);

      // Handle the logic based on messageType

      // REPLY LOGIC:
      // Requirement: Reply with same messageType and responseToMessageId
      const response = {
        messageType: messageType,
        responseToMessageId: messageId, // Echo the original ID
        data: { status: "success", payload: "Hello from React!" },
      };

      // Send back to the parent window
      window.parent.postMessage(response, event.origin);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (phase === SmartMessagingPhase.Disabled) {
    return <ErrorView message="Missing SDC SWM parameters." />;
  }

  if (errorMessage) {
    return <ErrorView message={errorMessage} />;
  }

  if (!questionnaire) {
    return <div>No Questionnaire</div>;
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
