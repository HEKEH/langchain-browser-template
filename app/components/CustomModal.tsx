"use client";

import { useEffect } from "react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  type: "info" | "confirm" | "input";
}

export default function CustomModal({
  isOpen,
  onClose,
  title,
  content,
  type,
}: CustomModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
        </div>

        <div className="flex justify-end gap-2">
          {type === "confirm" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // 这里可以添加确认后的回调
                  onClose();
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                确认
              </button>
            </>
          )}
          {type === "input" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // 这里可以添加提交后的回调
                  onClose();
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                提交
              </button>
            </>
          )}
          {type === "info" && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              确定
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

