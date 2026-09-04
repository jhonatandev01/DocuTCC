import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, Check, X, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed PWA (standalone mode), hide or show badge
  if (isInstalled) {
    if (variant === 'banner') return null;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-700/50 ${className}`}>
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Web App Instalado</span>
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      // If browser doesn't support direct prompt (or in development iframe), show helpful modal
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className={`p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-800 to-indigo-500/15 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shrink-0 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">Instalar DocuTCC como Web App</h4>
              <p className="text-[11px] text-slate-300">Acesse offline, em tela cheia e sem barras de navegador no seu celular ou PC.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar Aplicativo</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-sm cursor-pointer ${className}`}
          title="Instalar DocuTCC como aplicativo nativo (PWA) no seu celular, tablet ou PC"
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Instalar Web App</span>
          <span className="sm:hidden">Instalar</span>
        </button>
      )}

      {/* Guide Modal for iOS Safari / Manual Installation */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  Instalar DocuTCC no Dispositivo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <p className="leading-relaxed">
                O DocuTCC é uma <strong>Progressive Web App (PWA)</strong> oficial. Você pode instalá-lo no seu celular ou computador para abrir como um aplicativo independente, com ícone próprio e inicialização rápida:
              </p>

              {/* iOS Guide */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Smartphone className="w-4 h-4" />
                  <span>No iPhone ou iPad (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                  <li>Toque no botão de <strong>Compartilhar</strong> <Share className="inline w-3 h-3 text-sky-400 mx-0.5" /> na barra inferior do Safari.</li>
                  <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="inline w-3 h-3 text-amber-400 mx-0.5" />.</li>
                  <li>Confirme o nome e toque em <strong>Adicionar</strong>. O ícone oficial do DocuTCC aparecerá no seu início.</li>
                </ol>
              </div>

              {/* Android & PC Guide */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-400">
                  <Laptop className="w-4 h-4" />
                  <span>No Android, Chrome, Edge ou Brave:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                  <li>Toque no menu de 3 pontos <strong className="text-white">(⋮)</strong> no topo do navegador.</li>
                  <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                  <li>Pronto! O app funcionará com desempenho aprimorado e suporte a cache offline.</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
