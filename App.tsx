
import React, { useState, useRef, useEffect } from 'react';
import { AnalysisState, MeetingAnalysis, Priority, View, StoredAnalysis } from './types';
import { Icons, FYO_GREEN, FYO_DARK } from './constants';
import { analyzeMeetingAudio, analyzeMeetingText } from './geminiService';

const DEMO_TRANSCRIPTION = `
Comercial: Hola Juan, ¿cómo viene la campaña de este año?
Productor: Y, está difícil. Me agarró la sequía al principio y ahora que llovió un poco estoy viendo si llego con la caja para los insumos de la fina.
Comercial: Entiendo. ¿Ya tenés los fertilizantes comprados?
Productor: Todavía no, estoy esperando a ver si bajan un poco o si consigo alguna financiación cómoda. Este año voy muy justo de caja.
Comercial: Justo fyo sacó una línea de financiación propia con canje de granos muy buena.
Productor: Ah, eso puede servir. También me preocupa el precio de la soja, viene bajando y no fijé nada todavía. Capaz más adelante fijo precio si rebota un poco.
Comercial: Deberíamos mirar alguna cobertura para asegurar un piso.
Productor: Sí, puede ser. Pasame info de eso también.
`;

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>(() => {
    const saved = localStorage.getItem('fyo_history');
    return {
      view: 'home',
      isAnalyzing: false,
      result: null,
      error: null,
      history: saved ? JSON.parse(saved) : []
    };
  });

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    localStorage.setItem('fyo_history', JSON.stringify(state.history));
  }, [state.history]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          handleAnalyzeAudio(base64Audio, 'audio/webm');
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setState(prev => ({ ...prev, view: 'recording' }));
    } catch (err) {
      setState(prev => ({ ...prev, error: "No se pudo acceder al micrófono." }));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const saveResultToHistory = (result: MeetingAnalysis) => {
    const newEntry: StoredAnalysis = {
      ...result,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      clientName: "Productor Agro" // En versión 2 se pediría al usuario
    };
    setState(prev => ({
      ...prev,
      result: result,
      history: [newEntry, ...prev.history],
      view: 'result'
    }));
  };

  const handleAnalyzeAudio = async (base64: string, mime: string) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    try {
      const result = await analyzeMeetingAudio(base64, mime);
      saveResultToHistory(result);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isAnalyzing: false, view: 'home' }));
    }
  };

  const handleDemoAnalysis = async () => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null, view: 'recording' }));
    try {
      const result = await analyzeMeetingText(DEMO_TRANSCRIPTION);
      saveResultToHistory(result);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isAnalyzing: false, view: 'home' }));
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'bg-red-100 text-red-700 border-red-200';
      case Priority.MEDIUM: return 'bg-amber-100 text-amber-700 border-amber-200';
      case Priority.LOW: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatTime = (ts: number) => {
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(ts);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => setState(prev => ({ ...prev, view: 'home', result: null }))}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm transition-transform group-hover:scale-105" style={{ backgroundColor: FYO_GREEN }}>f</div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block" style={{ color: FYO_DARK }}>Copiloto Comercial</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {state.view !== 'home' && (
              <button 
                onClick={() => setState(prev => ({ ...prev, view: 'home', result: null }))}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
              >
                <Icons.ArrowLeft className="w-4 h-4" /> Inicio
              </button>
            )}
            
            {state.view === 'home' && (
              <button 
                onClick={() => setState(prev => ({ ...prev, view: 'recording' }))}
                className="bg-[#6fb134] text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-[#5da02a] hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <Icons.Plus className="w-4 h-4" /> Nueva Reunión
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8">
        {/* HOME VIEW: History List */}
        {state.view === 'home' && !state.isAnalyzing && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">Historial de Análisis</h2>
                <p className="text-slate-500 mt-1">Monitorea las oportunidades detectadas en tus reuniones.</p>
              </div>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg text-sm font-bold shadow-inner">Recientes</button>
                <button className="px-4 py-2 text-slate-500 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all">Favoritos</button>
              </div>
            </div>

            {state.history.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.history.map((entry) => (
                  <div 
                    key={entry.id}
                    onClick={() => setState(prev => ({ ...prev, result: entry, view: 'result' }))}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-[#6fb134] hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-[#6fb134] bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-tighter">Analizado</span>
                      <span className="text-[10px] font-medium text-slate-400">{formatTime(entry.timestamp)}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-[#6fb134] transition-colors">{entry.summary}</h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed flex-grow">
                      {entry.summary}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icons.Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-slate-700">{entry.opportunities.length} Ops.</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1">Ver Reporte <Icons.Check className="w-3 h-3" /></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.History className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No hay reuniones registradas</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">Comienza grabando tu primera conversación comercial para detectar oportunidades del ecosistema fyo.</p>
                <button 
                  onClick={() => setState(prev => ({ ...prev, view: 'recording' }))}
                  className="bg-[#6fb134] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-[#5da02a] transition-all inline-flex items-center gap-2"
                >
                  <Icons.Microphone className="w-5 h-5" /> Iniciar Grabación
                </button>
              </div>
            )}
          </div>
        )}

        {/* RECORDING VIEW */}
        {state.view === 'recording' && !state.isAnalyzing && (
          <div className="max-w-2xl mx-auto text-center py-12 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#6fb134] opacity-5 rounded-full blur-3xl"></div>
              
              <h2 className="text-3xl font-black mb-4 tracking-tight" style={{ color: FYO_DARK }}>Captura Inteligente</h2>
              <p className="text-slate-500 mb-10 leading-relaxed text-lg">
                Habla con naturalidad. Nuestra IA fyo detectará intenciones de compra y necesidades de financiación.
              </p>
              
              <div className="flex flex-col gap-6 items-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition-all shadow-2xl relative group ${
                    isRecording 
                    ? 'bg-red-500 text-white scale-110' 
                    : 'bg-[#6fb134] text-white hover:bg-[#5da02a] hover:scale-105'
                  }`}
                >
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
                  )}
                  {isRecording ? <Icons.Stop className="w-10 h-10" /> : <Icons.Microphone className="w-10 h-10" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{isRecording ? 'Detener' : 'Grabar'}</span>
                </button>

                {!isRecording && (
                  <button
                    onClick={handleDemoAnalysis}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100 transition-all"
                  >
                    <Icons.Sparkles className="w-5 h-5" />
                    Simular con Reunión Demo
                  </button>
                )}
                
                {isRecording && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full border border-red-100 animate-pulse">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-sm font-bold">Grabando audio en vivo...</span>
                  </div>
                )}
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Privacidad</p>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">100% Cifrado</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Contexto</p>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">Agro Argentino</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Ecosistema</p>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">Full fyo</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setState(prev => ({ ...prev, view: 'home' }))}
              className="mt-8 text-slate-400 font-bold text-sm hover:text-slate-600 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Icons.ArrowLeft className="w-4 h-4" /> Volver al listado
            </button>
          </div>
        )}

        {state.isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-8 border-slate-100 border-t-[#6fb134] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-4 h-4 bg-[#6fb134] rounded-full animate-ping"></div>
              </div>
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-tight">IA Generativa Trabajando</h2>
            <p className="text-slate-500 max-w-md mx-auto text-lg">
              Estamos identificando oportunidades en <span className="text-[#6fb134] font-bold">Granos, Insumos y Finanzas</span>...
            </p>
          </div>
        )}

        {state.result && state.view === 'result' && !state.isAnalyzing && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Main Result Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-4 mb-2">
                 <div className="bg-green-100 p-3 rounded-2xl">
                   <Icons.History className="w-6 h-6 text-[#6fb134]" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-[#6fb134] uppercase tracking-widest">Reporte Comercial</p>
                    <h2 className="text-2xl font-black text-slate-900">Análisis del Encuentro</h2>
                 </div>
              </div>

              {/* Summary Card */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative group">
                <div className="absolute top-4 right-4 text-slate-200 group-hover:text-slate-300 transition-colors">
                  <Icons.Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: FYO_DARK }}>
                  Resumen Ejecutivo
                </h3>
                <p className="text-slate-600 leading-relaxed text-base mb-6">
                  {state.result.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {state.result.mainTopics.map((topic, i) => (
                    <span key={i} className="text-xs font-bold px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
                      #{topic}
                    </span>
                  ))}
                </div>
              </section>

              {/* Opportunities List */}
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-2">
                   <h3 className="font-black text-xl text-slate-900 tracking-tight">Oportunidades de Negocio</h3>
                   <div className="flex gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-red-400"></span>
                     <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                     <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                   </div>
                </div>
                
                {state.result.opportunities.length > 0 ? (
                  state.result.opportunities.map((opp, idx) => (
                    <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-[#6fb134]/30 hover:shadow-xl transition-all overflow-hidden flex flex-col sm:flex-row">
                      <div className={`sm:w-3 w-full ${opp.priority === Priority.HIGH ? 'bg-red-500' : opp.priority === Priority.MEDIUM ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                      <div className="p-8 flex-grow">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase tracking-tighter text-slate-400">{opp.unit}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getPriorityColor(opp.priority)}`}>
                              {opp.priority}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            Fase: {opp.suggestedTiming}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          <blockquote className="text-lg font-medium text-slate-800 leading-snug border-l-4 border-[#6fb134]/20 pl-4 py-1 italic">
                            "{opp.detectedQuote}"
                          </blockquote>
                          <p className="text-sm text-slate-500 leading-relaxed">{opp.justification}</p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                             <div className="bg-blue-600 p-1.5 rounded-lg">
                               <Icons.Plus className="w-3.5 h-3.5 text-white" />
                             </div>
                             <div>
                               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Recomendación fyo</p>
                               <p className="text-sm font-bold text-slate-800">{opp.recommendedAction}</p>
                             </div>
                          </div>
                          <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                             DERIVAR A CRM
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-100 p-12 rounded-3xl text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 italic font-medium">No se detectaron oportunidades comerciales accionables.</p>
                  </div>
                )}
              </section>
            </div>

            {/* Premium Sidebar */}
            <div className="space-y-6">
              {/* Next Best Action - Elevated Aesthetics */}
              <section className="bg-gradient-to-br from-[#1a2a10] to-[#2d421d] text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6fb134] opacity-20 rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:scale-125"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#6fb134] p-2 rounded-xl shadow-lg ring-4 ring-[#6fb134]/10">
                      <Icons.Check className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[#6fb134]">ESTRATEGIA</h3>
                  </div>
                  <h4 className="text-2xl font-black leading-[1.1] mb-8">
                    {state.result.nextBestAction}
                  </h4>
                  <button className="w-full py-4 bg-[#6fb134] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_8px_20px_rgba(111,177,52,0.4)] hover:shadow-[0_12px_24px_rgba(111,177,52,0.5)] hover:-translate-y-1 transition-all active:translate-y-0 flex items-center justify-center gap-2">
                    Ejecutar Ahora
                  </button>
                </div>
              </section>

              {/* Producer Profile */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Insights del Perfil</h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <p className="text-xs font-bold text-slate-500">Sentimiento</p>
                     <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 uppercase">{state.result.customerSentiment}</span>
                   </div>
                   <div className="space-y-2">
                     <div className="flex justify-between items-center">
                       <p className="text-xs font-bold text-slate-500">Afinidad Ecosistema</p>
                       <p className="text-xs font-black text-slate-900">85%</p>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#6fb134] w-[85%] rounded-full shadow-[0_0_8px_rgba(111,177,52,0.5)]"></div>
                     </div>
                   </div>
                   <div className="pt-4 mt-4 border-t border-slate-50">
                      <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                        Sugerencia: Este productor muestra sensibilidad al precio de insumos. Priorizar herramientas de financiación para la próxima campaña.
                      </p>
                   </div>
                </div>
              </section>

              {/* NEW PREMIUM ANALYZE BUTTON */}
              <button 
                onClick={() => setState(prev => ({ ...prev, view: 'recording', result: null }))}
                className="w-full py-5 rounded-3xl border-2 border-[#6fb134] text-[#6fb134] font-black text-sm uppercase tracking-widest hover:bg-green-50 transition-all flex items-center justify-center gap-3 group"
              >
                <Icons.Microphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Nueva Reunión
              </button>
              
              <button 
                onClick={() => setState(prev => ({ ...prev, view: 'home', result: null }))}
                className="w-full py-3 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Ver Historial
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Floating Action Button (Only on Home) */}
      {state.view === 'home' && !state.isAnalyzing && (
        <div className="fixed bottom-8 right-8">
           <button 
             onClick={() => setState(prev => ({ ...prev, view: 'recording' }))}
             className="w-16 h-16 bg-[#6fb134] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group relative"
           >
             <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <Icons.Plus className="w-8 h-8" />
           </button>
        </div>
      )}
    </div>
  );
};

export default App;
