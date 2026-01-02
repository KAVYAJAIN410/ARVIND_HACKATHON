'use client';

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';

const OCRScanner = ({ onScan, onCancel }) => {
    const webcamRef = useRef(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const captureAndScan = useCallback(async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setProcessing(true);
            setProgress(0);

            try {
                const result = await Tesseract.recognize(
                    imageSrc,
                    'eng+tam',
                    {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                setProgress(parseInt(m.progress * 100));
                            }
                        }
                    }
                );

                // Simple Regex for MRN (Medical Record Number) - e.g., AEH-12345 or just digits
                // Also look for names (capitalized words)
                const text = result.data.text;
                console.log("OCR Text:", text);

                // Heuristic extraction
                let extractedData = {
                    rawText: text,
                    mrn: null,
                    name: null
                };

                // Try to find MRN pattern (e.g., AEH followed by digits)
                const mrnMatch = text.match(/(AEH[-\s]?\d+)/i);
                if (mrnMatch) extractedData.mrn = mrnMatch[0];

                onScan(extractedData);
            } catch (err) {
                console.error(err);
                alert("OCR Failed to recognize text.");
            } finally {
                setProcessing(false);
            }
        }
    }, [webcamRef, onScan]);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-4 rounded-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-center">Scan ID Card / Prescription</h3>

                <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-4">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                    />
                    {processing && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                            <p className="font-bold text-blue-600">Processing ID... {progress}%</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={captureAndScan}
                        disabled={processing}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                    >
                        {processing ? 'Scanning...' : '📸 Capture'}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={processing}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-lg"
                    >
                        Cancel
                    </button>
                </div>

                <p className="text-xs text-center text-slate-400 mt-4">
                    Hold card steady and ensure good lighting.
                </p>
            </div>
        </div>
    );
};

export default OCRScanner;
