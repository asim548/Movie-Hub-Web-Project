import React from 'react';

function SellerFooter() {
  return (
    <footer className="bg-gradient-to-b from-black to-violet-900 text-gray-200 py-4">
      <div className="container mx-auto text-center">
        <p className="text-sm font-medium">
          &copy; {new Date().getFullYear()} MovieHub. Seller Console.
        </p>
        <p className="text-xs text-violet-300/80 mt-1">Upload, manage, and monitor your movie catalog</p>
      </div>
    </footer>
  );
}

export default SellerFooter;
