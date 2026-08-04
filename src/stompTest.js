import { Client } from "@stomp/stompjs";

const client = new Client({
  brokerURL: "ws://localhost:8080/ws",

  reconnectDelay: 0,

  debug: (message) => {
    console.log("[STOMP]", message);
  },

  onConnect: () => {
    console.log("STOMP 연결 성공");

    client.subscribe("/topic/chat", (frame) => {
      const message = JSON.parse(frame.body);

      console.log("서버에서 받은 메시지:", message);
    });

    client.publish({
      destination: "/app/chat",
      body: JSON.stringify({
        content: "안녕하세요 처음 연결하겠습니다ㅏㅏㅏㅏㅏㅏㅏㅏ.",
      }),
    });
  },

  onStompError: (frame) => {
    console.error("STOMP 오류:", frame.headers["message"]);
    console.error(frame.body);
  },

  onWebSocketError: (error) => {
    console.error("WebSocket 오류:", error);
  },
});

client.activate();