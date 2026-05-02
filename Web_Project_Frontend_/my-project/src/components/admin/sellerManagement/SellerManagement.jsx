import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSeller, getAllSeller } from "../../../services/seller/SellerManagement";

function SellerManagement() {
  const [sellers, setSellers] = useState([]);
  const navigator = useNavigate();

  useEffect(() => {
    const getAllSellersForAdmin = async () => {
      try {
        const fetchedSellers = await getAllSeller(); 
        setSellers(fetchedSellers);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };

    getAllSellersForAdmin();
  }, []); 

  const addSellerForAdmin = () => {
    navigator('/admin/seller/add');
  };

  const deleteSellerForAdmin = async (id) => {
    try {
      await deleteSeller(id);
      setSellers((prevSellers) => prevSellers.filter(seller => seller._id !== id));
    } catch (error) {
      console.error("Error deleting seller:", error);
    }
  };

  const updateSellerForAdmin = (id) => {
    navigator('/admin/seller/update', { state: { id } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 to-black text-white p-8">
      <button 
        onClick={addSellerForAdmin}
        className="bg-violet-700 hover:bg-violet-600 text-white p-2 rounded-lg transition duration-200 mb-4"
      >
        Add Seller
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full mt-4 border border-gray-300">
          <thead>
            <tr className="bg-gradient-to-r from-violet-800 to-black text-gray-100">
              <th className="border border-gray-300 p-2 bg-black text-center">Name</th>
              <th className="border border-gray-300 p-2 bg-black text-center">Email</th>
              <th className="border border-gray-300 p-2 bg-black text-center">Role</th>
              <th className="border border-gray-300 p-2 bg-black text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller._id} className="border-b border-gray-300">
                <td className="border border-gray-300 p-2 text-center">{seller.name}</td>
                <td className="border border-gray-300 p-2 text-center">{seller.email}</td>
                <td className="border border-gray-300 p-2 text-center">{seller.role}</td>
                <td className="border border-gray-300 p-2 flex justify-evenly space-x-2">
                  <button 
                    onClick={() => updateSellerForAdmin(seller._id)}
                    className="bg-violet-700 hover:bg-violet-600 text-white px-2 py-1 rounded-lg transition duration-200"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => deleteSellerForAdmin(seller._id)}
                    className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg transition duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SellerManagement;
