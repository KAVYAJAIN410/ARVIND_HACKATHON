import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

let model = null;
let anchorEmbeddings = null;

// The "Knowledge Base" - sentences that define the semantic center of each category
const ANCHOR_SENTENCES = [
    { text: "My eye is red and very painful and swollen", category: "OPHTHALMOLOGY", severity: "high" },
    { text: "I have an eye injury something hit my eye", category: "OPHTHALMOLOGY", severity: "high" },
    { text: "My vision is cloudy and foggy like a white mist", category: "CATARACT", severity: "medium" },
    { text: "I see flashes of light and black spots floating", category: "RETINA", severity: "high" },
    { text: "I have diabetes and sugar and want to check my retina", category: "RETINA", severity: "medium" },
    { text: "Severe headache and vomiting with double vision", category: "NEURO", severity: "medium" },
    { text: "I cannot read small letters near me", category: "REFRACTION", severity: "low" },
    { text: "Blurry vision for distance objects", category: "REFRACTION", severity: "low" },
    { text: "Just a routine eye checkup general test", category: "GENERAL_CHECKUP", severity: "low" }
];

export const loadModel = async () => {
    if (model) return true;
    try {
        console.log("Loading TensorFlow.js USE Model...");
        model = await use.load();
        console.log("Model Loaded. Pre-computing anchors...");
        // Pre-compute embeddings for anchors
        const sentences = ANCHOR_SENTENCES.map(a => a.text);
        anchorEmbeddings = await model.embed(sentences);
        console.log("Anchors Cached.");
        return true;
    } catch (err) {
        console.error("Failed to load TF.js model:", err);
        return false;
    }
};

export const classifySemantic = async (text) => {
    if (!model || !anchorEmbeddings) return null;

    // 1. Embed the input text
    const inputEmbedding = await model.embed([text]);

    // 2. Calculate Cosine Similarity with all anchors
    // tf.matMul(a, b, false, true) acts as dot product if vectors are normalized
    // USE vectors are approximately normalized.
    const inputTensor = inputEmbedding;
    const anchorTensor = anchorEmbeddings;

    // Dot product: [1, 512] x [9, 512]^T -> [1, 9]
    const similarity = tf.matMul(inputTensor, anchorTensor, false, true);

    // 3. Find the best match
    const values = await similarity.data();
    const maxIndex = values.indexOf(Math.max(...values));
    const maxScore = values[maxIndex];

    // Cleanup tensors to avoid memory leaks
    inputEmbedding.dispose();
    similarity.dispose();

    // 4. Return result
    const bestAnchor = ANCHOR_SENTENCES[maxIndex];

    return {
        category: bestAnchor.category,
        severity: bestAnchor.severity,
        confidence: maxScore.toFixed(2),
        matchReason: `Semantic match with: "${bestAnchor.text}"`
    };
};
