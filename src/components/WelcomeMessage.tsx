/**
 * WelcomeMessage component displays elegant welcome content
 * Inspired by Stockholm's choir aesthetic
 */
export const WelcomeMessage = () => {
  return (
    <div className="card-elegant text-center mt-8">
      <p className="body-large mb-4">Upptäck vackra körstycken från hela världen</p>
      <p className="body-base text-secondary-600 mb-6">
        Sök efter kompositörer som "Bach", "Mozart", eller stilar som "Lucia", "Advent"
      </p>
      <div className="text-secondary-500 body-small">
        <p>✨ Högkvalitativa noter och körstycken</p>
        <p>🎼 Från klassiska mästerverk till moderna kompositioner</p>
        <p>🎵 Filtrera efter svårighetsgrad och säsong</p>
      </div>
    </div>
  );
};
