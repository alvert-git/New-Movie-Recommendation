import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Link } from "react-router-dom";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I can help you find movies by genre, actor, or director. What are you in the mood for?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        // Add User Message to UI
        setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
        setInput("");

        try {
            // Rasa REST channel endpoint
            const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sender: "user_1", // Needs a unique session ID in prod
                    message: userMessage,
                }),
            });

            const data = await response.json();

            if (data && data.length > 0) {
                data.forEach((botReply) => {
                    if (botReply.text || botReply.custom) {
                        setMessages((prev) => [...prev, {
                            text: botReply.text || "",
                            sender: "bot",
                            custom: botReply.custom
                        }]);
                    }
                });
            }

        } catch (error) {
            console.error("Error communicating with Rasa:", error);
            setMessages((prev) => [
                ...prev,
                { text: "Oops! My servers are currently offline. Make sure 'rasa run --enable-api --cors \"*\"' is running!", sender: "bot" },
            ]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-gray-900 border border-gray-700 w-80 sm:w-96 h-[500px] rounded-lg shadow-2xl flex flex-col overflow-hidden mb-4 mr-4 animate-in slide-in-from-bottom-5">

                    {/* Header */}
                    <div className="bg-red-600 p-4 border-b border-red-700 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <MessageSquare size={20} />
                            <h3 className="font-bold">MovieBot</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-red-700 p-1 rounded transition-colors text-white cursor-pointer">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-900 space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                                    }`}
                            >
                                {msg.text && (
                                    <div
                                        className={`p-3 rounded-2xl ${msg.sender === "user"
                                            ? "bg-red-600 text-white rounded-br-none"
                                            : "bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none"
                                            }`}
                                        style={{ whiteSpace: "pre-line" }}
                                    >
                                        {msg.text}
                                    </div>
                                )}

                                {/* Rich Media / Custom Payload for Movies */}
                                {msg.custom && msg.custom.movies && (
                                    <div className="mt-2 flex flex-col gap-2 w-full max-w-[280px]">
                                        {msg.custom.movies.map((movie, idx) => (
                                            <Link
                                                key={idx}
                                                to={`/movie/${movie.movie_id}/${encodeURIComponent(movie.title)}`}
                                                className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg shadow-md border border-gray-700 hover:border-red-500 hover:bg-gray-700 transition-all cursor-pointer"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <img
                                                    src={movie.poster_url || "https://via.placeholder.com/50x75?text=No+Image"}
                                                    alt={movie.title}
                                                    className="w-12 h-16 object-cover rounded shadow"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-white truncate">{movie.title}</h4>
                                                    <p className="text-xs text-gray-400 truncate">{movie.release_date}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-gray-800 border-t border-gray-700">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-900 text-white rounded-full px-4 py-2 border border-gray-700 focus:outline-none focus:border-red-500"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="bg-red-600 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-xl transition-transform hover:scale-105 flex items-center justify-center cursor-pointer float-right"
                >
                    <MessageSquare size={28} />
                </button>
            )}
        </div>
    );
};

export default Chatbot;
