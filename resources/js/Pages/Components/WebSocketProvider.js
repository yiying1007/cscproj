import { createContext, useContext, useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// 创建 WebSocket 上下文
const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [echo, setEcho] = useState(null);

    useEffect(() => {
        // 初始化 Echo 和 Pusher
        const newEcho = new Echo({
            broadcaster: "pusher",
            key: import.meta.env.VITE_PUSHER_APP_KEY,  // 从.env文件读取 Pusher Key
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER, 
            forceTLS: true,
        });

        setEcho(newEcho);

        return () => {
            newEcho.disconnect(); // 组件卸载时断开连接
        };
    }, []);

    return (
        <WebSocketContext.Provider value={echo}>
            {children}
        </WebSocketContext.Provider>
    );
};

// 自定义 Hook 供组件使用 WebSocket
export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
