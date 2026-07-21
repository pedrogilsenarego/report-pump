/* eslint-disable @typescript-eslint/no-explicit-any */

type SendMessageProps = {
  message: string;
  from?: string;
};

// Sends the user-typed message to the administrator via the email API.
export const sendMessage = async (props: SendMessageProps): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return reject(data?.message || "Failed to send message");
      }

      return resolve();
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      reject(error.message);
    }
  });
};
