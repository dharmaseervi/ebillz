
const Expenses = () => {
  return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Expenses</h1>
        <p>Manage your expenses here.</p>
        {/* Add your expense management components here */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Add Expense</h2>
          {/* Form to add a new expense */}
          <form className="mt-2 space-y-4">
            <div>
              <label className="block text-gray-700">Amount</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="block text-gray-700">Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Category</label>
              <select className="w-full p-2 border border-gray-300 rounded">
                <option value="">Select category</option>
                <option value="office">Office Supplies</option>
                <option value="travel">Travel</option>
                <option value="utilities">Utilities</option>
                {/* Add more categories as needed */}
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Vendor</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter vendor"
              />
            </div>
            <div>
              <label className="block text-gray-700">Notes</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter notes"
              ></textarea>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Add Expense
            </button>
          </form>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Expense List</h2>
          {/* Expense list table or component */}
          <table className="w-full mt-2 border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Vendor</th>
                <th className="border p-2">Notes</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Render list of expenses here */}
              <tr>
                <td className="border p-2">2024-06-19</td>
                <td className="border p-2">$100</td>
                <td className="border p-2">Office Supplies</td>
                <td className="border p-2">Staples</td>
                <td className="border p-2">Bought new chairs</td>
                <td className="border p-2">
                  <button className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                </td>
              </tr>
              {/* More rows as needed */}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default Expenses;
