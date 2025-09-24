/**
 * WelcomeMessage component displays elegant welcome content
 * Inspired by Stockholm's refined choir aesthetic
 */
export const WelcomeMessage = () => {
  return (
    <div className="text-center mt-16 max-w-2xl mx-auto">
      <h2 className="heading-results mb-6">Upptäck körmusik</h2>
      <p className="text-body mb-8 leading-relaxed">
        Utforska en värld av körmusik från klassiska mästerverk till moderna kompositioner. 
        Sök efter titel, kompositör eller använd filter för att hitta perfekta stycken för din kör.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="p-4">
          <h3 className="text-body font-semibold mb-2">Högkvalitativa noter</h3>
          <p className="text-meta">Professionellt arrangerade körnotationer</p>
        </div>
        <div className="p-4">
          <h3 className="text-body font-semibold mb-2">Alla stilar</h3>
          <p className="text-meta">Från klassiskt till nutida repertoar</p>
        </div>
        <div className="p-4">
          <h3 className="text-body font-semibold mb-2">Enkla filter</h3>
          <p className="text-meta">Hitta rätt svårighetsgrad och säsong</p>
        </div>
      </div>
    </div>
  );
};
