import React from 'react';
import HealthChat from '../components/HealthChat';

const Chat = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Health AI Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized health insights and answers to your questions based
            on your medical documents. Our AI assistant analyzes your uploaded
            files to provide relevant, contextual health guidance.
          </p>
        </div>

        <HealthChat />
      </div>
    </div>
  );
};

export default Chat;
