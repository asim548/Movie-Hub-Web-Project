import React from 'react';

function UserFooter() {
  return (
    <footer className="bg-gradient-to-b from-violet-900 to-black text-gray-200 py-4">
      <div className="container mx-auto text-center">
        <p className="text-sm font-medium">
          &copy; {new Date().getFullYear()} MovieHub. Enjoy your stream.
        </p>
        <p className="text-xs text-violet-300/80 mt-1">Discover, watch, and review your favorite movies</p>
      </div>
    </footer>
  );
}

export default UserFooter;
