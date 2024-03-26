"use client";
import React, { FormEvent, FormEventHandler, useEffect } from "react";

export const Chatbot = () => {
  const [message, setMessage] = React.useState("");
  const [chatHistory, setChatHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [suggestedQuestions] = React.useState([
    "What is snippets?",
    "What are community standups?",
  ]);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [streamedResponse, setStreamedResponse] = React.useState('');

  const extractTextAndSource = (inputText: string) => {
    const match = /\[(.*?)\]/.exec(inputText);
    if (match) {
      const source = match[1];
      const text = inputText.replace(`[${source}]`, "");
      return { text, source };
    } else {
      return { text: inputText, source: "" };
    }
  };

  const submitQuestion = async (question?: string) => {
    let questionToSubmit = message;
    if (question) {
      questionToSubmit = question;
    }

    setLoading(true);

    // Send API call to /api/chat with the question
    const response = await fetch(
      `/api/chat?question=${encodeURIComponent(questionToSubmit)}`
    );
    const body = await response.body;

    const reader = body?.pipeThrough(new TextDecoderStream()).getReader();

    // @ts-ignore
    setChatHistory((prev) => [
      ...prev,
      { user: questionToSubmit },
    ]);

    let result = '';
    while(true){
      const { value, done } = await reader!.read();
      if (done) {
        break;
      }
      result += value;
      setStreamedResponse((prev) => prev + value);
    }
    
    setStreamedResponse('');

    // Add user message and assistant response to chat history
    // @ts-ignore
    setChatHistory((prev) => [
      ...prev,
      { assistant: result },
    ]);
  
    setMessage("");
    setLoading(false);

    // Scroll to the bottom of the chat
    scrollToBottom();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    //@ts-expect-error
    submitQuestion(null);
  };

  const scrollToBottom = () => {
    const chat = document.getElementById("chat-history");
    if (chat) chat.scrollTop = chat.scrollHeight + 100;
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const closeChat = () => {
    setChatOpen(false);
  };

  const openChat = () => {
    setChatOpen(true);
    scrollToBottom();
  };

  return (
    <div>
      {chatOpen ? (
        <div
          id="chat-window"
          className="fixed bottom-4 right-4 bg-white shadow-md rounded-lg w-80"
        >
          <div
            id="top-bar"
            className="h-10 bg-blue-500 rounded-t-lg flex justify-end align-items-center"
          >
            <button
              onClick={closeChat}
              className="text-white px-3 py-2 rounded-full focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 11-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {chatHistory.length || loading ? (
            <div
              className="p-4"
              id="chat-history"
              style={{
                maxHeight: "25rem",
                minHeight: "25rem",
                overflowY: "auto",
              }}
            >
              {chatHistory.map((msg, index) => {
                const { text, source } = extractTextAndSource(msg["assistant"]);

                return (
                  <div key={index} className="mb-2">
                    {msg["user"] &&
                      <p className="text-gray-600">
                        <strong>You:</strong> {msg["user"]}
                      </p>
                    }
                    {
                      (index == chatHistory.length - 1) &&  streamedResponse &&
                      <p className="text-gray-600">
                        <strong>AI:</strong> {streamedResponse}
                      </p>
                    }
                    {msg["assistant"] &&
                      <p className="text-gray-600">
                        <strong>AI:</strong> {text}
                        <span className="text-sm underline text-blue-500">
                          {source}
                        </span>
                      </p>
                    }
                  </div>
                );
              })}
              {loading && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 italic text-gray-500">
              Ask questions and get quick answers, grounded in the content of
              this website. This is a simple example of the retrieval augmented
              generation pattern.
            </div>
          )}
          {chatHistory.length === 0 && !loading && (
            <div className="flex text-xs text-gray-700 mx-4 flex-col">
              {suggestedQuestions.map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    setMessage(item);
                    submitQuestion(item);
                  }}
                  className="cursor-pointer rounded-full bg-gray-50 p-2 border-2 mb-1"
                  style={{ width: "fit-content" }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="p-4 flex text-black">
            <input
              type="text"
              className="flex-1 rounded-lg p-2 mr-2 border border-gray-300 focus:outline-none"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div
          id="chat-bubble"
          className="fixed bottom-4 right-4 bg-blue-500 text-white w-12 h-12 flex justify-center items-center rounded-full cursor-pointer"
          onClick={openChat}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-message-square"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};
