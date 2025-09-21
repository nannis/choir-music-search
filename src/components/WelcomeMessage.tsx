/**
 * WelcomeMessage component displays initial welcome content
 * Provides helpful guidance for new users
 */
export const WelcomeMessage = () => {
  return (
    <div className="text-center text-secondary-600 mt-12">
      <p className="body-large">Enter a search term above to find choir music!</p>
      <p className="body-small mt-3">
        Try searching for composers like "Bach", "Mozart", or styles like "Christmas", "Latin"
      </p>
    </div>
  );
};
