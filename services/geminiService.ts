import { GoogleGenAI } from "@google/genai";
import { Coordinates, FoodSuggestion, MapSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFoodSuggestion = async (coords: Coordinates): Promise<FoodSuggestion> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Bạn là một chuyên gia ẩm thực địa phương am hiểu thời tiết.
        1. Hãy tìm thông tin thời tiết hiện tại tại tọa độ: ${coords.latitude}, ${coords.longitude}.
        2. Dựa trên NHIỆT ĐỘ và TÌNH HÌNH THỜI TIẾT (ví dụ: mưa, nắng, lạnh, nóng), hãy gợi ý MỘT món ăn phù hợp nhất để ăn vào lúc này. 
           - Nếu trời lạnh/mưa: gợi ý món nước, lẩu, nướng...
           - Nếu trời nóng: gợi ý món cuốn, salad, bún trộn, giải nhiệt...
        3. Tìm 3 quán ăn ngon/nổi tiếng gần vị trí này đang phục vụ món đó.

        Hãy trả lời bằng tiếng Việt với cấu trúc Markdown rõ ràng:
        - Tiêu đề: Tên món ăn được gợi ý (kèm emoji).
        - Lý do: Giải thích ngắn gọn tại sao chọn món này dựa trên thời tiết hiện tại (ví dụ: "Trời đang 18 độ có mưa, rất hợp làm bát phở nóng...").
        - Danh sách quán: Liệt kê 3 quán với đánh giá sao (nếu có) và địa chỉ ngắn gọn.

        Tuyệt đối không bịa đặt địa chỉ. Sử dụng công cụ Google Maps để tìm kiếm thực tế.
      `,
      config: {
        tools: [
          { googleSearch: {} }, // For weather conditions
          { googleMaps: {} }    // For nearby restaurants
        ],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: coords.latitude,
              longitude: coords.longitude
            }
          }
        }
      },
    });

    const text = response.text || "Không tìm thấy gợi ý nào.";
    
    // Extract map sources from grounding metadata
    const mapSources: MapSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
            // Sometimes search returns web results
            mapSources.push({
                title: chunk.web.title,
                uri: chunk.web.uri
            });
        }
        // Check for specific Google Maps grounding structure
        // Note: The SDK structure can vary, checking common paths
        if (chunk.groundingChunk?.web?.uri) {
             mapSources.push({
                title: chunk.groundingChunk.web.title || "Bản đồ",
                uri: chunk.groundingChunk.web.uri
            });
        }
      });
    }

    // Fallback: If no explicit chunks logic works (structure varies), try to extract URLs from text if needed, 
    // but usually groundingMetadata is reliable for tools. 
    // For gemini-2.5-flash, the grounding chunks for Maps are often embedded differently.
    // We will trust the text output mainly, but pass any found sources.

    return {
      text,
      mapSources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Không thể kết nối với đầu bếp AI. Vui lòng thử lại sau.");
  }
};
