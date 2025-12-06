
import React, { useState, useCallback } from 'react';
import { Coordinates, FoodSuggestion, AppState } from './types';
import { getFoodSuggestion } from './services/geminiService';
import { ResultView } from './components/ResultView';
import { Utensils, CloudSun, Loader } from './components/Icons';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [suggestion, setSuggestion] = useState<FoodSuggestion | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGetFood = useCallback(async () => {
    setAppState(AppState.GETTING_LOCATION);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg("Trình duyệt của bạn không hỗ trợ định vị.");
      setAppState(AppState.ERROR);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setAppState(AppState.THINKING);

        try {
          const result = await getFoodSuggestion(coords);
          setSuggestion(result);
          setAppState(AppState.SUCCESS);
        } catch (err: any) {
          setErrorMsg(err.message || "Có lỗi xảy ra khi kết nối với AI.");
          setAppState(AppState.ERROR);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Không thể lấy vị trí của bạn.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Vui lòng cho phép truy cập vị trí để ứng dụng gợi ý quán ăn gần bạn.";
        }
        setErrorMsg(msg);
        setAppState(AppState.ERROR);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return (
          <div className="text-center animate-fade-in">
            <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-orange-100 text-orange-600 rounded-full mb-6 shadow-inner">
               <Utensils className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 tracking-tight">
              Hôm nay ăn gì?
            </h1>
            <p className="text-lg text-slate-600 max-w-md mx-auto mb-10 leading-relaxed">
              Để AI chọn giúp bạn món ngon dựa trên <span className="font-semibold text-orange-600">thời tiết</span> và <span className="font-semibold text-orange-600">vị trí</span> của bạn ngay bây giờ.
            </p>
            <button
              onClick={handleGetFood}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-orange-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 hover:bg-orange-700 active:scale-95 shadow-lg shadow-orange-500/30"
            >
              <span className="mr-2">Chọn giúp tôi</span>
              <CloudSun className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        );

      case AppState.GETTING_LOCATION:
        return (
          <div className="flex flex-col items-center justify-center p-8 animate-pulse">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-slate-600">Đang xác định vị trí của bạn...</p>
          </div>
        );

      case AppState.THINKING:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
            <Loader className="w-16 h-16 text-orange-500 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">AI đang suy nghĩ...</h3>
            <p className="text-slate-500">Đang kiểm tra nhiệt độ bên ngoài và tìm các quán ngon quanh đây.</p>
          </div>
        );

      case AppState.SUCCESS:
        return (
          <ResultView 
            suggestion={suggestion} 
            onRetry={() => setAppState(AppState.IDLE)} 
          />
        );

      case AppState.ERROR:
        return (
          <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-500 rounded-full mb-4">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Úi, có lỗi rồi!</h3>
            <p className="text-slate-600 mb-6">{errorMsg}</p>
            <button
              onClick={() => setAppState(AppState.IDLE)}
              className="px-6 py-2 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
            >
              Thử lại
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {renderContent()}
      </div>
      
      {/* Footer / Credits */}
      <div className="fixed bottom-4 text-xs text-slate-400">
        Powered by Google Gemini & Maps
      </div>
    </div>
  );
}

export default App;
