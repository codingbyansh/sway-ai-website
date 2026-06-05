import React from 'react';
import { X, Copy, Trash2, Heart, MessageCircle } from 'lucide-react';
import { User } from '../types';
import { userService } from '../services/userService';
import Button from './Button';

interface SavedRepliesModalProps {
    user: User;
    onClose: () => void;
    onUpdateUser: (updatedUser: User) => void;
}

const SavedRepliesModal: React.FC<SavedRepliesModalProps> = ({ user, onClose, onUpdateUser }) => {
    const replies = user.savedReplies || [];

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const handleRemove = async (id: string) => {
        const updatedUser = await userService.removeSavedReply(user.email, id);
        if (updatedUser) {
            onUpdateUser(updatedUser);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-[100dvh] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

                <div className="relative bg-[#fafafa] dark:bg-[#0a0a0f] w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 my-8">
                    <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#12121a] rounded-t-3xl">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                                <Heart size={16} className="text-pink-600 fill-pink-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Replies</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 dark:bg-white/5 rounded-full text-gray-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-5 sm:p-6 bg-[#fafafa] dark:bg-[#0a0a0f] rounded-b-3xl">
                        {replies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle size={30} className="text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">No saved replies yet</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">When you accept a generated reply, it will be saved here so you can reuse it later.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {replies.map(reply => (
                                    <div key={reply.id} className="bg-white dark:bg-[#12121a] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md">
                                                {reply.source}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(reply.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-gray-800 dark:text-gray-100 font-medium whitespace-pre-wrap">{reply.text}</p>

                                        <div className="flex justify-end items-center space-x-2 mt-4 pt-3 border-t border-gray-50 dark:border-white/5">
                                            <button
                                                onClick={() => handleRemove(reply.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center space-x-1"
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <Button
                                                onClick={() => handleCopy(reply.text)}
                                                variant="outline"
                                                className="py-1.5 px-3 text-sm h-auto bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5"
                                            >
                                                <Copy size={16} className="mr-1.5" />
                                                Copy
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavedRepliesModal;
