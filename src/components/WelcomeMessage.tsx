/**
 * WelcomeMessage component displays elegant welcome content
 * Inspired by Stockholm's refined choir aesthetic
 */
export const WelcomeMessage = () => {
  return (
    <div className="card-refined text-center mt-12 max-w-2xl mx-auto">
      <h2 className="heading-2 mb-6 text-primary-600">Upptäck vackra körstycken</h2>
      <p className="body-large mb-6 text-secondary-600 leading-relaxed">
        Utforska en värld av körmusik från klassiska mästerverk till moderna kompositioner
      </p>
      <div className="space-y-4 text-secondary-500">
        <div className="flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
          <p className="body-base">Högkvalitativa noter och körstycken</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
          <p className="body-base">Från klassiska verk till nutida kompositioner</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
          <p className="body-base">Filtrera efter svårighetsgrad och säsong</p>
        </div>
      </div>
    </div>
  );
};
