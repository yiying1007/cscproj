import { useState } from "react";

const FilePreview = ({ file }) => {
    const [downloadUrl, setDownloadUrl] = useState(null);

    // 模拟获取文件 URL（实际应用中，你的 Laravel 服务器需要提供文件 URL）
    const handleGenerateDownloadLink = () => {
        const url = URL.createObjectURL(file); // 本地预览
        setDownloadUrl(url);
    };

    return (
        <div className="bg-green-700 text-white p-4 rounded-lg w-80 shadow-md flex flex-col">
            <div className="flex items-center">
                <img src="/word-icon.png" alt="Word Icon" className="w-8 h-8 mr-2" />
                <div className="flex-1">
                    <p className="font-semibold truncate">{file.name}</p>
                    <p className="text-sm">{(file.size / 1024).toFixed(2)} KB, {file.type}</p>
                </div>
            </div>
            <div className="flex gap-2 mt-3">
                <button
                    onClick={handleGenerateDownloadLink}
                    className="bg-white text-green-700 px-4 py-1 rounded-md flex-1 text-sm"
                >
                    Open
                </button>
                {downloadUrl && (
                    <a href={downloadUrl} download={file.name} className="flex-1">
                        <button className="bg-white text-green-700 px-4 py-1 rounded-md w-full text-sm">
                            Save As...
                        </button>
                    </a>
                )}
            </div>
        </div>
    );
};

export default FilePreview;
